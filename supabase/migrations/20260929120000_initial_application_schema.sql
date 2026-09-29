-- Initial Finance AI App database schema.
-- This migration creates application tables only; it does not alter auth.users.

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_not_blank CHECK (
    length(btrim(name, ' ' || chr(9) || chr(10) || chr(13) || chr(12) || chr(11))) > 0
  ),
  -- Supports composite foreign keys from transactions and budgets.
  CONSTRAINT categories_id_user_key UNIQUE (id, user_id),
  CONSTRAINT categories_id_user_type_key UNIQUE (id, user_id, type)
);

CREATE UNIQUE INDEX categories_user_type_name_unique
  ON public.categories (
    user_id,
    type,
    lower(btrim(name, ' ' || chr(9) || chr(10) || chr(13) || chr(12) || chr(11)))
  );

CREATE INDEX categories_user_id_idx ON public.categories (user_id);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT transactions_category_owner_type_fkey
    FOREIGN KEY (category_id, user_id, type)
    REFERENCES public.categories (id, user_id, type)
    ON DELETE RESTRICT
);

CREATE INDEX transactions_user_id_idx ON public.transactions (user_id);
CREATE INDEX transactions_category_id_idx ON public.transactions (category_id);
CREATE INDEX transactions_user_date_idx ON public.transactions (user_id, date DESC);

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  month DATE NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT budgets_category_owner_fkey
    FOREIGN KEY (category_id, user_id)
    REFERENCES public.categories (id, user_id)
    ON DELETE RESTRICT,
  CONSTRAINT budgets_user_category_month_key UNIQUE (user_id, category_id, month)
);

CREATE INDEX budgets_user_id_idx ON public.budgets (user_id);
CREATE INDEX budgets_category_id_idx ON public.budgets (category_id);

CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX savings_goals_user_id_idx ON public.savings_goals (user_id);

-- Keep update timestamps current for changes made through any database client.
CREATE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER transactions_set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER budgets_set_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER savings_goals_set_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Refuse new transaction references to archived categories. Existing rows
-- remain valid and readable after a category is archived.
CREATE FUNCTION public.require_active_transaction_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  category_is_archived BOOLEAN;
BEGIN
  SELECT c.is_archived
    INTO category_is_archived
    FROM public.categories AS c
   WHERE c.id = NEW.category_id
   FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'category does not exist';
  END IF;

  IF category_is_archived THEN
    RAISE EXCEPTION 'archived categories cannot be assigned to new transactions';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.require_active_transaction_category() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER transactions_require_active_category
  BEFORE INSERT OR UPDATE OF category_id ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.require_active_transaction_category();

-- A budget category must be an active expense category when the budget is
-- created or its category changes. The composite FK separately enforces owner.
CREATE FUNCTION public.require_active_expense_budget_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  category_type TEXT;
  category_is_archived BOOLEAN;
BEGIN
  SELECT c.type, c.is_archived
    INTO category_type, category_is_archived
    FROM public.categories AS c
   WHERE c.id = NEW.category_id
   FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'category does not exist';
  END IF;

  IF category_type <> 'expense' THEN
    RAISE EXCEPTION 'budgets can only reference expense categories';
  END IF;

  IF category_is_archived THEN
    RAISE EXCEPTION 'archived categories cannot be assigned to new budgets';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.require_active_expense_budget_category() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER budgets_require_active_expense_category
  BEFORE INSERT OR UPDATE OF category_id ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.require_active_expense_budget_category();

-- A category cannot change from expense to income while budgets refer to it.
-- Transaction type changes are also protected by the composite foreign key.
CREATE FUNCTION public.prevent_budgeted_category_type_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF NEW.type IS DISTINCT FROM OLD.type
     AND EXISTS (
       SELECT 1
         FROM public.budgets AS b
        WHERE b.category_id = OLD.id
          AND b.user_id = OLD.user_id
     ) THEN
    RAISE EXCEPTION 'category type cannot change while budgets reference it';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.prevent_budgeted_category_type_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER categories_prevent_budgeted_type_change
  BEFORE UPDATE OF type ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.prevent_budgeted_category_type_change();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_owner_all
  ON public.categories FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY transactions_owner_all
  ON public.transactions FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY budgets_owner_all
  ON public.budgets FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY savings_goals_owner_all
  ON public.savings_goals FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE
  public.categories,
  public.transactions,
  public.budgets,
  public.savings_goals
FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.categories,
  public.transactions,
  public.budgets,
  public.savings_goals
TO authenticated;
