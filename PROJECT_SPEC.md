# Finance AI App — Project Specification

## 1. Project Purpose

Finance AI App is a mobile-friendly personal finance tracking and analysis application.

The application helps users:

* Record income and expenses manually
* Understand where their money is going
* Monitor category-based budgets
* Create and track savings goals
* Identify recurring expenses
* Analyze financial activity using AI
* Receive personalized suggestions for improving spending and saving habits

The application is intended to help users understand and manage their financial information.

---

## 2. Core Principle

> This application is a finance TRACKING and ANALYSIS application, not a financial transaction application.

The application must NEVER connect to, access, control, or execute transactions through a user's:

* Bank accounts
* Credit/debit card accounts
* E-wallet accounts
* Cryptocurrency exchanges
* Cryptocurrency wallets
* Investment accounts
* Brokerage accounts
* Payment accounts

The application must never:

* Transfer money
* Send money
* Receive money
* Buy investments
* Sell investments
* Buy cryptocurrency
* Sell cryptocurrency
* Place financial orders
* Access bank credentials
* Access crypto exchange credentials
* Automatically synchronize with bank accounts
* Automatically synchronize with crypto accounts

Financial transactions are entered manually by the user.

This principle is permanent unless explicitly changed in a future project decision.

---

## 3. Target User

The initial target user is the individual user of the application.

The application should be designed so that multi-user support can potentially be added in the future, but multi-user functionality is NOT required for V1.

---

## 4. Primary User Flow

The primary experience should be:

1. Open the application
2. View the dashboard
3. Understand current spending
4. Click "Add Expense"
5. Enter the amount
6. Select the category
7. Select a meal type if the category is Food
8. Date defaults to today
9. User can change the date
10. Add optional notes
11. Save the transaction
12. Dashboard updates automatically
13. User can edit or delete the transaction later
14. User can review category budgets
15. User can create savings goals
16. At the end of a period, user can ask the AI about their spending
17. AI analyzes the user's actual financial data
18. AI provides observations and suggestions
19. User remains responsible for deciding what actions to take

---

## 5. Transaction System

### 5.1 Expenses

Users can manually create expenses.

Required information:

* Amount
* Category
* Date

Optional information:

* Meal type when Category = Food
* Notes

The date should default to the current date but must remain editable.

### 5.2 Income

Users can manually enter income.

Income must NOT be fixed to a predetermined salary.

Users should be able to enter different amounts whenever they receive income.

Examples:

* Salary
* Bonus
* Freelance
* Gift
* Other

Income should have:

* Amount
* Category
* Date
* Optional notes

### 5.3 Categories

Initial categories may include:

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

The system should be designed so custom categories can potentially be supported later.

### 5.4 Food / Meal Types

When the category is Food, users can optionally select:

* Breakfast
* Lunch
* Dinner
* Snack
* Other

Meal type should not be required for non-food categories.

### 5.5 Editing

Users must be able to edit saved transactions.

Editable fields include:

* Amount
* Category
* Meal type
* Date
* Notes

### 5.6 Deleting

Users can delete saved transactions.

Deletion must require an appropriate confirmation step to reduce accidental deletion.

---

## 6. Dashboard

The dashboard is the main screen of the application.

It should provide a quick understanding of the user's financial activity.

### Required information

* Monthly income
* Monthly expenses
* Remaining money
* Category spending
* Recent transactions
* Spending chart
* Category budget progress

### Remaining Money

Remaining money should be calculated from actual transaction data:

Remaining Money = Income - Expenses

The system should avoid maintaining an independent manually stored "remaining money" value that could become inconsistent with the underlying transactions.

### Category Spending

The dashboard should allow users to visually understand spending across categories such as:

* Food
* Rent
* Petrol
* Investment
* Bills
* etc.

---

## 7. Budget System

Category budgets are the primary budgeting feature.

Users can create a budget for a category.

Example:

Food budget:
RM800

Food spending:
RM650

Remaining:
RM150

The application should:

* Create category budgets
* Edit category budgets
* Calculate spending
* Calculate remaining budget
* Detect overspending
* Display an overspending warning

