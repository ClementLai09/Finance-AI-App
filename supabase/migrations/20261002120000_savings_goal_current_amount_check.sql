-- Enforce the savings-goal amount relationship for all database write paths.
-- This validates existing rows and fails without changing data if any row
-- violates the constraint.
ALTER TABLE public.savings_goals
  ADD CONSTRAINT savings_goals_current_amount_lte_target
  CHECK (current_amount <= target_amount);
