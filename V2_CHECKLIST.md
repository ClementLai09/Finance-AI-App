# Finance AI App — V2 Checklist

## V2 Goal

Make Finance AI App fast, polished, private, and effortless to use on mobile while preserving everything that already works in V1.

---

# Phase 2A — V2 Planning

## Planning

* [x] Create `V2_PLAN.md`
* [x] Create `V2_CHECKLIST.md`
* [ ] Review V2 scope
* [ ] Confirm V2 priorities
* [ ] Confirm V2 success criteria
* [ ] Commit V2 planning files

**Checkpoint:** V2 planning is complete and committed before implementation begins.

---

# Phase 2B — Performance + Mobile Foundation

## R1 — Slow Navigation

### Investigation

* [ ] Reproduce slow navigation
* [ ] Test Dashboard → Transactions
* [ ] Test Transactions → Categories
* [ ] Test Categories → Dashboard
* [ ] Record before-fix navigation timing/evidence for the affected flows
* [ ] Inspect page rendering behaviour
* [ ] Inspect Supabase queries
* [ ] Check for sequential data fetching
* [ ] Check for duplicate/unnecessary requests
* [ ] Check for unnecessary page refreshes
* [ ] Check `router.refresh()` usage
* [ ] Check loading behaviour
* [ ] Identify the main bottleneck
* [ ] Document the investigation hypothesis and identified bottleneck before changing code

### Fix

* [ ] Implement the smallest appropriate performance fix
* [ ] Re-test affected navigation
* [ ] Record comparable after-fix timing/evidence and compare with the baseline
* [ ] Confirm no functionality regression
* [ ] Run automated tests
* [ ] Run production build

---

## R2 — iPhone Safari Input Zoom

* [ ] Reproduce input zoom issue on iPhone
* [ ] Test amount input
* [ ] Test notes input
* [ ] Test other relevant text inputs
* [ ] Identify cause
* [ ] Implement mobile input fix
* [ ] Test on iPhone Safari
* [ ] Confirm page no longer unexpectedly zooms
* [ ] Confirm desktop behaviour remains correct

---

## Loading Experience

* [ ] Review current loading states
* [ ] Identify pages/actions that need better feedback
* [ ] Improve loading behaviour where necessary
* [ ] Avoid unnecessary loading indicators
* [ ] Test navigation and data loading

---

## Mobile Form Foundation

* [ ] Review mobile form layouts
* [ ] Review input sizing
* [ ] Review touch target sizes
* [ ] Review spacing
* [ ] Review keyboard behaviour
* [ ] Review form scrolling
* [ ] Test Add Expense
* [ ] Test Add Income
* [ ] Test Edit Transaction

### Phase 2B Checkpoint

* [ ] Performance issue investigated and addressed
* [ ] iPhone input zoom fixed
* [ ] Mobile forms tested
* [ ] Automated tests pass
* [ ] Production build passes
* [ ] Changes reviewed
* [ ] Git commit created
* [ ] Verify new dependencies, services, APIs, and infrastructure remain compatible with $0 ongoing cost

---

# Phase 2C — Core Daily UX

## Faster Add Expense

This improves the existing Add Expense form/workflow; it is not a separate
entry point.

* [ ] Review current Add Expense flow
* [ ] Remove unnecessary friction
* [ ] Optimize amount input
* [ ] Optimize category selection
* [ ] Keep optional fields accessible
* [ ] Confirm Save flow is simple
* [ ] Test on desktop
* [ ] Test on iPhone

---

## Quick Add Expense

This is a separate, easy-to-reach entry point for rapid expense entry. It may
reuse the existing Add Expense form; it should not create a competing workflow.

* [ ] Design Quick Add entry point
* [ ] Implement Quick Add Expense
* [ ] Ensure mobile accessibility
* [ ] Ensure existing Add Expense functionality remains intact
* [ ] Test save flow
* [ ] Test cancellation/back behaviour

---

## Frequently Used / Recent Categories

* [ ] Review current category selection
* [ ] Decide simplest useful approach
* [ ] Implement recent/frequently used category access
* [ ] Avoid unnecessary backend complexity
* [ ] Test category selection
* [ ] Test archived categories

---

## Dashboard Hierarchy

* [ ] Make Remaining money clearly visible
* [ ] Improve Income hierarchy
* [ ] Improve Expenses hierarchy
* [ ] Make selected month obvious
* [ ] Review Recent Transactions placement
* [ ] Review Budget information
* [ ] Review Category Breakdown
* [ ] Review Spending Chart
* [ ] Decide whether savings-goal progress belongs on the Dashboard; do not add it automatically
* [ ] If Dashboard savings progress is approved, implement and test it on desktop and mobile
* [ ] Test desktop layout
* [ ] Test mobile layout

---

## Action Feedback

