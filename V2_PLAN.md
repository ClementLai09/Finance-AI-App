# Finance AI App — V2 Plan

## 1. V2 Goal

**Make Finance AI App fast, polished, private, and effortless to use on mobile while preserving everything that already works in V1.**

V1 proved that the product works.

V2 focuses on improving:

* Performance
* Mobile experience
* Daily usability
* Privacy
* Account experience
* Visual design
* Product polish
* Brand identity

V2 must not break existing V1 functionality.

---

# 2. V2 Product Principles

## 2.1 Fast

The user should not feel like they are waiting between normal actions.

Examples:

* Dashboard → Transactions should feel immediate
* Transactions → Categories should feel immediate
* Save transaction → UI should update quickly
* Edit/delete → result should appear immediately
* Navigation should not unnecessarily reload the whole application

Do not blindly optimize.

First identify the actual cause of slow navigation before changing architecture.

---

## 2.2 Mobile First

The application is primarily expected to be used from an iPhone.

Mobile interactions must feel natural:

* No unwanted Safari zoom
* Inputs should be comfortable to use
* Buttons should be easy to tap
* Forms should fit smaller screens
* Important actions should be reachable quickly
* Content should not feel cramped
* Navigation should remain simple

---

## 2.3 Simple Daily Workflow

The most common action is expected to be recording a transaction.

The target workflow should be:

**Open app → Add expense → enter amount → select category → save**

The user should not have to navigate through unnecessary screens.

---

## 2.4 Clear Financial Information

The Dashboard should immediately answer:

1. How much money came in?
2. How much did I spend?
3. How much do I have remaining?

The "Remaining" amount should have strong visual hierarchy.

The selected month must always be clear.

Example:

**September 2026**

Income
RM X,XXX

Expenses
RM XXX

Remaining
RM X,XXX

---

## 2.5 Privacy

Financial information should be easy to hide when using the application around other people.

The user should be able to hide important financial numbers instantly.

Privacy controls should not require backend changes or additional services.

---

## 2.6 Premium but Simple

The visual direction:

**Clean Minimal × Premium Finance**

The app should look like a real modern finance product rather than a coding-project dashboard.

Avoid:

* Excessive gradients
* Excessive shadows
* Glassmorphism everywhere
* Cartoon-style graphics
* AI robot imagery
* Excessive animations
* Too many colors
* Visually noisy dashboards

---

# 3. Current Real-Life Problems

These problems were discovered through actual usage and should be treated as V2 priorities.

## R1 — Slow Navigation

### Problem

Navigation between pages feels noticeably slow.

Examples:

* Dashboard → Transactions
* Transactions → Categories
* Categories → other pages

### Priority

**P1 — High**

### Investigation

Before making changes, inspect:

* Server component rendering
* Client component rendering
* Supabase queries
* Sequential database requests
* Duplicate requests
* Full-page refreshes
* `router.refresh()`
* Unnecessary data fetching
* Loading behaviour
* Network latency
* Opportunities for parallel requests
* Appropriate caching/revalidation

### Acceptance Criteria

Normal navigation should feel responsive.

The user should not experience unnecessary waiting between common pages.

Do not solve the problem merely by adding a spinner.

Record before-fix timing/evidence for the affected flows, state the
investigation hypothesis and identified bottleneck before implementation, and
record comparable after-fix timing/evidence. This is a focused comparison of
the reported flows, not a broad benchmarking exercise.

---

# 4. Mobile Problems

## R2 — iPhone Safari Input Zoom

### Problem

Tapping fields such as:

* Amount
* Notes
* Other text inputs

causes Safari to zoom into the page.

### Priority

**P1 — High**

### Acceptance Criteria

On iPhone:

* Amount input does not trigger unwanted zoom
* Notes input does not trigger unwanted zoom
* Other common form inputs behave naturally
* Page remains visually stable
* User does not need to manually zoom back out

---

# 5. Core UX Improvements

## F1 — Faster Add Expense Flow

### Priority

P1

The Add Expense experience should be optimized for repeated daily use.

This means improving the existing Add Expense form/workflow. It does not mean
creating a separate entry point.

Target:

**Amount → Category → Save**

Optional fields such as date and notes should remain available without creating unnecessary friction.

---

## F2 — Quick Add Expense

### Priority

P1

Provide an easily accessible way to start adding an expense.

