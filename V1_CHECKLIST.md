# Finance AI App — V1 Development Checklist

> **Status rule:** Only mark a task `[x]` after it has actually been completed and verified.
> Discussing, planning, or deciding something does not count as completion.

---

# Phase 0 — Project Foundation

## Project Setup

* [x] Create Finance AI App project
* [x] Create project folder
* [x] Open project in VS Code
* [x] Initialize Git
* [x] Create GitHub repository
* [x] Connect local repository to GitHub
* [x] Create README
* [x] Create initial project files
* [x] Make initial Git commit
* [x] Push initial commit to GitHub

## Project Planning

* [x] Define project purpose
* [x] Define core product boundary
* [x] Decide V1 scope
* [x] Decide V1 technology stack
* [x] Decide zero-cost requirement
* [x] Decide authentication approach
* [x] Decide database architecture
* [x] Decide AI architecture
* [x] Decide PWA requirement
* [x] Decide security requirements
* [x] Create `PROJECT_SPEC.md`
* [x] Create `V1_CHECKLIST.md`
* [x] Review and commit finalized `PROJECT_SPEC.md` (committed in the documentation checkpoint)
* [ ] Review and commit finalized `V1_CHECKLIST.md`

---

# Phase 1 — Application Development Setup

## Next.js

* [x] Create Next.js application
* [x] Configure TypeScript
* [x] Configure Tailwind CSS
* [x] Confirm application runs locally
* [x] Confirm development server works
* [x] Create basic project structure
* [x] Create initial application layout
* [x] Create basic navigation
* [x] Create Git checkpoint

## Development Tools

* [x] Install/configure required dependencies only
* [x] Configure environment variables
* [x] Create `.env.local`
* [x] Create/update `.gitignore`
* [x] Confirm secrets are excluded from Git
* [x] Confirm project builds successfully
* [x] Create Git checkpoint

---

# Phase 2 — Supabase Setup

## Supabase Project

* [x] Create Supabase project
* [ ] Confirm project is using the free tier (account billing status requires dashboard verification)
* [x] Connect application to Supabase
* [x] Configure Supabase environment variables
* [x] Test Supabase connection
* [x] Create Git checkpoint

## Authentication

* [x] Configure Supabase Auth
* [x] Create sign-up screen
* [x] Create login screen
* [x] Create logout functionality
* [x] Handle invalid login
* [x] Handle invalid sign-up
* [x] Handle authentication state
* [x] Protect authenticated pages
* [x] Redirect unauthenticated users appropriately
* [x] Test authentication (desktop and iPhone production login verified)
* [x] Create Git checkpoint

---

# Phase 3 — Database

## Categories

* [x] Create `categories` table
* [x] Add `id` (UUID), `user_id`, `name`, `type`, `is_archived`, and timestamps
* [x] Restrict `type` to income or expense
* [x] Enforce case-insensitive name uniqueness per user and type after trimming whitespace
* [x] Prevent hard deletion of categories referenced by transactions
* [x] Ensure archived categories cannot be selected for new transactions

## Transactions

* [x] Create `transactions` table
* [x] Add `id`
* [x] Add `user_id`
* [x] Add `type`
* [x] Add `amount`
* [x] Add `category_id`
* [x] Add `date`
* [x] Add `notes`
* [x] Add `created_at`
* [x] Add `updated_at`
* [x] Add appropriate constraints
* [x] Enforce transaction/category ownership and matching types
* [x] Test transaction creation

## Budgets

* [x] Create `budgets` table
* [x] Add `id`
* [x] Add `user_id`
* [x] Add `category_id` referencing the user's expense category
* [x] Add `amount`
* [x] Add `month`
* [x] Represent `month` as the first day of the month
* [x] Add timestamps
* [x] Restrict budgets to expense categories
* [x] Add user/category/month uniqueness rule
* [x] Test budget creation

## Savings Goals