Budget calculations must use actual transaction data.

---

## 8. Recurring Expenses

The application should eventually identify possible recurring expenses.

Example:

The system notices that the user repeatedly records:

Rent — RM560 — monthly

The AI may suggest:

"This looks like a recurring expense. Would you like to add it as a recurring expense?"

The user must confirm before the recurring expense is created.

### Required principle

AI detection must never automatically create recurring expenses without user confirmation.

The flow should be:

Detect → Explain → Ask → User confirms → Create

---

## 9. Savings Goals

Users can create their own savings goals.

Example:

Goal:
Emergency Fund

Target:
RM5,000

Current:
RM1,500

The application should eventually support:

* Custom goal name
* Target amount
* Current progress
* Optional target date
* Goal editing
* Progress visualization

A future version may include a reward/gamification system to encourage consistent saving.

The reward system is NOT required for the initial V1.

---

## 10. AI Assistant

The AI assistant is intended to help users understand their financial data.

The AI should eventually support natural-language questions such as:

* "How much did I spend on food this month?"
* "Where did most of my money go?"
* "Why did my spending increase?"
* "What can I improve next month?"
* "What should I pay attention to?"
* "Help me create a saving plan."
* "Can I save RM500 next month based on my spending?"

### V1 AI Feature

The first AI feature should be:

* Monthly spending summary

Additional AI capabilities can be added after the core application works reliably.

Potential future capabilities:

* Natural-language financial questions
* Spending analysis
* Identify unusual spending patterns
* Compare months
* Suggest areas to pay attention to
* Personalized saving plans
* Recurring expense detection
* Savings goal assistance

---

## 11. AI Safety Principles

AI is an assistant, not the financial decision-maker.

AI may:

* Analyze
* Summarize
* Explain
* Identify patterns
* Calculate
* Suggest

AI must not silently make financial changes.

For actions that modify application data, the preferred flow is:

AI proposes → User reviews → User confirms → Application performs action

The AI must not invent financial data.

If the available information is insufficient, the AI should say that it does not have enough information rather than guessing.

The AI should clearly distinguish:

* Actual data
* Calculations
* Observations
* Suggestions
* Uncertainty

Example:

Fact:
"You spent RM820 on food this month."

Observation:
"Food was one of your largest spending categories."

Suggestion:
"You could consider reviewing your food spending next month."

Suggestions must not be presented as guaranteed outcomes.

---

## 12. Financial Advice Boundary

The application is primarily for financial tracking, organization, and analysis.

The AI should not present itself as a professional financial adviser.

For topics involving investments, loans, taxes, insurance, cryptocurrency, or other complex financial decisions, the application should provide appropriate caution and avoid presenting uncertain information as guaranteed financial advice.

Investment and cryptocurrency tracking are NOT part of V1.

---

## 13. Privacy and Security

Financial information is sensitive.

The application should minimize unnecessary collection, storage, transmission, and logging of sensitive information.

The application must NOT request or store:

* Bank passwords
* Bank login credentials
* Crypto exchange passwords
* Crypto wallet private keys
* Payment account credentials

API keys and secrets must never be placed directly in frontend source code or committed to GitHub.

Environment variables or an appropriate secret-management approach must be used.

Sensitive data should not be unnecessarily written to application logs.

Real personal financial data should not be committed to the public GitHub repository.

Development and testing should use fake/test data whenever possible.

---

## 14. Reliability Principles

The core finance application should remain usable even when AI is unavailable.

AI failure must not prevent the user from:

* Viewing transactions
* Adding transactions
* Editing transactions
* Deleting transactions
* Viewing the dashboard
* Viewing budgets
* Viewing savings goals

The application should handle:

* Invalid amounts
* Missing required fields
* Invalid dates
* Duplicate submissions
* Accidental deletion
* Network failures
* AI failures
* Database failures
* Missing data

Financial calculations should be performed by reliable application logic rather than relying on the AI to calculate important totals.

---

## 15. Mobile-first Requirement

The primary target device is a phone.

The application should therefore prioritize:

* Mobile-friendly layout
* Fast expense entry
* Large and usable buttons
* Easy-to-read dashboard
* Responsive charts
* Simple forms
* Easy editing
* Minimal unnecessary navigation

