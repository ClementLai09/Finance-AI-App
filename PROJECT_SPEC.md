# Finance AI App — Project Specification

## 1. Project Purpose

Finance AI App is a personal finance web application designed to help users:

1. Track their income and expenses
2. Understand their spending habits
3. Manage category budgets
4. Track savings goals
5. Receive controlled AI-powered financial analysis

The application is designed to be:

* Simple
* Mobile-first
* PWA-installable
* Secure
* Multi-user
* Free to operate for V1
* Useful without AI
* Suitable as a real personal project and portfolio project

---

# 2. Core Product Principle

> **Finance AI App helps users TRACK, UNDERSTAND, and IMPROVE their financial habits.**

The application does **not** move, control, or execute the user's money.

---

# 3. Permanent Product Boundary

The application must NOT:

* Connect to bank accounts
* Connect to crypto exchanges
* Connect to crypto wallets
* Store bank passwords
* Store payment credentials
* Store crypto private keys
* Execute purchases or sales
* Transfer money
* Withdraw money
* Deposit money
* Execute investment transactions
* Automatically synchronize bank transactions

All financial transactions are manually entered by the user.

---

# 4. V1 Technology Architecture

The planned V1 stack is:

* Next.js
* TypeScript
* Tailwind CSS
* Supabase PostgreSQL
* Supabase Auth
* Supabase Row Level Security
* Recharts
* Zod
* Gemini API Free Tier
* Vercel Hobby
* Git
* GitHub
* Progressive Web App (PWA)

The stack should remain as small as reasonably possible.

Do not introduce additional services, frameworks, libraries, agents, automation platforms, or paid services unless there is a clear reason.

---

# 5. Zero-Cost Requirement

V1 must operate at:

> **RM0 / $0**

The project must not require:

* Paid subscriptions
* Paid trials
* Required credit cards
* Paid APIs
* Pay-as-you-go billing
* Automatic paid upgrades

The application should use free tiers/free services where appropriate.

If a free-tier limit is reached, the application should degrade gracefully rather than automatically creating a paid charge.

---

# 6. Authentication

Authentication is required from V1.

Use:

* Supabase Auth

Users must log in before accessing their financial data.

Each user's financial records must be associated with their authenticated `user_id`.

Supabase Row Level Security must prevent users from accessing another user's records.

---

# 7. Primary User Flow

The main V1 flow is:

1. Open application
2. Sign up / log in
3. View dashboard
4. Add income or expense
5. Select category
6. Enter amount
7. Select/edit date
8. Optionally add notes
9. Save transaction
10. Dashboard updates
11. Review spending
12. Review budgets
13. Review savings goals
14. Request monthly AI financial analysis

---

# 8. Income System

Income must be manually entered.

Income categories:

* Salary
* Bonus
* Freelance
* Gift
* Other

Income must NOT be hardcoded to a specific salary.

The user may have different income amounts or multiple income transactions.

---

# 9. Transaction System

Use one `transactions` table for both income and expenses.

## Transaction fields

* `id`
* `user_id`
* `type`
* `amount`
* `category`
* `meal_type`
* `date`
* `notes`
* `created_at`
* `updated_at`

## Transaction type

Allowed values:

* `expense`
* `income`

## Expense categories

* Food
* Rent
* Transport
* Petrol
* Bills
* Shopping
* Entertainment
* Health
* Investment
* Debt
* Other

## Income categories

* Salary
* Bonus
* Freelance
* Gift
* Other

## Food meal types

If category is Food, the user may optionally select:

* Breakfast
* Lunch
* Dinner
* Snack
* Other

Meal type is only relevant to Food transactions.

## Transaction rules

Required:

* Amount
* Type
* Category
* Date

Optional:

* Meal type
* Notes

Date should default to the current date but remain editable.

Users can edit transactions.

Users can delete transactions.

Deletion must require confirmation.

Changing a transaction date must correctly update monthly calculations.

---

# 10. Dashboard

The dashboard should display:

* Monthly income
* Monthly expenses
* Remaining money
* Category spending
* Recent transactions
* Spending chart
* Category budget progress

