# Finance AI App — V1 Checklist

This is the master checklist for completing V1.

Use this file to track progress.

Do not mark an item complete unless it has been implemented and tested.

---

# 1. Project Setup

* [x] VS Code installed
* [x] Git installed
* [x] GitHub account ready
* [x] Git repository created
* [x] GitHub repository connected
* [x] README.md created
* [x] Initial Git commit created
* [ ] PROJECT_SPEC.md created
* [ ] V1_CHECKLIST.md created
* [ ] Commit project documentation
* [ ] Choose technology stack
* [ ] Define application architecture
* [ ] Define database/storage approach
* [ ] Create initial application structure
* [ ] Run initial application successfully

---

# 2. Mobile Foundation

* [ ] Mobile-first layout
* [ ] Responsive design
* [ ] Dashboard usable on phone
* [ ] Add Expense flow usable on phone
* [ ] Add Income flow usable on phone
* [ ] Forms are easy to use
* [ ] Buttons are easy to tap
* [ ] Charts are readable on phone
* [ ] Navigation is simple

---

# 3. Expense Transactions

## Add Expense

* [ ] Add Expense screen
* [ ] Amount field
* [ ] Category selection
* [ ] Food meal selection
* [ ] Date field
* [ ] Date defaults to today
* [ ] Date can be changed
* [ ] Optional notes
* [ ] Save transaction
* [ ] Successful save confirmation
* [ ] Dashboard updates after saving

## Validation

* [ ] Amount cannot be invalid
* [ ] Required fields are validated
* [ ] Invalid input shows a useful message
* [ ] Duplicate submission is prevented

## Edit

* [ ] Edit transaction
* [ ] Edit amount
* [ ] Edit category
* [ ] Edit meal type
* [ ] Edit date
* [ ] Edit notes
* [ ] Save changes
* [ ] Dashboard recalculates after editing

## Delete

* [ ] Delete transaction
* [ ] Confirmation before deletion
* [ ] Transaction is removed correctly
* [ ] Dashboard recalculates after deletion

---

# 4. Income Transactions

* [ ] Add Income screen
* [ ] Manual income amount
* [ ] Income category
* [ ] Income date
* [ ] Editable income date
* [ ] Optional notes
* [ ] Save income
* [ ] Edit income
* [ ] Delete income
* [ ] Dashboard updates correctly

Income must remain flexible and must NOT be hard-coded to a fixed salary.

---

# 5. Categories

* [ ] Initial expense categories
* [ ] Initial income categories
* [ ] Food category
* [ ] Meal types
* [ ] Category stored correctly
* [ ] Category displayed correctly
* [ ] Architecture allows future custom categories

---

# 6. Dashboard

* [ ] Monthly income
* [ ] Monthly expenses
* [ ] Remaining money
* [ ] Category spending
* [ ] Recent transactions
* [ ] Spending chart
* [ ] Category breakdown
* [ ] Dashboard updates automatically
* [ ] Correct month selected
* [ ] Correct totals displayed

### Calculation

* [ ] Remaining money = income - expenses
* [ ] Calculations use actual transaction data
* [ ] No duplicated/inconsistent calculation source

---

# 7. Category Budgets

* [ ] Create category budget
* [ ] Edit category budget
* [ ] View category budget
* [ ] Calculate category spending
* [ ] Calculate budget remaining
* [ ] Detect overspending
* [ ] Display overspending warning
* [ ] Budget updates when transaction changes
* [ ] Budget updates when transaction is deleted

---

# 8. Savings Goals

* [ ] Create savings goal
* [ ] Custom goal name
* [ ] Target amount
* [ ] Current amount/progress
* [ ] Optional target date
* [ ] Edit goal
* [ ] View goal
* [ ] Display progress
* [ ] Validate goal amounts

### Deferred

* [ ] Reward/gamification system — V1.1/V2

---

# 9. Recurring Expenses

* [ ] Define recurring expense structure
* [ ] Store recurring expense information
* [ ] Detect potential recurring patterns
* [ ] Explain why an expense appears recurring
* [ ] Ask user for confirmation
* [ ] User can reject suggestion
* [ ] User can confirm suggestion
* [ ] Only create recurring expense after confirmation

### Safety requirement

* [ ] AI cannot silently create recurring expenses

---

# 10. AI Assistant

## V1 AI

* [ ] Select AI model/service
* [ ] Secure AI API configuration
* [ ] Connect application to AI
* [ ] Send relevant financial data to AI
* [ ] Monthly spending summary
* [ ] AI response displayed clearly
* [ ] AI response based on actual application data
* [ ] Handle AI unavailable/error state

## Future AI

* [ ] Ask questions about spending
* [ ] Natural-language financial questions
* [ ] Identify unusual spending
* [ ] Compare months
* [ ] Suggest areas to pay attention to
* [ ] Personalized saving plans
* [ ] Recurring expense detection
* [ ] Savings goal assistance
* [ ] AI-assisted actions with user confirmation

---

# 11. AI Safety

* [ ] AI cannot access bank accounts
* [ ] AI cannot access crypto accounts
* [ ] AI cannot access payment accounts
* [ ] AI cannot execute financial transactions
* [ ] AI cannot transfer money
* [ ] AI cannot buy/sell investments
* [ ] AI cannot buy/sell crypto
* [ ] AI cannot silently modify financial records
* [ ] AI cannot silently create recurring expenses
* [ ] AI cannot silently modify budgets
* [ ] AI cannot silently modify savings goals
* [ ] AI cannot delete transactions without user confirmation
* [ ] AI does not invent financial data
* [ ] AI distinguishes facts from suggestions
* [ ] AI indicates uncertainty when appropriate
* [ ] AI does not present itself as a professional financial adviser
* [ ] AI failure does not break the core finance application