* [ ] Improve transaction save feedback
* [ ] Improve transaction edit feedback
* [ ] Improve transaction delete feedback
* [ ] Improve budget feedback
* [ ] Improve savings goal feedback
* [ ] Ensure feedback is clear but not intrusive

---

## Empty States

* [ ] Review empty Dashboard
* [ ] Review empty Transactions
* [ ] Review empty Categories
* [ ] Review empty Budgets
* [ ] Review empty Savings Goals
* [ ] Review empty AI Analysis
* [ ] Improve messaging/actions where needed

### Phase 2C Checkpoint

* [ ] Daily expense flow feels fast
* [ ] Quick Add works
* [ ] Common categories are easy to select
* [ ] Dashboard hierarchy improved
* [ ] Feedback states improved
* [ ] Empty states improved
* [ ] Automated tests pass
* [ ] Production build passes
* [ ] Changes reviewed
* [ ] Git commit created
* [ ] Verify new dependencies, services, APIs, and infrastructure remain compatible with $0 ongoing cost

---

# Phase 2D — Privacy + Account UX

## Dashboard Privacy

* [ ] Add eye / eye-slash control
* [ ] Hide Income amount
* [ ] Hide Expenses amount
* [ ] Hide Remaining amount
* [ ] Show values again
* [ ] Persist preference locally
* [ ] Confirm no database changes are required
* [ ] Test desktop
* [ ] Test iPhone

---

## Password Visibility

* [ ] Add password visibility toggle to Login
* [ ] Add password visibility toggle to Signup
* [ ] Add password visibility toggle to Change Password
* [ ] Add password visibility toggle to Reset Password
* [ ] Confirm default state is hidden
* [ ] Confirm toggle works correctly
* [ ] Test on mobile

---

## Account

* [ ] Display signed-in email
* [ ] Add Change Password
* [ ] Add Forgot Password / Reset Password
* [ ] Add Logout
* [ ] Add Delete Account
* [ ] Add deliberate delete confirmation
* [ ] Require an authenticated session and verify the requested account matches the signed-in user
* [ ] Explain before confirmation that deletion is permanent and removes the user's saved financial data
* [ ] Confirm deletion removes that user's categories, transactions, budgets, and savings goals through the existing ownership/cascade behavior
* [ ] Keep any elevated account-deletion credential server-side
* [ ] Test account flows
* [ ] Test authentication regression

### Phase 2D Checkpoint

* [ ] Privacy mode works
* [ ] Password visibility works
* [ ] Account information works
* [ ] Password management works
* [ ] Delete account works safely
* [ ] Automated tests pass
* [ ] Production build passes
* [ ] Changes reviewed
* [ ] Git commit created
* [ ] Verify new dependencies, services, APIs, and infrastructure remain compatible with $0 ongoing cost

---

# Phase 2E — Visual Redesign

## Global Design System

* [ ] Implement final color system
* [ ] Implement typography hierarchy
* [ ] Standardize spacing
* [ ] Standardize cards
* [ ] Standardize buttons
* [ ] Standardize inputs
* [ ] Standardize icons
* [ ] Standardize borders/shadows
* [ ] Review responsive behaviour

---

## Dashboard

* [ ] Redesign Dashboard
* [ ] Preserve all existing functionality
* [ ] Test calculations
* [ ] Test charts
* [ ] Test budgets
* [ ] Test savings information
* [ ] Only if approved during Phase 2C, include and test Dashboard savings-goal progress
* [ ] Test mobile layout

---

## Transactions

* [ ] Redesign Transactions
* [ ] Preserve add/edit/delete
* [ ] Add simple search/filter only if explicitly approved as V2 scope; do not assume it exists in V1
* [ ] Test mobile layout

---

## Categories

* [ ] Redesign Categories
* [ ] Preserve create
* [ ] Preserve duplicate protection
* [ ] Preserve archive/unarchive

---

## Budgets

* [ ] Redesign Budgets
* [ ] Preserve create/edit/delete
* [ ] Preserve overspending warning
* [ ] Preserve calculations

---

## Savings Goals

* [ ] Redesign Savings Goals
* [ ] Preserve create/edit/delete
* [ ] Preserve progress calculations

---

## AI Analysis

* [ ] Redesign AI Analysis
* [ ] Preserve monthly analysis
* [ ] Preserve empty-month handling
* [ ] Preserve suggestions
* [ ] Preserve $0 AI requirement

---

## Authentication

* [ ] Redesign Login
* [ ] Redesign Signup
* [ ] Preserve authentication behaviour
* [ ] Preserve password visibility
* [ ] Test mobile

---

## Account

* [ ] Redesign Account page
* [ ] Preserve account functionality
* [ ] Test mobile

---

## Navigation

* [ ] Redesign navigation
* [ ] Keep navigation simple
* [ ] Preserve all routes
* [ ] Test desktop
* [ ] Test mobile