* [x] Create `savings_goals` table
* [x] Add `id`
* [x] Add `user_id`
* [x] Add `name`
* [x] Add `target_amount`
* [x] Add `current_amount`
* [x] Add `target_date`
* [x] Add timestamps
* [x] Enforce `current_amount` does not exceed `target_amount` (follow-up migration)
* [x] Test savings goal creation

## Database Security

* [x] Enable Row Level Security
* [x] Create category RLS policies
* [x] Create transaction RLS policies
* [x] Create budget RLS policies
* [x] Create savings-goal RLS policies
* [ ] Verify users cannot access another user's categories or records (deferred: integration/security testing)
* [ ] Test multi-user isolation with multiple test users (deferred: separate non-production test project/users)
* [x] Create Git checkpoint

---

# Phase 4 — Transactions

## Expense Transactions

* [x] Create Add Expense UI
* [x] Amount field
* [x] Category selector
* [x] Date selector
* [x] Notes field
* [x] Default date to today
* [x] Validate required fields
* [x] Save expense
* [x] Display success/error state
* [x] Prevent duplicate submission
* [x] Test expense creation

## Income Transactions

* [x] Create Add Income UI
* [x] Amount field
* [x] Income category selector
* [x] Date selector
* [x] Notes field
* [x] Validate required fields
* [x] Save income
* [x] Display success/error state
* [x] Test income creation

## Transaction Management

* [x] Display transactions
* [x] Edit transaction
* [x] Delete transaction
* [x] Require deletion confirmation
* [x] Handle failed updates
* [x] Handle failed deletion
* [x] Confirm edited dates update calculations
* [x] Preserve decimal-safe transaction amounts through validation, storage, listing, and calculations
* [x] Test transaction management
* [x] Create Git checkpoint

---

# Phase 5 — Dashboard

## Dashboard Data

* [x] Create dashboard page
* [x] Add month selector
* [x] Calculate monthly income
* [x] Calculate monthly expenses
* [x] Calculate remaining money
* [x] Display recent transactions
* [x] Display category spending
* [x] Display category budget progress for the selected month

## Charts

* [ ] Install/configure Recharts (superseded: V1 uses a dependency-free Tailwind/CSS bar chart)
* [x] Create spending chart
* [x] Create category spending visualization
* [x] Confirm charts use real database calculations
* [x] Handle empty data state

## Dashboard Reliability

* [x] Test month with no transactions
* [x] Test month with income only
* [x] Test month with expenses only
* [x] Test month with income and expenses
* [x] Test editing transaction dates
* [x] Test deleting transactions
* [x] Test multiple categories
* [x] Create Git checkpoint

---

# Phase 6 — Budgets

* [x] Create budget UI
* [x] Select category
* [x] Enter monthly budget
* [ ] Select month (deferred: V1 budget management is scoped to the current month)
* [x] Save budget
* [x] Edit budget
* [x] Display budget amount
* [x] Calculate amount spent
* [x] Calculate amount remaining
* [x] Display progress
* [x] Display overspending warning
* [x] Prevent duplicate category/month budgets
* [x] Test budgets, including the false duplicate regression
* [x] Create Git checkpoint

---

# Phase 7 — Savings Goals

* [x] Create savings goal UI
* [x] Enter goal name
* [x] Enter target amount
* [x] Enter current amount
* [x] Optional target date
* [x] Save goal
* [x] Edit goal
* [x] Display goal progress
* [x] Handle invalid amounts
* [x] Test savings goals
* [x] Create Git checkpoint

---

# Phase 8 — AI Assistant

## Gemini Setup

* [x] Create Gemini API configuration
* [ ] Confirm free-tier usage (provider account/quota status requires external verification)
* [x] Store API key securely
* [x] Never expose API key to client
* [ ] Verify API key has never appeared in Git history (current `.env.local` is ignored; history scan deferred)
* [x] Test API connection
* [x] Create Git checkpoint

## Monthly Financial Analysis