The user should be able to select/view a specific month.

---

# 11. Dashboard Calculations

Financial calculations must be performed by application/database logic, not by AI.

Example:

Income:

RM4,000

Expenses:

RM2,850

Remaining:

RM1,150

## Calculation rules

Monthly income:

> Sum all income transactions for the selected month.

Monthly expenses:

> Sum all expense transactions for the selected month.

Remaining:

> Monthly income - monthly expenses

Category spending:

> Sum expense transactions for a specific category in the selected month.

Budget remaining:

> Category budget - category spending

Do NOT store an independent "remaining money" value.

Remaining money must be calculated dynamically.

Calculations must be deterministic and testable.

---

# 12. Budget System

Users can create category-based monthly budgets.

Use a `budgets` table.

## Budget fields

* `id`
* `user_id`
* `category`
* `amount`
* `month`
* `created_at`
* `updated_at`

There should be only one budget for a specific:

> user + category + month

Users can:

* Create budgets
* Edit budgets
* View budgets

The application calculates:

* Budget amount
* Amount spent
* Amount remaining

Do NOT store budget remaining as an independent value.

If spending exceeds the budget, display a clear warning.

---

# 13. Savings Goals

Users can create savings goals.

Use a `savings_goals` table.

## Savings goal fields

* `id`
* `user_id`
* `name`
* `target_amount`
* `current_amount`
* `target_date`
* `created_at`
* `updated_at`

Required:

* Goal name
* Target amount
* Current amount

Optional:

* Target date

Users can edit savings goals.

The application should display progress toward the goal.

Advanced reward/gamification systems are deferred.

---

# 14. Recurring Expenses

Recurring expense management is NOT part of the initial V1 implementation.

Future concept:

> Detect → Explain → Ask → User confirms → Create

AI must never silently create recurring expenses.

Recurring expenses may be considered for a future version.

---

# 15. AI Assistant

V1 will NOT contain unrestricted free-form AI chat.

Instead, V1 uses controlled:

> **Monthly Financial Analysis**

The application retrieves the user's relevant financial data.

The application calculates exact financial values.

Only necessary information is sent to Gemini.

Gemini explains the financial patterns in a user-friendly way.

Example:

```text
User
↓
Finance App
↓
Retrieve transactions
↓
Calculate exact financial values
↓
Prepare limited analysis data
↓
Gemini
↓
Financial explanation
↓
User
```

AI must not be responsible for core financial calculations.

---

# 16. AI Provider and Free Tier

The application uses the Gemini API Free Tier.

Important distinction:

* Rakyat Digital Gemini is a development/coding resource.
* The Finance AI App uses its own Gemini API configuration.

Rakyat Digital access must not be required for the deployed application to function.

The application must not depend on Rakyat Digital remaining available forever.

The application must not promise unlimited AI usage.

If Gemini becomes unavailable or its free-tier quota is exhausted:

* Core financial features must continue working.
* AI analysis should show an appropriate unavailable/error message.
* The application must not automatically create paid billing.

---

# 17. AI Actions and User Confirmation

AI is advisory only.

AI must never silently:

* Create transactions
* Edit transactions
* Delete transactions
* Change budgets
* Change savings goals
* Create recurring expenses
* Move money
* Execute financial transactions

Future AI actions that modify data must follow:

> AI proposes → User reviews → User confirms → Application performs action

---

# 18. Privacy and Security

The application must use:

* Supabase Authentication
* Supabase Row Level Security
* Server-side handling of API keys
* Environment variables
* Input validation
* Database constraints where appropriate
* HTTPS through deployment platform

Secrets must never be committed to GitHub.

`.env` files containing secrets must be excluded from Git.

No real personal financial data should be committed to GitHub.

Development should use fake/test data where appropriate.

The application should avoid unnecessary sensitive logging.

---

# 19. Reliability Requirements

The application must handle:

* Invalid amounts
* Missing required fields
* Invalid dates
* Duplicate submissions
* Accidental deletion
* Network failure
* Database failure
* AI failure
* AI quota exhaustion
* Missing data
* Invalid AI responses

