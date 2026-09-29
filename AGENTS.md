# AI Coding Agent Instructions

## 1. Before Making Changes

Before modifying the project:

1. Read `PROJECT_SPEC.md`.
2. Read `V1_CHECKLIST.md`.
3. Inspect the existing implementation relevant to the requested task.
4. Understand existing patterns before creating new ones.
5. Check Git status before making changes.

`PROJECT_SPEC.md` is the source of truth for product requirements and architecture.

Do not contradict or silently override it.

If the requested change conflicts with the project specification, stop and explain the conflict before modifying code.

---

## 2. Product Boundary

This application is a personal finance tracking and analysis application.

The application must NOT:

* execute financial transactions
* move money
* connect to bank accounts
* connect to payment accounts
* connect to crypto wallets
* store bank credentials
* store private keys
* perform financial transactions on behalf of users
* automatically modify user financial data through AI

AI-generated changes to financial data must follow:

`AI proposes → User reviews → User confirms → Application acts`

The core application must remain usable without AI.

---

## 3. Development Philosophy

Build incrementally.

Prefer:

* small, focused changes
* existing patterns
* simple solutions
* minimal dependencies
* minimal files
* clear validation
* reversible changes

Avoid:

* unnecessary abstractions
* premature optimization
* unnecessary libraries
* duplicate implementations
* large rewrites
* unrelated refactoring
* changing architecture without discussion

Do not rebuild working functionality simply because another implementation is possible.

---

## 4. Scope Control

Only implement the functionality requested for the current task.

Do not silently add:

* extra features
* unrelated UI improvements
* new services
* new dependencies
* additional agents
* analytics systems
* payment integrations
* external APIs

If you identify a useful improvement outside the current scope, mention it separately instead of implementing it automatically.

---

## 5. Security

Authentication and authorization are mandatory.

For user-owned data:

* derive `user_id` from the authenticated Supabase session
* never trust a client-provided `user_id`
* verify ownership on the server
* use Supabase Row Level Security as an additional enforcement layer
* validate relationships between user-owned records
* do not expose service-role credentials to the client

Never weaken or bypass Row Level Security to make a feature easier to implement.

---

## 6. Database Rules

Use the existing database schema and constraints.

Before changing database-related code:

* inspect the relevant migration
* understand existing constraints
* understand existing RLS policies
* preserve data ownership rules

Do not modify database migrations unless the task explicitly requires a schema change.

Do not create application logic that contradicts database constraints.

---

## 7. Financial Data Integrity

Transactions must remain consistent with their categories.

Important rules include:

* transaction type must match category type
* transaction amount must be positive
* categories belong to users
* archived categories cannot be assigned to new transactions
* users can only modify their own transactions
* budgets are associated with expense categories
* historical transaction data should not be casually destroyed

When editing existing data, preserve historical records unless deletion is explicitly part of the requested functionality.

---

## 8. AI Development Rules

AI features must be controlled and explainable.

Do not allow an AI model to directly modify:

* transactions
* budgets
* savings goals
* recurring expenses
* categories

without an explicit user confirmation step.

Do not introduce unrestricted AI agents into the finance application without updating the project specification first.

AI is an assistant, not the authority over the user's financial data.

---

## 9. Code Changes

Before modifying a file:

* inspect the current implementation
* reuse existing components/actions/utilities when appropriate
* avoid duplicate logic
* keep changes localized

Do not rewrite an entire file when a small targeted change is sufficient.

Do not change unrelated files.

If an unrelated file changes unexpectedly, investigate it before continuing.

---

## 10. Validation

After implementation, run appropriate validation.

At minimum when applicable:

```bash
npm run build -- --webpack
git diff --check
```

Also test the affected functionality manually when possible.

Check for:

* TypeScript errors
* build errors
* authentication problems
* authorization problems
* broken existing functionality
* mobile layout issues
* unexpected files changed

Do not claim a feature is complete if validation has not been performed.

---

## 11. Git Safety

Do not commit or push unless explicitly requested by the user.

Before a checkpoint:

```bash
git status
```

Review the changed files.

Prefer small, meaningful commits corresponding to completed development increments.

Do not use destructive Git commands such as:

```bash
git reset --hard
git clean -fd
git checkout .
```

unless the user explicitly asks for that operation and understands what will be lost.

Never overwrite or discard user changes without confirmation.

---

## 12. Documentation

Keep project documentation aligned with the actual implementation.

`PROJECT_SPEC.md`:

* product requirements
* architecture
* permanent boundaries
* important design decisions

`V1_CHECKLIST.md`:

* development progress
* completed and remaining work

Do not repeatedly rewrite or rename these documents for cosmetic reasons.

Only update them when the actual project state or requirements change.

---

## 13. Working With Other AI Tools

This project may be developed using multiple AI tools.

Do not assume another AI agent's implementation is correct.

Always inspect the existing code and project documentation before making changes.

The codebase and project documentation are the shared source of truth.

Do not create tool-specific implementations that make the project dependent on one AI provider.

---

## 14. Communication Before Implementation

For non-trivial tasks, first report:

1. what you plan to change
2. which files will be affected
3. important security or data-integrity considerations
4. potential regression risks

For simple tasks, implementation can proceed directly.

After implementation, report:

1. files changed
2. validation performed
3. test/build result
4. unexpected changes or remaining limitations

Do not output huge diffs unless specifically requested.

---

## 15. Current Development Workflow

Use this workflow for each meaningful feature:

`Inspect → Plan → Implement → Validate → User Tests → Git Checkpoint`

Do not combine many unrelated features into one implementation task.

The user makes product decisions.

The AI coding agent implements the approved technical scope.

---

## 16. Priority Rule

When instructions conflict, follow this order:

1. Security and data integrity
2. `PROJECT_SPEC.md`
3. Explicit user-approved task scope
4. Existing architecture and patterns
5. `V1_CHECKLIST.md`
6. Agent implementation preferences

Never sacrifice security or product boundaries simply to make implementation easier.