### Phase 2E Checkpoint

* [ ] All major pages redesigned
* [ ] Design system consistent
* [ ] Existing functionality preserved
* [ ] Desktop tested
* [ ] iPhone tested
* [ ] Automated tests pass
* [ ] Production build passes
* [ ] Changes reviewed
* [ ] Git commit created
* [ ] Verify new dependencies, services, APIs, and infrastructure remain compatible with $0 ongoing cost

---

# Phase 2F — Brand

## App Icon

* [ ] Design new app icon direction
* [ ] Generate/select final icon
* [ ] Confirm icon remains clear at small size
* [ ] Update PWA icon
* [ ] Update relevant metadata
* [ ] Test iPhone home-screen icon

### Phase 2F Checkpoint

* [ ] Verify icon/metadata work introduces no paid service, paid trial, billing risk, or unnecessary dependency
* [ ] Changes reviewed
* [ ] Git commit created

---

# Phase 2G — Final V2 Testing

## Automated

* [ ] All existing tests pass
* [ ] New V2 tests pass
* [ ] No regression detected

## V1 Regression Checks

* [ ] Decimal-safe transaction calculations remain correct
* [ ] Category duplicate protection and archive/unarchive behaviour remain correct
* [ ] Budget user/category/month uniqueness remains correct
* [ ] Savings-goal current amount remains within its target limit
* [ ] Dashboard selected-month calculations remain correct
* [ ] Empty-month AI analysis remains unavailable when there is no relevant data
* [ ] Login credentials never appear in the URL
* [ ] Existing financial data persists across logout and re-login
* [ ] Existing signup, login, logout, session, and protected-route behaviour remains correct

---

## Production

* [ ] Production build passes
* [ ] Production deployment succeeds
* [ ] Production environment variables remain correct
* [ ] No unexpected paid services/costs introduced

---

## Desktop Manual Test

* [ ] Login
* [ ] Signup
* [ ] Dashboard
* [ ] Transactions
* [ ] Add transaction
* [ ] Edit transaction
* [ ] Delete transaction
* [ ] Categories
* [ ] Budgets
* [ ] Savings Goals
* [ ] AI Analysis
* [ ] Account
* [ ] Password flows
* [ ] Privacy mode
* [ ] Logout
* [ ] Re-login

---

## iPhone Manual Test

* [ ] Login
* [ ] Signup
* [ ] Dashboard
* [ ] Navigation
* [ ] Add Expense
* [ ] Add Income
* [ ] Edit transaction
* [ ] Delete transaction
* [ ] Input fields
* [ ] Safari zoom behaviour
* [ ] Quick Add Expense
* [ ] Privacy mode
* [ ] Password visibility
* [ ] Budgets
* [ ] Savings Goals
* [ ] AI Analysis
* [ ] Account
* [ ] Logout
* [ ] Re-login
* [ ] PWA

---

# Real-Life Testing

After V2 release:

* [ ] Use the application normally
* [ ] Record real-life problems
* [ ] Record slow interactions
* [ ] Record confusing UI
* [ ] Record missing functionality
* [ ] Record feature ideas
* [ ] Do not immediately fix every issue
* [ ] Collect feedback before V3 planning

---

# V2 Completion Criteria

V2 can be marked complete only when:

* [ ] Navigation feels responsive
* [ ] iPhone input zoom issue is resolved
* [ ] Daily expense entry is convenient
* [ ] Dashboard is immediately understandable
* [ ] Financial numbers can be hidden
* [ ] Password visibility works
* [ ] Account experience is usable
* [ ] Visual design is consistent
* [ ] Mobile experience is polished
* [ ] App icon/branding is updated
* [ ] Automated tests pass
* [ ] Production build passes
* [ ] Desktop manual testing passes
* [ ] iPhone manual testing passes
* [ ] Real-life testing begins

---

# Checkpoint Log

Use this section to record the current stopping point.

## Current Phase

**Phase 2A — V2 Planning**

## Current Task

**Create and review V2 planning files**

## Last Completed Checkpoint

**V1 officially complete → V2 planning started**

## Next Action

**Commit V2_PLAN.md + V2_CHECKLIST.md, then begin Phase 2B performance investigation.**

## Important Rule

Never mark a task complete based only on discussion.

A task is complete only after:

**Implementation → Test → Review → Confirmation → Commit**

---

# Git Checkpoints

## V2 Planning

* [ ] Planning commit

## Phase 2B

* [ ] Performance + mobile checkpoint commit

## Phase 2C

* [ ] Core UX checkpoint commit

## Phase 2D

* [ ] Privacy + account checkpoint commit

## Phase 2E

* [ ] Visual redesign checkpoint commit

## Phase 2F

* [ ] Brand checkpoint commit

## Phase 2G

* [ ] Final V2 release commit