* [x] Create monthly analysis UI
* [x] Retrieve relevant financial data
* [x] Calculate exact financial values in application logic
* [x] Prepare limited AI input
* [x] Send appropriate data to Gemini
* [x] Receive AI analysis
* [x] Display analysis
* [x] Handle empty financial data (fixed and manually tested)
* [x] Handle invalid AI response
* [x] Handle Gemini failure
* [ ] Handle free-tier quota exhaustion (graceful handling exists; quota-exhaustion behavior not separately verified)
* [x] Confirm core application still works when AI fails
* [x] Test AI analysis
* [x] Create Git checkpoint

## AI Safety

* [x] AI cannot modify transactions automatically
* [x] AI cannot modify budgets automatically
* [x] AI cannot modify savings goals automatically
* [x] AI cannot create recurring expenses automatically
* [x] AI cannot move money
* [x] AI cannot execute financial transactions
* [x] No unrestricted free-form AI chat in V1
* [x] Confirm AI is advisory only

---

# Phase 9 — Validation & Security

## Input Validation

* [ ] Add Zod validation where appropriate (superseded by dependency-free validators and pure finance functions)
* [x] Validate amount
* [x] Validate category
* [x] Validate transaction type
* [x] Validate date
* [x] Validate budget amount
* [x] Validate savings goal amounts
* [x] Validate required fields
* [x] Handle malformed input

## Security

* [x] Verify authentication protection
* [ ] Verify RLS protection through cross-user integration tests (deferred)
* [ ] Verify users cannot access other users' data (deferred: no multi-user integration test was run)
* [x] Verify API keys remain server-side
* [x] Verify `.env` is ignored
* [ ] Search repository history for accidentally committed secrets (not exhaustively verified)
* [ ] Confirm no real financial data is committed (not exhaustively verified)
* [x] Review unnecessary logs (temporary login diagnostics removed)

---

# Phase 10 — Reliability Testing

* [ ] Test network failure (not separately verified)
* [ ] Test database failure (not separately verified)
* [ ] Test AI failure/quota exhaustion end to end (error handling exists; quota behavior not verified)
* [ ] Test duplicate form submission (pending guards exist; not separately verified)
* [x] Test invalid input
* [x] Test empty states
* [x] Test deletion confirmation
* [x] Test editing
* [x] Test monthly calculations
* [x] Test budget calculations
* [x] Test savings goal calculations
* [x] Test authentication failures

---

# Phase 11 — Mobile & PWA

## Mobile UI

* [ ] Test mobile layout end to end (only login/PWA availability is specifically recorded)
* [x] Test iPhone-sized screen for login and PWA install availability
* [ ] Test transaction forms on mobile (not separately recorded)
* [ ] Test dashboard on mobile (not separately recorded)
* [ ] Test charts on mobile (not separately recorded)
* [ ] Fix overflow/layout issues (no reported issue; full-route audit not recorded)
* [ ] Confirm buttons and inputs are easy to use on every route (not separately recorded)

## PWA

* [x] Add PWA configuration
* [x] Add web app manifest
* [x] Add application icons
* [x] Configure installable experience
* [x] Test Add to Home Screen availability on iPhone
* [ ] Test launching from Home Screen (not recorded as verified)
* [x] Confirm HTTPS deployment

---

# Phase 12 — Deployment

## Vercel

* [x] Create/connect Vercel project
* [ ] Confirm Vercel Hobby/free configuration (account billing status requires external verification)
* [x] Connect GitHub repository
* [x] Configure production environment variables
* [x] Deploy application
* [x] Confirm production application works
* [x] Confirm authentication works in production (Mac and iPhone)
* [x] Confirm database works in production
* [x] Confirm AI works in production
* [x] Confirm PWA manifest/Add to Home Screen availability in production
* [x] Create Git checkpoint

---

# Phase 13 — V1 Completion Test

The application must pass the following end-to-end test:

## New User

* [x] Sign up
* [x] Log in
* [x] Reach dashboard

## Transactions

* [x] Add income
* [x] Add expense
* [x] Edit transaction
* [x] Delete transaction
* [x] Confirm dashboard updates correctly

## Categories

* [x] Create income and expense categories
* [x] Prevent duplicate category names
* [x] Archive and unarchive categories without deleting history