---

# 12. Privacy & Security

* [ ] No bank credentials requested
* [ ] No crypto exchange credentials requested
* [ ] No wallet private keys requested
* [ ] No payment account credentials requested
* [ ] No bank API integration
* [ ] No crypto API integration
* [ ] No transaction execution capability
* [ ] API keys stored securely
* [ ] API keys not included in frontend code
* [ ] .env protected
* [ ] .env excluded from Git
* [ ] No secrets committed to GitHub
* [ ] No unnecessary sensitive data in logs
* [ ] Test data used during development
* [ ] Real financial data not committed to GitHub
* [ ] User data access rules reviewed
* [ ] Privacy boundaries reviewed before V1 release

---

# 13. Reliability

* [ ] Invalid amounts handled
* [ ] Missing fields handled
* [ ] Invalid dates handled
* [ ] Duplicate submissions handled
* [ ] Delete confirmation works
* [ ] Network failure handled
* [ ] AI failure handled
* [ ] Database failure handled
* [ ] Missing data handled
* [ ] Application does not crash on expected invalid input
* [ ] Core finance features work without AI
* [ ] Financial calculations independently verified
* [ ] Existing functionality tested after major changes

---

# 14. Testing

## Transaction Tests

* [ ] Add normal expense
* [ ] Add food expense
* [ ] Add non-food expense
* [ ] Add income
* [ ] Edit expense
* [ ] Edit income
* [ ] Change transaction date
* [ ] Delete transaction
* [ ] Enter invalid amount
* [ ] Submit incomplete form
* [ ] Test duplicate submission

## Dashboard Tests

* [ ] Income total correct
* [ ] Expense total correct
* [ ] Remaining money correct
* [ ] Category totals correct
* [ ] Charts match transaction data
* [ ] Dashboard updates after adding transaction
* [ ] Dashboard updates after editing transaction
* [ ] Dashboard updates after deleting transaction

## Budget Tests

* [ ] Budget under limit
* [ ] Budget reaches limit
* [ ] Budget exceeds limit
* [ ] Budget updates after transaction edit
* [ ] Budget updates after transaction deletion

## Savings Tests

* [ ] Create goal
* [ ] Edit goal
* [ ] Correct progress displayed
* [ ] Invalid goal amount handled

## AI Tests

* [ ] AI receives correct data
* [ ] AI does not invent totals
* [ ] AI answers using actual transaction data
* [ ] AI handles insufficient data
* [ ] AI failure handled
* [ ] AI suggestions clearly identified
* [ ] AI cannot perform unauthorized actions

---

# 15. Git Checkpoints

Before significant development:

* [ ] Commit clean project state

After each meaningful feature:

* [ ] Test feature
* [ ] Review changes
* [ ] Commit feature

Before major architectural changes:

* [ ] Create Git checkpoint
* [ ] Verify application works
* [ ] Make change
* [ ] Test
* [ ] Commit or revert

---

# 16. V1 Completion Test

The following complete user journey must work:

* [ ] Open app
* [ ] View dashboard
* [ ] Add an expense
* [ ] Enter amount
* [ ] Select category
* [ ] Select meal if Food
* [ ] Date defaults to today
* [ ] Change date
* [ ] Add notes
* [ ] Save expense
* [ ] Dashboard updates
* [ ] Add income
* [ ] Dashboard updates
* [ ] Edit transaction
* [ ] Dashboard recalculates
* [ ] Delete transaction
* [ ] Dashboard recalculates
* [ ] Create category budget
* [ ] View budget remaining
* [ ] Trigger overspending warning
* [ ] Create savings goal
* [ ] View savings progress
* [ ] Ask AI about spending
* [ ] Receive data-based AI analysis
* [ ] Receive improvement suggestions
* [ ] Core application continues working if AI is unavailable

---

# 17. V1 Safety Review

Before declaring V1 complete:

* [ ] Review PROJECT_SPEC.md
* [ ] Review every safety requirement
* [ ] Review privacy requirements
* [ ] Test AI boundaries
* [ ] Test invalid input
* [ ] Test accidental deletion
* [ ] Test AI failure
* [ ] Test data calculation accuracy
* [ ] Check GitHub for accidentally exposed secrets
* [ ] Check that no bank/crypto/payment connection exists
* [ ] Confirm application is tracking-only
* [ ] Confirm user remains in control of financial decisions

---

# 18. V1 Retrospective

After V1 works, STOP development temporarily and review the project.

## What did we plan?

* [ ] Compare final application against PROJECT_SPEC.md

## What did we miss?

* [ ] Identify forgotten requirements
* [ ] Identify unexpected problems

## What should change?

* [ ] User experience improvements
* [ ] Safety improvements
* [ ] Reliability improvements
* [ ] Performance improvements
* [ ] Architecture improvements

## Feature review

* [ ] Features that should be added
* [ ] Features that should be removed
* [ ] Features that should move to V1.1
* [ ] Features that should remain deferred

## AI review

* [ ] What AI features were useful?
* [ ] What AI features were unreliable?
* [ ] What AI capabilities should be improved?
* [ ] Are additional AI tools actually necessary?

## Final decision

* [ ] V1 retrospective completed
* [ ] V1.1 scope defined
* [ ] V2 ideas documented separately
* [ ] No new feature started until review is complete

---

# 19. Permanent Project Rule

> Track → Understand → Improve.

The application records and analyzes financial activity.

It does NOT move, control, or execute the user's money.