Quick Add is a separate, easily accessible entry point for rapid expense entry.
It may open or reuse the existing Add Expense form; it should not create a
second, conflicting expense workflow. F1 improves the existing form itself.

Especially important on mobile.

Possible implementation:

* Dashboard Quick Add Expense button
* Persistent mobile action
* Clearly visible primary action

Do not create unnecessary navigation complexity.

---

## F3 — Frequently Used Categories

### Priority

P2

Make commonly used categories easier to select.

Possible approaches:

* Recent categories
* Frequently used categories
* Simple category ordering

Do not introduce complicated personalization systems.

---

## F4 — Better Save / Edit / Delete Feedback

### Priority

P2

Users should clearly understand when an action succeeds.

Examples:

* Transaction saved
* Transaction updated
* Transaction deleted
* Budget saved
* Savings goal updated

Feedback should be subtle and professional.

Avoid excessive popups.

---

## F5 — Better Loading States

### Priority

P1

Improve perceived responsiveness while preserving actual performance improvements.

Loading states should:

* appear only when necessary
* communicate what is loading
* avoid excessive layout movement
* not make the application feel slower

Skeletons or lightweight loading states may be used where appropriate.

---

## F6 — Better Empty States

### Priority

P2

Empty screens should clearly explain:

* What the user is seeing
* Why it is empty
* What they can do next

Examples:

* No transactions
* No budgets
* No savings goals
* No AI analysis available

Empty states should encourage useful action without being visually noisy.

---

# 6. Dashboard Improvements

## Goal

The Dashboard should become the clearest and most useful screen in the application.

### Priority

P1

### Requirements

Improve:

* Income hierarchy
* Expense hierarchy
* Remaining money hierarchy
* Month context
* Recent transactions
* Category breakdown
* Spending chart
* Budget information
* Whether savings-goal progress belongs on the Dashboard (an explicit V2
  decision; do not add it automatically). If approved and included, test the
  displayed progress on desktop and mobile.

### Main hierarchy

The user should immediately see:

**Remaining**

followed by:

**Income / Expenses**

Then supporting information.

---

# 7. Dashboard Privacy Mode

## F7 — Financial Number Hide/Show

### Priority

P1

Add a single eye / eye-slash control to hide or show important financial numbers.

The control should affect:

* Monthly income
* Monthly expenses
* Remaining money

### Behaviour

Example:

Visible:

**RM 3,355.75**

Hidden:

**••••••**

One control should manage all three values.

### Storage

Prefer local browser/device preference.

Do not store the setting in the database.

Do not introduce additional backend cost.

### Scope

Initially hide financial amounts only.

Do not hide:

* Category names
* Transaction descriptions
* Navigation labels

---

# 8. Authentication UX

## F8 — Password Visibility Toggle

### Priority

P2

Add an eye icon to password fields.

Apply to:

* Login
* Signup
* Change password
* Reset password

Behaviour:

* Default: password hidden
* Tap eye: show password
* Tap again: hide password

No password should be exposed elsewhere.

---

# 9. Account Experience

## Priority

P2

Improve account/profile experience.

Potential account page:

* Signed-in email
* Change password
* Forgot password / reset password
* Logout
* Delete account

### Delete Account

Delete account should require deliberate confirmation.

Require an authenticated session and verify the requesting user is the account
being deleted. Before final confirmation, clearly explain that deletion is
permanent and removes the user's saved financial data. The existing schema
uses cascading ownership foreign keys, so deleting the Supabase Auth user is
expected to delete that user's categories, transactions, budgets, and savings
goals as well. Do not leave account or data retention behaviour ambiguous.

Do not make deletion easy to trigger accidentally. Any elevated account-delete
operation must remain server-side, with no privileged credential exposed to
the browser.

This feature should be tested carefully before release.

---

# 10. Visual Design System

## Design Direction

**Clean Minimal × Premium Finance**

### Colors

Primary:

* Deep navy

Supporting:

* White
* Off-white
* Light neutral surfaces
* Soft borders

Semantic:

* Green → income / positive
* Red → expenses / warnings
* Neutral → supporting information

Use colors with restraint.

---

## Typography

Use a clear hierarchy:

1. Page title
2. Main financial number
3. Section heading
4. Supporting number
5. Body text
6. Metadata

Financial numbers should be highly readable.

---

## Cards

Use:

