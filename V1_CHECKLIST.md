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
* [ ] Review and commit finalized `PROJECT_SPEC.md`
* [ ] Review and commit finalized `V1_CHECKLIST.md`

---

# Phase 1 — Application Development Setup

## Next.js

* [x] Create Next.js application
* [x] Configure TypeScript
* [x] Configure Tailwind CSS
* [x] Confirm application runs locally
* [ ] Confirm development server works
* [x] Create basic project structure
* [x] Create initial application layout
* [x] Create basic navigation
* [ ] Create Git checkpoint

## Development Tools

* [ ] Install/configure required dependencies only
* [ ] Configure environment variables
* [ ] Create `.env.local`
* [ ] Create/update `.gitignore`
* [ ] Confirm secrets are excluded from Git
* [ ] Confirm project builds successfully
* [ ] Create Git checkpoint

---

# Phase 2 — Supabase Setup

## Supabase Project

* [ ] Create Supabase project
* [ ] Confirm project is using the free tier
* [ ] Connect application to Supabase
* [ ] Configure Supabase environment variables
* [ ] Test Supabase connection
* [ ] Create Git checkpoint

## Authentication

* [ ] Configure Supabase Auth
* [ ] Create sign-up screen
* [ ] Create login screen
* [ ] Create logout functionality
* [ ] Handle invalid login
* [ ] Handle invalid sign-up
* [ ] Handle authentication state
* [ ] Protect authenticated pages
* [ ] Redirect unauthenticated users appropriately
* [ ] Test authentication
* [ ] Create Git checkpoint

---

# Phase 3 — Database

## Transactions

* [ ] Create `transactions` table
* [ ] Add `id`
* [ ] Add `user_id`
* [ ] Add `type`
* [ ] Add `amount`
* [ ] Add `category`
* [ ] Add `meal_type`
* [ ] Add `date`
* [ ] Add `notes`
* [ ] Add `created_at`
* [ ] Add `updated_at`
* [ ] Add appropriate constraints
* [ ] Test transaction creation

## Budgets

* [ ] Create `budgets` table
* [ ] Add `id`
* [ ] Add `user_id`
* [ ] Add `category`
* [ ] Add `amount`
* [ ] Add `month`
* [ ] Add timestamps
* [ ] Add user/category/month uniqueness rule
* [ ] Test budget creation

## Savings Goals

* [ ] Create `savings_goals` table
* [ ] Add `id`
* [ ] Add `user_id`
* [ ] Add `name`
* [ ] Add `target_amount`
* [ ] Add `current_amount`
* [ ] Add `target_date`
* [ ] Add timestamps
* [ ] Test savings goal creation

## Database Security

* [ ] Enable Row Level Security
* [ ] Create transaction RLS policies
* [ ] Create budget RLS policies
* [ ] Create savings-goal RLS policies
* [ ] Verify users cannot access another user's records
* [ ] Test RLS with multiple test users
* [ ] Create Git checkpoint

---

# Phase 4 — Transactions

## Expense Transactions

* [ ] Create Add Expense UI
* [ ] Amount field
* [ ] Category selector
* [ ] Meal type selector
* [ ] Date selector
* [ ] Notes field
* [ ] Default date to today
* [ ] Validate required fields
* [ ] Save expense
* [ ] Display success/error state
* [ ] Prevent duplicate submission
* [ ] Test expense creation

## Income Transactions

* [ ] Create Add Income UI
* [ ] Amount field
* [ ] Income category selector
* [ ] Date selector
* [ ] Notes field
* [ ] Validate required fields
* [ ] Save income
* [ ] Display success/error state
* [ ] Test income creation

## Transaction Management

* [ ] Display transactions
* [ ] Edit transaction
* [ ] Delete transaction
* [ ] Require deletion confirmation
* [ ] Handle failed updates
* [ ] Handle failed deletion
* [ ] Confirm edited dates update calculations
* [ ] Test transaction management
* [ ] Create Git checkpoint

---

# Phase 5 — Dashboard

## Dashboard Data

* [ ] Create dashboard page
* [ ] Add month selector
* [ ] Calculate monthly income
* [ ] Calculate monthly expenses
* [ ] Calculate remaining money
* [ ] Display recent transactions
* [ ] Display category spending

## Charts

* [ ] Install/configure Recharts
* [ ] Create spending chart
* [ ] Create category spending visualization
* [ ] Confirm charts use real database calculations
* [ ] Handle empty data state

## Dashboard Reliability

* [ ] Test month with no transactions
* [ ] Test month with income only
* [ ] Test month with expenses only
* [ ] Test month with income and expenses
* [ ] Test editing transaction dates
* [ ] Test deleting transactions
* [ ] Test multiple categories
* [ ] Create Git checkpoint

---

# Phase 6 — Budgets

* [ ] Create budget UI
* [ ] Select category
* [ ] Enter monthly budget
* [ ] Select month
* [ ] Save budget
* [ ] Edit budget
* [ ] Display budget amount
* [ ] Calculate amount spent
* [ ] Calculate amount remaining
* [ ] Display progress
* [ ] Display overspending warning
* [ ] Prevent duplicate category/month budgets
* [ ] Test budgets
* [ ] Create Git checkpoint

---

# Phase 7 — Savings Goals

* [ ] Create savings goal UI
* [ ] Enter goal name
* [ ] Enter target amount
* [ ] Enter current amount
* [ ] Optional target date
* [ ] Save goal
* [ ] Edit goal
* [ ] Display goal progress
* [ ] Handle invalid amounts
* [ ] Test savings goals
* [ ] Create Git checkpoint

---

# Phase 8 — AI Assistant

## Gemini Setup