The core finance application must remain usable when AI is unavailable.

---

# 20. PWA / Mobile Requirements

The application should be mobile-first.

It must eventually support installation as a PWA.

The intended experience is:

1. Open the web application on iPhone
2. Add it to the Home Screen
3. Launch it from the Home Screen like an app

A native App Store application is NOT required for V1.

The Vercel-provided domain can be used initially.

A custom domain is not required for V1.

---

# 21. Multi-User Support

The application is designed for multiple separate users.

Each user must only see their own:

* Transactions
* Budgets
* Savings goals
* AI analysis data

Multi-user support does NOT mean connecting multiple bank accounts.

---

# 22. Features Explicitly Deferred

The following are intentionally outside initial V1 scope:

* Bank integrations
* Automatic transaction synchronization
* Crypto exchange integrations
* Wallet integrations
* Payment execution
* Money transfers
* Investment execution
* Free-form AI chat
* Automatic recurring-expense creation
* Advanced AI agents
* n8n automation
* MCP integrations
* Complex financial forecasting
* Advanced gamification
* Native iOS application
* Custom domain
* Paid services

These may be considered only after V1 is working.

---

# 23. Development Philosophy

The project follows:

> **Learn → Build → Show → Improve → Automate**

Development principle:

> **AI writes. I understand. I decide. I test. Git protects.**

The purpose of using AI coding tools is to accelerate development while still understanding what is being built.

---

# 24. AI Coding Rules

The AI coding assistant should:

1. Read `PROJECT_SPEC.md`
2. Read `V1_CHECKLIST.md`
3. Understand the existing project structure
4. Explain relevant architecture when necessary
5. Make the smallest reasonable change
6. Preserve working functionality
7. Avoid unnecessary rewrites
8. Avoid unnecessary dependencies
9. Avoid unnecessary services
10. Test changes
11. Report what changed
12. Never expose secrets
13. Never add financial integrations without explicit approval

Before introducing a new library, service, framework, or architecture:

> Explain why it is needed first.

---

# 25. Git Safety

Git is used as a safety system and project history.

Development workflow:

> Plan → One meaningful change → Test → Review → Commit

If something breaks:

> Investigate → Understand cause → Fix specific issue → Test again

Important milestones should be committed separately.

Do not make large unrelated changes in one commit.

Do not commit:

* API keys
* Passwords
* `.env` secrets
* Real financial data
* Other sensitive credentials

---

# 26. Current Project Status

The following foundation work has already been completed:

* [x] Finance AI App project created
* [x] Project opened in VS Code
* [x] Git initialized
* [x] GitHub repository created
* [x] Local repository connected to GitHub
* [x] README created
* [x] Initial project setup committed
* [x] Initial commit pushed to GitHub
* [x] `PROJECT_SPEC.md` created
* [x] `V1_CHECKLIST.md` created
* [x] Core product boundary defined
* [x] V1 architecture planned
* [x] Zero-cost requirement defined
* [x] Authentication approach decided
* [x] Database architecture decided
* [x] AI approach decided
* [x] PWA requirement decided
* [x] Development workflow defined

The architecture/specification files themselves should be committed as a separate checkpoint after final review.

---

# 27. V1 Definition

V1 is considered complete when the following are working:

* User sign up
* User login/logout
* User-specific data isolation
* Add expense
* Add income
* Edit transaction
* Delete transaction with confirmation
* Monthly dashboard
* Monthly income calculation
* Monthly expense calculation
* Remaining money calculation
* Category spending
* Spending chart
* Category budgets
* Budget progress
* Savings goals
* PWA installation
* Controlled monthly AI financial analysis
* AI failure/quota handling
* Security validation
* Basic reliability testing
* Deployment

---

# 28. Permanent Project Rule

> **Finance AI App helps users TRACK, UNDERSTAND, and IMPROVE their financial habits. It does not MOVE, CONTROL, or EXECUTE their money.**

This rule applies to all future versions unless the project scope is deliberately redefined.