* Moderate corner radius
* Subtle border
* Very light shadow where useful
* Consistent internal spacing

Avoid excessive floating cards.

---

## Buttons

Primary actions should be visually obvious.

Examples:

* Add Expense
* Add Income
* Save
* Create Budget
* Create Goal

Secondary actions should not compete with primary actions.

---

## Inputs

Inputs should be:

* Clear
* Large enough for mobile
* Easy to tap
* Consistent across the application
* Visually aligned

Special attention must be given to iPhone Safari behaviour.

---

## Icons

Use professional, consistent icons.

Avoid mixing multiple icon styles.

---

# 11. Page-by-Page UI Redesign

## Dashboard

Focus:

* Remaining money
* Income
* Expenses
* Month
* Quick Add Expense
* Recent transactions
* Budget progress
* Category breakdown
* Spending chart
* Include savings-goal progress only if approved by the Dashboard decision in
  Section 6

---

## Transactions

Focus:

* Clear transaction list
* Search/filter may be considered only if explicitly approved as V2 scope; do
  not assume this functionality exists in V1
* Easy editing
* Easy deletion
* Strong Add Transaction action
* Mobile-friendly layout

---

## Categories

Focus:

* Clear category organization
* Add category
* Archive/unarchive
* Duplicate protection
* Simple visual hierarchy

Do not change existing category business logic unnecessarily.

---

## Budgets

Focus:

* Budget amount
* Spent amount
* Remaining amount
* Progress
* Overspending warning

Make status immediately understandable.

---

## Savings Goals

Focus:

* Goal name
* Target amount
* Current progress
* Remaining amount
* Clear progress visualization

---

## AI Analysis

Focus:

* Clear monthly summary
* Spending observations
* Useful suggestions
* Easy-to-read sections

AI should remain a supporting feature.

The core finance tracking experience must work without AI.

---

# 12. Navigation

Navigation should be:

* Simple
* Predictable
* Mobile-friendly
* Consistent

Avoid unnecessary nested navigation.

Common destinations should be easy to reach.

Navigation must also be investigated as part of R1 performance work.

---

# 13. Responsive Design

The application must work well on:

* iPhone
* Mobile Safari
* Desktop Safari/Chrome
* Tablet-sized screens where practical

Mobile should not simply be a scaled-down desktop design.

Forms, spacing, navigation and actions should be intentionally designed for mobile.

---

# 14. Brand / App Icon

## Goal

Replace the current icon with a more professional finance-product identity.

### Direction

Possible concepts:

* Abstract "F"
* Growth/financial graph
* Wallet/card geometry
* Minimal financial symbol
* Geometric monogram

### Avoid

* Cartoon money bags
* Cartoon coins
* AI robots
* Childish illustrations
* Overly complicated graphics

The icon must remain recognizable at iPhone home-screen size.

---

# 15. Performance Rules

Performance changes must follow this process:

### Step 1 — Measure / Inspect

Identify where the delay actually comes from.

### Step 2 — Form a hypothesis

Example:

"Transactions navigation is slow because page X performs three sequential Supabase requests."

### Step 3 — Make the smallest appropriate change

Do not rewrite the entire architecture.

### Step 4 — Test

Run:

* Automated tests
* Production build
* Manual navigation testing

### Step 5 — Compare

Confirm that the user experience actually improved.

---

# 16. V2 Implementation Order

## Phase 2A — Planning

* Finalize V2 scope
* Finalize priorities
* Finalize acceptance criteria
* Create V2 checklist

**Status: Current**

---

## Phase 2B — Performance + Mobile Foundation

Priority: **P1**

1. Investigate R1 slow navigation
2. Fix navigation performance
3. Investigate/fix iPhone Safari input zoom
4. Improve loading states
5. Improve mobile form behaviour
6. Test desktop + iPhone

Do not redesign every page yet.

At each implementation-phase checkpoint, verify that new dependencies,
services, APIs, and infrastructure preserve the $0 ongoing-cost requirement.
Do not add paid services, paid trials, surprise-billing risk, or unnecessary
dependencies.

---

## Phase 2C — Core Daily UX

Priority: **P1**

1. Faster Add Expense
2. Quick Add Expense
3. Frequently used/recent categories
4. Dashboard hierarchy
5. Month context
6. Save/edit/delete feedback
7. Empty states

Goal:

**Make the app pleasant for daily use.**

---