## Dashboard

* [x] Monthly income is correct
* [x] Monthly expenses are correct
* [x] Remaining money is correct
* [x] Category spending is correct
* [x] Charts are correct

## Budgets

* [x] Create budget
* [x] View budget
* [x] Edit budget
* [x] Overspending warning works

## Savings

* [x] Create savings goal
* [x] View progress
* [x] Edit savings goal

## AI

* [x] Generate monthly analysis
* [x] AI uses application-calculated financial values
* [x] AI cannot modify financial data automatically
* [x] AI failure does not break the core application

## Security

* [ ] User A cannot access User B's financial data (deferred: multi-user RLS integration testing)
* [x] Secrets are not exposed
* [ ] Secrets are not committed to GitHub (current `.env.local` is ignored; full history scan deferred)

## Mobile

* [x] Application works on mobile for the verified login/install flow
* [x] Application can be installed as a PWA (Add to Home Screen availability tested)
* [ ] Application launches from iPhone Home Screen (not recorded as verified)

## Deployment

* [x] Production deployment works
* [x] Production database works
* [x] Production authentication works
* [x] Production AI works
* [x] Production PWA manifest/install availability works

## Persistence

* [x] Log out, log back in, and confirm saved data persists

---

# Phase 14 — V1 Safety Review

Before declaring V1 complete:

* [x] No bank integrations
* [x] No crypto exchange integrations
* [x] No wallet integrations
* [x] No payment credentials
* [x] No bank passwords
* [x] No crypto private keys
* [x] No financial transaction execution
* [x] No automatic money movement
* [x] No automatic recurring expense creation
* [x] No unrestricted AI chat
* [x] No paid service required by the application architecture
* [ ] No automatic paid billing (external provider billing settings not verified here)
* [ ] No secrets in GitHub (repository history was not exhaustively scanned)
* [ ] No real financial data in GitHub (repository history was not exhaustively scanned)

---

# Phase 15 — V1 Retrospective

After V1 works:

* [ ] Document what was learned
* [ ] Document major technical decisions
* [ ] Document problems encountered
* [ ] Document how problems were solved
* [ ] Update README
* [ ] Add screenshots
* [ ] Add project architecture overview
* [ ] Add setup instructions
* [ ] Add deployed demo link
* [ ] Review possible V1.5 features
* [ ] Decide what should NOT be added
* [x] Create final V1 Git checkpoint (commit `af93f67`; no V1 tag is present)

---

# Permanent Project Rule

> **Finance AI App helps users TRACK, UNDERSTAND, and IMPROVE their financial habits. It does not MOVE, CONTROL, or EXECUTE their money.**

---

# Final V1 Status

* **V1 status:** Officially Complete for the agreed personal and friends/family scope. This does not mean every optional or deferred checklist item is complete.
* **Production:** Vercel deployment, core application, database, AI analysis, and Mac/iPhone login were verified. PWA Add to Home Screen availability was tested on iPhone.
* **Automated tests:** Vitest passes; 50 tests.
* **Build:** `npm run build -- --webpack` passes.
* **Major bugs fixed:** false duplicate budget rejection, empty-month AI generation, credentials in login URLs, transaction decimal precision, savings-goal amount invariant, and iPhone production login navigation.
* **Known deferred items:** Multi-user/RLS integration testing; exhaustive secret and financial-data history scans; provider free-tier/billing verification; AI quota exhaustion testing; complete mobile-route testing and Home Screen launch verification. Budget management remains current-month scoped. Recurring expenses remain outside V1 per `PROJECT_SPEC.md`.
* **Final V1 checkpoint:** `af93f67` — `Fix iPhone login navigation` (the code checkpoint is committed; the checklist update still needs review and commit).
* **Documentation note:** `README.md` still labels the project “In development”; it was inspected but left unchanged because this task is limited to the V1 checklist.
* **Transition to V2:** V1 functional scope is closed. Continue with the separately tracked V2 plan/checklist after this V1 checklist update is reviewed.
