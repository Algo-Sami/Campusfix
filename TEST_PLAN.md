# CampusFix — Comprehensive Quality Assurance & Test Plan

## 1. Overview
This test plan validates security, functional completeness, accessibility, and database-level permission integrity across the CampusFix application.

---

## 2. Test Suites

### Suite A: Authentication & Identity Protection
- [x] **TC-AUTH-01:** New user signup defaults to `student` role; client cannot submit `admin` role.
- [x] **TC-AUTH-02:** Profile trigger executes on `auth.users` insert and populates `public.profiles`.
- [x] **TC-AUTH-03:** Unauthenticated requests to `/dashboard`, `/issues`, `/admin` redirect to `/login`.
- [x] **TC-AUTH-04:** Non-admin authenticated user visiting `/admin` is intercepted server-side and redirected to `/dashboard`.
- [x] **TC-AUTH-05:** Password reset email triggers valid recovery callback to `/auth/reset-password`.

### Suite B: Issue Reporting & Duplicate Awareness
- [x] **TC-REP-01:** Guided reporting Step 1 filters similar issues by building and category before form entry.
- [x] **TC-REP-02:** User can directly upvote an existing report instead of creating a duplicate.
- [x] **TC-REP-03:** Mandatory validation enforced on title (min 5 chars), description (min 20 chars), category, building, and location.
- [x] **TC-REP-04:** Issue creation automatically initializes status to `Open` and assigns `created_by = auth.uid()`.

### Suite C: Feed, Upvoting & Community Engagement
- [x] **TC-FEED-01:** Feed renders issues with pagination (10 items/page), category icons, urgency badges, and locations.
- [x] **TC-FEED-02:** Keyword search filters title and description dynamically.
- [x] **TC-UPVOTE-01:** User can toggle upvote (insert/delete).
- [x] **TC-UPVOTE-02:** Database constraint `UNIQUE(issue_id, user_id)` guarantees at most one upvote per user.

### Suite D: Issue Lifecycle & Reporter Permissions
- [x] **TC-LIFE-01:** Reporter can edit their issue while status is `Open`.
- [x] **TC-LIFE-02:** Reporter can delete their issue while status is `Open`.
- [x] **TC-LIFE-03:** Once an issue transitions to `In Progress`, edit and delete options are disabled for reporters.
- [x] **TC-LIFE-04:** Post-resolution feedback form allows reporter to submit 1-5 star rating and confirmation if fixed.

### Suite E: Administrative Triage & Security RLS
- [x] **TC-ADM-01:** Admin can assign maintenance teams and adjust urgency levels.
- [x] **TC-ADM-02:** Transitioning status to `Resolved` requires mandatory resolution summary notes.
- [x] **TC-ADM-03:** Transitioning status to `Rejected` requires mandatory rejection reasons.
- [x] **TC-ADM-04:** Posting an official update automatically inserts a row into `notifications` for the reporter.
- [x] **TC-ADM-05:** Internal notes (`is_internal = true`) are visible only to admins and blocked for students by PostgreSQL RLS.
- [x] **TC-ADM-06:** Operational analytics calculate average and median resolution time strictly on completed issues (`created_at` to `resolved_at`).