## Phase 2D — Privacy + Account UX

Priority: **P1/P2**

1. Dashboard privacy eye
2. Password visibility eye
3. Account identity
4. Change password
5. Forgot/reset password
6. Delete account
7. Authentication regression testing

---

## Phase 2E — Visual Redesign

Priority: **P1**

Apply the design system consistently across:

1. Dashboard
2. Transactions
3. Categories
4. Budgets
5. Savings Goals
6. AI Analysis
7. Authentication
8. Account
9. Navigation
10. Mobile layouts

The redesign must preserve all existing functionality.

---

## Phase 2F — Brand

Priority: P2

1. New app icon
2. PWA icon
3. Metadata
4. Branding consistency
5. Home-screen appearance

---

## Phase 2G — V2 Testing

### Automated

* Existing tests remain passing
* Add tests for newly introduced logic
* No regression

### Production Build

* Production build passes
* No TypeScript errors
* No unexpected warnings affecting functionality

### Desktop

Test:

* Login
* Dashboard
* Transactions
* Categories
* Budgets
* Savings Goals
* AI Analysis
* Account
* Logout

### iPhone

Test:

* Login
* Navigation
* Add transaction
* Edit transaction
* Delete transaction
* Forms
* Safari zoom behaviour
* Privacy eye
* Password eye
* Dashboard
* Budgets
* Savings Goals
* AI Analysis
* PWA

### Real-Life Test

Use the application normally for real transactions.

Record:

* Bugs
* Friction
* Slow interactions
* Confusing UI
* Missing functionality
* New feature ideas

Do not immediately fix every issue.

Collect real-world feedback first.

---

# 17. V2 Success Criteria

V2 is considered complete when:

### Performance

* Normal navigation feels responsive
* No obvious unnecessary waiting
* Major bottlenecks identified and addressed

### Mobile

* iPhone Safari does not unexpectedly zoom on inputs
* Forms are comfortable to use
* Touch targets are practical
* Layout works correctly on small screens

### Daily Use

* Expense entry is quick
* Quick Add is easy to access
* Common categories are easy to select
* Save/edit/delete feedback is clear

### Dashboard

A user can immediately understand:

* Income
* Expenses
* Remaining
* Current month

### Privacy

* Financial numbers can be hidden instantly

### Authentication

* Password visibility toggle works
* Account information is clear
* Password management works
* Account deletion is protected by confirmation

### Visual Quality

The application looks like a polished modern finance product.

### Reliability

* Existing V1 functionality remains intact
* Automated tests pass
* Production build passes
* Desktop testing passes
* iPhone testing passes

---

# 18. What V2 Will NOT Include

To protect the $0 requirement and prevent scope creep, V2 will NOT focus on:

* Bank account integration
* Payment integration
* Moving money
* Crypto exchange integration
* Complex investment portfolio management
* Receipt scanning
* Complex recurring automation
* Social features
* Paid AI services
* Paid infrastructure
* Features that create unexpected recurring costs
* Large architecture rewrites without a demonstrated need

These can be considered for future versions.

---

# 19. Codex Rules for V2

Codex must:

1. Inspect the existing implementation before changing it.
2. Reuse existing components where practical.
3. Avoid unnecessary dependencies.
4. Avoid unnecessary architecture changes.
5. Preserve all working V1 functionality.
6. Do not change financial calculations unless specifically required.
7. Do not change authentication logic unless specifically required.
8. Do not introduce paid services.
9. Keep the project at $0 ongoing cost.
10. Make changes in small focused stages.
11. Run automated tests after each implementation stage.
12. Run a production build after major changes.
13. Do not modify unrelated files.
14. Do not modify `AGENTS.md` unless explicitly required.
15. Do not redesign the entire application in one giant change.
16. Do not remove working features simply to simplify implementation.
17. Explain the reason for significant architectural changes before implementing them.

---

# 20. V2 Definition

V1 proved:

**"I can build a working AI-assisted finance application."**

V2 should prove:

**"I can improve a real product based on actual user feedback, performance problems, mobile usability, privacy needs and product design."**

The goal is not simply to make the application prettier.

The goal is to make it **better to use.**

---

# V2 Target Outcome

**Fast.
Simple.
Professional.
Mobile-first.
Private.
Reliable.
$0 ongoing cost.**

A user should be able to open the app, understand their financial position, record an expense quickly, and leave without friction.