* [ ] Create Gemini API configuration
* [ ] Confirm free-tier usage
* [ ] Store API key securely
* [ ] Never expose API key to client
* [ ] Never commit API key to GitHub
* [ ] Test API connection
* [ ] Create Git checkpoint

## Monthly Financial Analysis

* [ ] Create monthly analysis UI
* [ ] Retrieve relevant financial data
* [ ] Calculate exact financial values in application logic
* [ ] Prepare limited AI input
* [ ] Send appropriate data to Gemini
* [ ] Receive AI analysis
* [ ] Display analysis
* [ ] Handle empty financial data
* [ ] Handle invalid AI response
* [ ] Handle Gemini failure
* [ ] Handle free-tier quota exhaustion
* [ ] Confirm core application still works when AI fails
* [ ] Test AI analysis
* [ ] Create Git checkpoint

## AI Safety

* [ ] AI cannot modify transactions automatically
* [ ] AI cannot modify budgets automatically
* [ ] AI cannot modify savings goals automatically
* [ ] AI cannot create recurring expenses automatically
* [ ] AI cannot move money
* [ ] AI cannot execute financial transactions
* [ ] No unrestricted free-form AI chat in V1
* [ ] Confirm AI is advisory only

---

# Phase 9 — Validation & Security

## Input Validation

* [ ] Add Zod validation where appropriate
* [ ] Validate amount
* [ ] Validate category
* [ ] Validate transaction type
* [ ] Validate date
* [ ] Validate budget amount
* [ ] Validate savings goal amounts
* [ ] Validate required fields
* [ ] Handle malformed input

## Security

* [ ] Verify authentication protection
* [ ] Verify RLS protection
* [ ] Verify users cannot access other users' data
* [ ] Verify API keys remain server-side
* [ ] Verify `.env` is ignored
* [ ] Search repository for accidentally committed secrets
* [ ] Confirm no real financial data is committed
* [ ] Review unnecessary logs

---

# Phase 10 — Reliability Testing

* [ ] Test network failure
* [ ] Test database failure
* [ ] Test AI failure
* [ ] Test AI quota exhaustion
* [ ] Test duplicate form submission
* [ ] Test invalid input
* [ ] Test empty states
* [ ] Test deletion confirmation
* [ ] Test editing
* [ ] Test monthly calculations
* [ ] Test budget calculations
* [ ] Test savings goal calculations
* [ ] Test authentication failures

---

# Phase 11 — Mobile & PWA

## Mobile UI

* [ ] Test mobile layout
* [ ] Test iPhone-sized screen
* [ ] Test transaction forms on mobile
* [ ] Test dashboard on mobile
* [ ] Test charts on mobile
* [ ] Fix overflow/layout issues
* [ ] Confirm buttons and inputs are easy to use

## PWA

* [ ] Add PWA configuration
* [ ] Add web app manifest
* [ ] Add application icons
* [ ] Configure installable experience
* [ ] Test Add to Home Screen on iPhone
* [ ] Test launching from Home Screen
* [ ] Confirm HTTPS deployment

---

# Phase 12 — Deployment

## Vercel

* [ ] Create/connect Vercel project
* [ ] Confirm Vercel Hobby/free configuration
* [ ] Connect GitHub repository
* [ ] Configure production environment variables
* [ ] Deploy application
* [ ] Confirm production application works
* [ ] Confirm authentication works in production
* [ ] Confirm database works in production
* [ ] Confirm AI works in production
* [ ] Confirm PWA works in production
* [ ] Create Git checkpoint

---

# Phase 13 — V1 Completion Test

The application must pass the following end-to-end test:

## New User

* [ ] Sign up
* [ ] Log in
* [ ] Reach dashboard

## Transactions

* [ ] Add income
* [ ] Add expense
* [ ] Edit transaction
* [ ] Delete transaction
* [ ] Confirm dashboard updates correctly

## Dashboard

* [ ] Monthly income is correct
* [ ] Monthly expenses are correct
* [ ] Remaining money is correct
* [ ] Category spending is correct
* [ ] Charts are correct

## Budgets

* [ ] Create budget
* [ ] View budget
* [ ] Edit budget
* [ ] Overspending warning works

## Savings

* [ ] Create savings goal
* [ ] View progress
* [ ] Edit savings goal

## AI

* [ ] Generate monthly analysis
* [ ] AI uses application-calculated financial values
* [ ] AI cannot modify financial data automatically
* [ ] AI failure does not break the core application

## Security

* [ ] User A cannot access User B's financial data
* [ ] Secrets are not exposed
* [ ] Secrets are not committed to GitHub

## Mobile

* [ ] Application works on mobile
* [ ] Application can be installed as a PWA
* [ ] Application launches from iPhone Home Screen

## Deployment

* [ ] Production deployment works
* [ ] Production database works
* [ ] Production authentication works
* [ ] Production AI works
* [ ] Production PWA works

---

# Phase 14 — V1 Safety Review

Before declaring V1 complete:

* [ ] No bank integrations
* [ ] No crypto exchange integrations
* [ ] No wallet integrations
* [ ] No payment credentials
* [ ] No bank passwords
* [ ] No crypto private keys
* [ ] No financial transaction execution
* [ ] No automatic money movement
* [ ] No automatic recurring expense creation
* [ ] No unrestricted AI chat
* [ ] No paid service required
* [ ] No automatic paid billing
* [ ] No secrets in GitHub
* [ ] No real financial data in GitHub

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
* [ ] Create final V1 Git tag/checkpoint

---

# Permanent Project Rule

> **Finance AI App helps users TRACK, UNDERSTAND, and IMPROVE their financial habits. It does not MOVE, CONTROL, or EXECUTE their money.**