The user should be able to record an expense quickly after spending money.

---

## 16. Multi-user Support

Multi-user functionality is a future feature.

The long-term goal is potentially allowing friends and family to use the application independently.

However:

* Multi-user functionality is NOT required for V1.
* Users must not share financial data with other users.
* One user's data must not be visible to another user.
* Authentication and authorization must be properly designed before multi-user support is implemented.

The future multi-user architecture must not compromise the original privacy principle.

---

## 17. Features Explicitly Deferred

The following are NOT part of V1:

* Payment method tracking
* Transaction search
* CSV import/export
* Receipt scanning
* Investment tracking
* Cryptocurrency tracking
* Bank integration
* Crypto exchange integration
* Automatic financial transaction synchronization
* Financial transaction execution
* Multi-user accounts
* Advanced reward/gamification system
* Advanced AI agents
* Complex automation systems

These may be reconsidered after V1.

---

## 18. Development Philosophy

The project should prioritize:

1. Working software
2. Understanding
3. Safety
4. Reliability
5. Simplicity
6. Maintainability
7. Features

A smaller finished application is preferable to a large unfinished application.

AI coding assistants may write code, but the project owner remains responsible for understanding, reviewing, testing, and deciding what gets implemented.

Core development workflow:

Plan → One change → Test → Commit

If something breaks:

Investigate → Understand the cause → Fix the specific problem → Test again

Do not repeatedly ask an AI coding assistant to "fix everything" without understanding the problem.

---

## 19. AI Coding Rules

Before modifying the project, an AI coding assistant should:

1. Read this file.
2. Read V1_CHECKLIST.md.
3. Understand the existing project structure.
4. Explain the relevant existing architecture when necessary.
5. Avoid unnecessary rewrites.
6. Make the smallest reasonable change.
7. Preserve existing working functionality.
8. Test the change.
9. Report what changed.

An AI coding assistant must not introduce a new library, framework, service, database, API, or architectural pattern without a reasonable project-specific reason.

Before creating a new project file, consider whether an existing file can reasonably handle the requirement without becoming unnecessarily complicated.

---

## 20. Git Safety

Git is the project's safety net.

Before significant changes:

1. Ensure the application is working.
2. Commit the working state.
3. Make one meaningful change.
4. Test.
5. Commit if successful.

Small, meaningful commits are preferred over large unrelated commits.

---

## 21. Definition of V1

V1 is considered complete when the user can:

1. Open the application on a phone.
2. View the dashboard.
3. Add an expense.
4. Add income.
5. Edit a transaction.
6. Change an incorrectly entered date.
7. Delete a transaction safely.
8. Categorize spending.
9. Select a meal type for food.
10. View monthly income.
11. View monthly expenses.
12. View remaining money.
13. View category spending.
14. View spending charts.
15. Create category budgets.
16. See remaining budget.
17. Receive an overspending warning.
18. Create a savings goal.
19. View savings progress.
20. Ask the AI about monthly spending.
21. Receive an analysis based on actual application data.
22. Receive suggestions without the AI making decisions on the user's behalf.
23. Continue using the core finance features if the AI service is unavailable.
24. Use the application without providing bank, crypto, payment, or investment account credentials.

V1 must also pass a safety and reliability review before being considered finished.

---

## 22. V1 Review

After V1 is complete, do not immediately begin V2.

Perform a V1 review:

* What did we plan?
* What did we actually build?
* What did we forget?
* What features were unnecessary?
* What was difficult?
* What bugs remain?
* What safety risks remain?
* What privacy risks remain?
* What parts of the user experience are frustrating?
* What should be improved?
* What should be removed?
* What should become V1.1?
* What did we learn about building software with AI?

Only after this review should the next development phase be planned.

---

## 23. Permanent Product Boundary

The following statement is a permanent project rule:

> Finance AI App helps users TRACK, UNDERSTAND, and IMPROVE their financial habits. It does not MOVE, CONTROL, or EXECUTE their money.

Any future feature that could potentially violate this principle must be reviewed before implementation.
