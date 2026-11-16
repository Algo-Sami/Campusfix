# CampusFix --- Product Requirements Document (PRD)

**Version:** 1.0\
**Status:** Draft for team review\
**Product:** CampusFix --- Smart Campus Issue & Maintenance Portal\
**Target platform:** Responsive web application\
**Primary users:** Students, faculty/staff, campus administrators and
maintenance personnel

------------------------------------------------------------------------

## 1. Product Overview

CampusFix is a centralized campus issue-reporting and
maintenance-management platform. It replaces scattered reports in
informal messaging groups and paper logs with a searchable, transparent
workflow.

Students and other permitted campus members can report problems, view
existing reports, support issues by upvoting them, and follow progress.
Administrators can review and prioritize reports, assign work,
communicate official updates, and close completed issues. Campus
leadership can use analytics to understand recurring problems and
service performance.

The product will be built with Next.js, React, TypeScript, Tailwind CSS,
Supabase and PostgreSQL, developed with Antigravity as an AI-assisted
development environment, and deployed to Vercel.

## 2. Problem Statement

Campus maintenance concerns---including broken laboratory equipment,
Wi-Fi dead zones, water leaks, electrical faults and damaged classroom
furniture---are often reported through disconnected channels. Reports
can be missed, duplicated or forgotten. Reporters may not know whether
anyone has acknowledged the problem, who is handling it, or when it has
been resolved.

CampusFix provides one reliable place to submit, organize, prioritize,
manage and track campus issues.

## 3. Product Goals

1.  Make reporting a campus issue simple and accessible.
2.  Reduce duplicate reports through search and community visibility.
3.  Help administrators prioritize issues using urgency, location, age
    and community support.
4.  Give reporters clear status updates and resolution information.
5.  Maintain an auditable history of administrative actions.
6.  Provide useful operational analytics without exposing private user
    information.
7.  Enforce role permissions in the database, not only in the user
    interface.

### 3.1 Success Measures

-   Number of valid issues submitted.
-   Percentage of issues receiving an administrative acknowledgement.
-   Median and average time from submission to resolution.
-   Percentage of issues resolved within the campus-defined service
    target.
-   Number and percentage of duplicate reports avoided or linked.
-   Upvote participation rate.
-   Percentage of resolved issues with resolution notes.
-   Student/faculty satisfaction collected through optional feedback.

Targets should be agreed with the university after a baseline period;
the application must not invent performance targets.

## 4. Scope

### 4.1 Included in the Complete Product

-   Authentication, profiles and role-based access.
-   Student/faculty issue submission and personal issue history.
-   Public campus issue feed with search, filters and sorting.
-   Duplicate-awareness flow and issue upvoting.
-   Issue details, status timeline and official updates.
-   Administrator triage, assignment, status management and resolution
    notes.
-   Administrative dashboard and operational analytics.
-   Notifications for important issue events.
-   Audit history, validation, accessibility and responsive design.
-   Secure Supabase database, Row Level Security and Vercel deployment.

### 4.2 Not Included in Initial Release

-   Native iOS or Android applications.
-   Automated integration with university asset-management or
    student-information systems.
-   AI-based issue classification or automatic assignment.
-   Predictive maintenance.
-   Public access by people outside the campus.
-   Payments, procurement or contractor invoicing.

These may be considered in later phases after the core workflow is
stable.

## 5. Users, Roles and Permissions

### 5.1 Student

A student can: - Register and sign in using an approved email account. -
View the campus issue feed and issue details. - Search and filter
issues. - Create an issue and view their own submissions. - Edit or
delete their own issue only while its status is `Open`, subject to
database policy. - Upvote or remove their upvote from an issue. - View
the status timeline and official updates. - Receive notifications about
relevant changes. - Submit optional feedback after resolution.

### 5.2 Faculty / Staff

Faculty and staff use the reporting experience and can submit and track
issues. The initial permission model may give them the same reporting
permissions as students, while retaining a distinct role for future
policy differences. The university must confirm whether faculty/staff
can view all campus reports or only reports in permitted areas.

### 5.3 Administrator

An administrator can: - View and manage campus issues. - Review issue
details and reporter-provided information. - Change priority and
status. - Assign an issue to a maintenance team or responsible staff
member. - Add official, timestamped updates and resolution notes. - Mark
an issue as rejected with a reason. - Reopen a resolved/closed issue
when appropriate. - View analytics and audit history. - Manage issue
categories, buildings, rooms, teams and service targets if configuration
management is enabled.

Only an authorized administrator can perform privileged actions. Hiding
controls in the frontend is not sufficient; Supabase RLS and secure
server-side checks must enforce permissions.

### 5.4 Maintenance Assignee

A maintenance assignee is a staff member or team responsible for
completing assigned work. If the university wants assignees to sign in,
introduce a dedicated `maintenance` role with limited permissions: view
assigned issues, add work-progress updates and submit completion
information. They must not receive administrator-wide permissions by
default.

### 5.5 Role Provisioning

-   New registrations receive the default `student` role.
-   Role changes must be performed through a trusted administrative
    process or controlled SQL operation.
-   Users must never be able to promote themselves by editing their
    profile.
-   Demo administrator setup must be documented and restricted to
    project owners.
-   The role used for authorization must come from a trusted database
    record, not from user-editable metadata.

## 6. Core User Journeys

### 6.1 Register and Sign In

1.  User opens the application.
2.  User creates an account with email and password or signs in.
3.  Supabase Auth verifies the account.
4.  A database trigger creates the user's profile with the default role.
5.  The application loads the profile and routes the user to the correct
    dashboard.
6.  A user without a valid profile receives a safe error/recovery path;
    access must not be granted based on an assumed role.

### 6.2 Report an Issue

1.  User opens the report form.
2.  User searches existing issues, preferably filtered by building and
    category.
3.  The application displays potentially matching open or recently
    reported issues.
4.  User can open an existing issue and upvote it instead of creating a
    duplicate.
5.  If the issue is new, user enters title, description, category,
    building, room/location and urgency.
6.  The application validates required fields and submits the issue.
7.  The issue is saved with status `Open`, creator identity and
    timestamps.
8.  The reporter sees a confirmation and can open the issue detail page.

### 6.3 Follow an Issue

1.  User opens the campus feed or their submissions.
2.  User filters or searches for an issue.
3.  User opens the issue detail page.
4.  User sees current status, priority, location, upvote count and
    public timeline.
5.  User receives an in-app notification when meaningful status or
    update events occur.

### 6.4 Administer an Issue

1.  Administrator opens the admin dashboard.
2.  Administrator reviews new and high-priority reports.
3.  Administrator checks for duplicates or insufficient information.
4.  Administrator may request clarification, link a duplicate to a
    canonical issue, adjust priority, assign a team and add an internal
    note.
5.  Administrator changes status using an allowed workflow transition.
6.  The system records the action and timestamp in the audit timeline.
7.  When work is complete, administrator records resolution notes and
    marks the issue `Resolved`.
8.  After any required confirmation period, the issue may be marked
    `Closed`.

## 7. Functional Requirements

### 7.1 Authentication and Profile Management

-   Email/password registration and sign-in using Supabase Auth.
-   Sign-out and session persistence.
-   Password reset flow.
-   Profile fields: user ID, display name, email, role, optional
    department, optional student/staff identifier, created timestamp and
    updated timestamp.
-   Profile row automatically created when an auth user is created.
-   Role-based routing:
    -   Student/faculty: `/dashboard`
    -   Administrator: `/admin`
    -   Sign-in and registration: `/login`, `/signup`
-   Unauthorized users must be redirected to an appropriate page and
    denied access to protected data at the database layer.

### 7.2 Issue Creation

Required fields: - Title. - Description. - Category. - Building. - Room
or precise campus location. - Urgency.

Initial categories: - IT & Wi-Fi - Electrical - Plumbing - Lab
Equipment - Furniture

Initial urgency values: - Low - Medium - High - Critical

System-generated fields: - Issue ID. - Creator user ID. - Status
(default `Open`). - Created and updated timestamps. - Upvote count
derived from the upvote relation, not trusted from a client-supplied
number.

Validation: - Title and description must be non-empty and have sensible
maximum lengths. - Category and urgency must match allowed values. -
Building and location must be selected or entered according to campus
configuration. - Reject malformed input and sanitize/render user text
safely. - Do not allow a client to set creator ID, status, timestamps or
administrative fields arbitrarily.

### 7.3 Campus Issue Feed

The feed must: - Display issues the signed-in user is permitted to
see. - Show title, category, building/location, urgency, status,
creation date and upvote count. - Support pagination or incremental
loading. - Support search by title and description. - Filter by
category, building, urgency and status. - Sort by newest, oldest, most
upvoted, highest urgency and recently updated. - Clearly distinguish
status and urgency using text as well as color. - Provide useful empty,
loading and error states.

### 7.4 Duplicate Awareness

-   Before final submission, users should be encouraged to search for
    similar issues in the same building/location.
-   Search results should prioritize matching building, category and
    open status.
-   The user may open and upvote a matching issue.
-   The application should not silently discard a report solely because
    text appears similar.
-   Administrators can mark an issue as a duplicate and link it to a
    canonical issue.
-   Duplicate records should remain traceable; do not erase their
    history.
-   A duplicate issue should show a link to the canonical issue and an
    explanation of its status.

### 7.5 Community Upvoting

-   A user may have at most one active upvote per issue.
-   The database enforces uniqueness on `(issue_id, user_id)`.
-   Users can add or remove their own upvote.
-   Users cannot create, edit or remove another user's upvote.
-   The displayed count is derived from the `issue_upvotes` table or a
    safely maintained aggregate.
-   Feed sorting by impact uses upvote count, with urgency and age as
    additional administrative prioritization signals.
-   Upvotes express community support; they do not automatically change
    issue urgency or status.

### 7.6 Issue Status Workflow

Supported statuses: - `Open` - `In Progress` - `Resolved` - `Closed` -
`Rejected`

Suggested transitions: - `Open` → `In Progress` - `Open` → `Rejected` -
`In Progress` → `Resolved` - `In Progress` → `Rejected` - `Resolved` →
`Closed` - `Resolved` → `In Progress` (reopened when work is
incomplete) - `Closed` → `In Progress` (reopened by an administrator
with a reason)

Rules: - Only authorized administrators may change status in the initial
role model. - Every transition requires an audit entry with actor,
timestamp, previous status, new status and optional explanation. -
Rejection requires a reason visible to the reporter. - Resolution
requires resolution notes. - The application must validate transitions
on the trusted server/database path, not only in the UI. - Status
changes must not delete prior timeline entries.

### 7.7 Issue Updates and Timeline

The issue detail page displays a chronological timeline containing: -
Issue created. - Status changed. - Assignment changed. - Priority
changed. - Official progress update. - Resolution notes. - Rejection or
reopening reason.

Each entry stores its author, issue, type, message and timestamp. If
private internal notes are supported, they must be separated from public
updates and protected by RLS so students cannot read them.

### 7.8 Assignment and Maintenance Handling

-   Administrators can assign an issue to a maintenance team or
    authorized staff member.
-   Assignment changes are recorded in the audit history.
-   An issue can show the responsible team without exposing private
    staff contact details.
-   Assignees can add progress updates only for issues assigned to them
    if the maintenance role is enabled.
-   An issue cannot be marked resolved without a resolution summary.
-   The product should support reassignment and escalation for overdue
    or blocked work.

### 7.9 Notifications

In-app notifications should be created for: - New official update on an
issue created by the user. - Status change on the user's issue. -
Assignment or reassignment where the user is an assignee. - Request for
additional information. - Issue marked resolved or rejected.

Notification requirements: - Read/unread state. - Link to the relevant
issue. - Timestamp. - User-specific visibility enforced by RLS. - Avoid
sending duplicate notifications for a single event.

Email notifications may be added using a trusted email provider and
server-side function. Never expose provider secrets in browser code.
Notification preferences can be added as a user setting.

### 7.10 Analytics and Reporting

Administrator dashboard KPI cards: - Total issues. - Open issues. -
In-progress issues. - Resolved issues. - Rejected issues. - Average and
median resolution time where enough completed records exist.

Charts and breakdowns: - Issues by category. - Issues by building. -
Issues by urgency. - Status distribution. - Issue submission trend over
time. - Resolution time trend. - Most upvoted issues.

Analytics rules: - Define resolution time consistently (created
timestamp to first resolved timestamp, or final resolved timestamp;
select and document one definition). - Exclude unresolved issues from
completed-resolution averages. - Handle empty datasets and missing
timestamps safely. - Use database views or controlled aggregate
queries. - Do not expose personal reporter details in aggregate
analytics. - Apply date range filters where useful.

### 7.11 Administration and Configuration

Administrators should be able to manage, subject to project scope: -
Issue categories. - Campus buildings and rooms. - Maintenance teams and
assignees. - Urgency labels and service targets. - User role requests or
account access status. - Duplicate issue links. - Issue assignment and
escalation.

All configuration changes must be permission-protected and auditable.
For a first deployment, some configuration may be maintained through
controlled Supabase dashboard/SQL operations rather than a full settings
interface.

### 7.12 Feedback

After an issue is resolved or closed, the reporter may optionally: -
Rate the handling experience. - Select whether the issue is actually
fixed. - Leave a short comment.

Feedback must not be used to alter the historical status record. If the
reporter indicates the issue is not fixed, the system can notify
administrators or create a reopen request.

## 8. Information Architecture and Pages

### Public / Authentication

-   `/` --- product landing page and sign-in entry.
-   `/login` --- sign-in.
-   `/signup` --- account registration.
-   `/forgot-password` --- password recovery.

### Student / Faculty

-   `/dashboard` --- overview, recent issues and useful counts.
-   `/issues` --- campus issue feed with search, filters and sorting.
-   `/issues/new` --- report an issue.
-   `/issues/[id]` --- issue detail, timeline and upvote.
-   `/my-issues` --- user's own reports.
-   `/notifications` --- notification center.
-   `/profile` --- profile information and preferences.

### Administration

-   `/admin` --- administrator overview and KPIs.
-   `/admin/issues` --- triage and issue management.
-   `/admin/issues/[id]` --- detailed administration, assignment, status
    and updates.
-   `/admin/analytics` --- charts and performance reporting.
-   `/admin/users` --- user and role administration, if enabled.
-   `/admin/settings` --- categories, buildings, teams and service
    targets, if enabled.

Navigation and page access must be role-aware, while data permissions
remain enforced by Supabase.

## 9. Data Model

Use PostgreSQL with normalized relational tables and foreign keys. The
following is the proposed logical schema; exact SQL types, indexes,
constraints and policies belong in `DATABASE_SCHEMA.md` and migrations.

### 9.1 Required Core Tables

#### `profiles`

-   `id` --- primary key, references `auth.users.id`.
-   `full_name`
-   `email` (or retrieve from trusted auth profile where appropriate)
-   `role` --- `student`, `faculty`, `admin`, optionally `maintenance`.
-   `department` --- nullable.
-   `created_at`
-   `updated_at`

#### `issues`

-   `id` --- primary key.
-   `created_by` --- references `profiles.id`.
-   `title`
-   `description`
-   `category`
-   `building`
-   `room_location`
-   `urgency`
-   `status`
-   `assigned_team_id` --- nullable foreign key if teams are
    implemented.
-   `assigned_to` --- nullable profile foreign key if individual
    assignment is implemented.
-   `duplicate_of` --- nullable self-reference to canonical issue.
-   `created_at`
-   `updated_at`
-   `resolved_at` --- nullable.
-   `closed_at` --- nullable.

#### `issue_upvotes`

-   `id` --- primary key, or composite key.
-   `issue_id` --- references `issues.id`.
-   `user_id` --- references `profiles.id`.
-   `created_at`
-   Unique constraint on `(issue_id, user_id)`.

#### `issue_updates`

-   `id` --- primary key.
-   `issue_id` --- references `issues.id`.
-   `author_id` --- references `profiles.id`.
-   `update_type` --- e.g. `comment`, `status_change`, `assignment`,
    `resolution`, `rejection`, `priority_change`.
-   `message`
-   `old_value` / `new_value` where applicable.
-   `is_internal` --- boolean, if internal notes are enabled.
-   `created_at`

### 9.2 Supporting Tables (Recommended for Complete Product)

-   `buildings` --- campus building records.
-   `maintenance_teams` --- team directory.
-   `team_members` --- many-to-many team membership.
-   `issue_attachments` --- metadata and storage path for issue
    images/files.
-   `notifications` --- per-user notifications and read state.
-   `issue_feedback` --- optional reporter feedback.
-   `audit_logs` --- security-sensitive administrative events, if not
    fully represented by immutable issue updates.
-   `categories` --- configurable category directory, if categories need
    admin management.

Use database constraints and indexes for foreign keys, status, category,
building, urgency, created date, assigned team and common feed filters.
Use full-text search or appropriate indexes if needed for issue search.

## 10. Security, Privacy and Row Level Security

Security is a release requirement, not a later enhancement.

### 10.1 Authentication and Authorization

-   Use Supabase Auth for identity and sessions.
-   Use server-side session validation in Next.js protected routes and
    server actions/route handlers.
-   Never trust a role, user ID or ownership value supplied by the
    browser.
-   Never expose the Supabase service-role key to client-side code.
-   Keep secrets in Vercel environment variables and local `.env.local`;
    commit only `.env.example` with placeholder names.
-   Enforce authorization through PostgreSQL RLS and trusted server-side
    logic.

### 10.2 RLS Policy Requirements

Enable RLS on every table containing user or campus operational data.

For `profiles`: - Authenticated users can read the profile information
required by the product, with privacy-limited fields. - Users can update
only permitted fields on their own profile. - Users cannot change their
own role. - Only trusted administrators/service processes can change
roles.

For `issues`: - Authenticated campus users can read campus issues
according to the campus visibility policy. - A user can insert an issue
only with `created_by = auth.uid()`. - A user can update or delete only
their own issue while its status is `Open`. - Students cannot set
administrative fields such as status, assignment, resolution timestamps
or duplicate links. - Only administrators can perform privileged issue
updates. - If faculty visibility differs, implement that policy
explicitly rather than assuming it.

For `issue_upvotes`: - Users can read counts and, where appropriate,
upvote identities. - Users can insert and delete only their own
upvote. - Unique `(issue_id, user_id)` prevents multiple votes. - Users
cannot modify another user's vote.

For `issue_updates`: - Campus users can read public updates for visible
issues. - Only administrators can insert official
status/assignment/resolution updates in the base role model. - If
maintenance assignees can add progress updates, allow only updates for
issues assigned to them and restrict update types. - Internal notes must
be invisible to students/faculty. - Updates should not be editable or
deletable by ordinary users; corrections should be appended as new
entries.

For supporting tables: - Apply table-specific RLS to notifications,
feedback, attachments, team membership and configuration. - Users can
access only their own notifications and feedback. - Storage buckets must
have policies restricting upload/read access to authorized users and
valid issue records.

### 10.3 Database Functions and Triggers

-   Trigger to create a profile after a new `auth.users` record is
    created.
-   Validate status transitions and append audit/timeline entries
    through trusted database functions or server-side operations.
-   Prevent unauthorized changes to role and protected issue fields.
-   Use safe `SECURITY DEFINER` functions only when required; set a
    fixed `search_path`, minimize privileges and review ownership
    carefully.
-   Avoid relying on frontend-only logic for uniqueness, ownership or
    workflow integrity.

### 10.4 Privacy and Data Handling

-   Collect only information required to operate the service.
-   Do not display private email addresses or student identifiers in the
    public issue feed.
-   Validate and restrict attachment types and sizes.
-   Provide a process for correcting profile information and handling
    account removal requests according to university policy.
-   Define data retention and backup expectations with the university.

## 11. Non-Functional Requirements

### Performance

-   Common dashboard and feed views should load promptly on typical
    campus internet.
-   Use pagination, indexed filters and selective column queries.
-   Avoid fetching all issues or all timeline records at once.
-   Optimize images and use caching only where it does not expose
    private or stale data.

### Reliability

-   Show clear errors when a request fails.
-   Avoid duplicate submissions on repeated clicks.
-   Use database transactions for multi-step changes.
-   Preserve issue history and audit data.
-   Configure backups according to the Supabase plan and institutional
    requirements.

### Accessibility

-   Support keyboard navigation and visible focus.
-   Use semantic HTML and accessible form labels.
-   Provide text labels in addition to color for status and urgency.
-   Maintain readable contrast and responsive layouts.
-   Ensure dialogs, menus and notifications are usable with assistive
    technologies.

### Compatibility

-   Support current versions of major desktop and mobile browsers.
-   Provide a responsive experience on phones, tablets and desktops.

### Maintainability

-   Use TypeScript types for database entities and UI data.
-   Keep reusable components and shared validation schemas.
-   Store schema changes as version-controlled SQL migrations.
-   Document environment variables, setup, deployment and role
    provisioning.
-   Keep UI, database access and business rules separated.

## 12. Technical Architecture

### 12.1 Technology Stack

  Layer                      Technology
  -------------------------- ----------------------------------------------
  Full-stack web framework   Next.js (React, App Router)
  Language                   TypeScript
  UI                         React, TSX/JSX
  Styling                    Tailwind CSS and CSS
  Authentication             Supabase Auth
  Database                   Supabase PostgreSQL
  Authorization              PostgreSQL Row Level Security
  Database automation        PostgreSQL functions and triggers
  File storage               Supabase Storage, if attachments are enabled
  Development assistant      Antigravity
  Deployment                 Vercel
  Source control             Git and GitHub
  Documentation              Markdown
  Local commands             Shell / CLI

### 12.2 Application Architecture

-   Next.js provides the application UI and server-side capabilities.
-   Supabase provides authentication, PostgreSQL and optional file
    storage.
-   The browser uses the Supabase client only with the user's
    authenticated session and RLS-protected access.
-   Server Components, Server Actions or Route Handlers are used where
    server-side validation, privileged orchestration or secure
    integrations are required.
-   Service-role credentials are server-only and must never be bundled
    into client code.
-   PostgreSQL remains the source of truth for roles, ownership, status
    and audit records.
-   Vercel hosts the Next.js application over HTTPS.

A separate Express server is not required for the proposed stack. Add a
separate Node.js service only if a concrete requirement cannot be
handled safely and cleanly through Next.js and Supabase.

### 12.3 Environments

-   Local development.
-   Preview deployment for pull requests.
-   Production deployment.

Use separate environment configuration for each environment. Avoid using
production credentials in local development or previews.

## 13. UI and UX Guidelines

-   Clean, modern campus-oriented interface.
-   Consistent navigation for student and administrator experiences.
-   Clear distinction between reporting, tracking and administration.
-   Prominent "Report an Issue" action.
-   Issue cards should show category, location, urgency, status and
    upvote count.
-   Use readable status labels and consistent icons.
-   Forms should explain required fields and show validation close to
    the relevant input.
-   Provide confirmation before destructive actions.
-   Show success, loading, empty and error states.
-   Admin tables should support filtering and efficient triage.
-   Mobile layouts must preserve the core reporting and tracking
    experience.

## 14. Acceptance Criteria

The product is ready for release candidate review when all of the
following are demonstrated:

### Authentication

-   A user can register, sign in, sign out and reset their password.
-   A profile is created automatically after registration.
-   New users receive the default student role.
-   A student cannot promote themselves to admin.

### Reporting and Feed

-   A student can submit an issue with all required fields.
-   New issues appear in the campus feed.
-   Users can search and filter issues.
-   A student can edit/delete only their own issue while it remains
    Open.
-   A student cannot edit another user's issue.

### Upvoting

-   A user can upvote and remove their own upvote.
-   A user cannot create multiple upvotes for the same issue.
-   The displayed count reflects the database records.

### Administration

-   An administrator can view and triage issues.
-   An administrator can assign an issue and add an official update.
-   Status transitions are validated.
-   Resolution and rejection require appropriate notes.
-   Each administrative action is timestamped and auditable.
-   A non-admin cannot change status or insert privileged updates, even
    by directly calling the database.

### Analytics

-   Dashboard counts match database records.
-   Category and status breakdowns are correct.
-   Resolution time excludes unresolved issues and follows the
    documented definition.

### Security and Deployment

-   RLS is enabled and tested on all relevant tables.
-   No service-role key or other secret appears in client bundles or Git
    history.
-   Application is deployed to Vercel using HTTPS.
-   `npm run build` completes successfully.
-   Core workflows are tested against the deployed Supabase project.
-   No hardcoded demo issues are used as production data.

## 15. Testing Strategy

### Unit Tests

-   Form validation.
-   Status transition rules.
-   Role and permission helper logic.
-   Formatting and analytics calculations.

### Integration Tests

-   Profile creation trigger.
-   Issue creation and ownership.
-   Upvote uniqueness.
-   Status update and audit record creation.
-   Notification creation.
-   RLS behavior for student, faculty, maintenance and admin roles.

### End-to-End Tests

-   Register → sign in → report issue → find issue → upvote.
-   Admin sign in → assign issue → update status → add resolution notes.
-   Reporter views timeline and notification.
-   Unauthorized user attempts a protected action and is denied.

### Manual QA

-   Responsive layouts.
-   Empty and error states.
-   Search/filter combinations.
-   Keyboard and accessibility checks.
-   Deployment environment configuration.

Security tests must use separate test accounts for each role and verify
database access directly, not merely whether buttons are hidden.

## 16. Deployment and Operations

1.  Create the Supabase project and configure authentication settings.
2.  Apply version-controlled SQL migrations.
3.  Enable and verify RLS policies.
4.  Configure storage buckets and policies if attachments are enabled.
5.  Add required environment variables to Vercel.
6.  Connect the GitHub repository to Vercel.
7.  Deploy a preview and run smoke tests.
8.  Promote the verified build to production.
9.  Configure allowed authentication redirect URLs and production site
    URL.
10. Document admin account provisioning and recovery procedures.

Required environment variables should be listed in `.env.example`, with
values supplied only through secure local/Vercel configuration. The
exact variable names must match the Supabase Next.js client setup used
by the team.

## 17. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Incorrect RLS policies expose or    Test each policy with accounts for
  block data                          every role; review SQL migrations
                                      before release.

  Users change their own role         Disallow role updates through user
                                      profile policies; use trusted admin
                                      provisioning.

  Duplicate reports clutter the feed  Search-before-submit, upvoting and
                                      admin duplicate linking.

  Status changes lack traceability    Append-only issue updates and
                                      database-enforced workflow rules.

  Analytics are misleading            Define metrics precisely and test
                                      calculations against known records.

  Supabase credentials leak           Keep service-role key server-only;
                                      use environment variables and
                                      secret scanning.

  Scope exceeds hackathon time        Deliver core workflow first; phase
                                      optional modules without weakening
                                      security.

  Concurrent edits overwrite data     Use database constraints,
                                      transactions and conflict-aware
                                      updates.
  -----------------------------------------------------------------------

## 18. Delivery Phases

### Phase 1 --- Foundation

-   Next.js project setup and shared layout.
-   Supabase project and environment configuration.
-   Auth, profile trigger and role model.
-   Core tables, indexes and RLS policies.

### Phase 2 --- Reporting Experience

-   Student dashboard.
-   Issue creation.
-   Campus feed, search and filters.
-   Issue detail and personal issue history.
-   Upvoting and duplicate-awareness flow.

### Phase 3 --- Administration

-   Admin dashboard.
-   Issue triage and assignment.
-   Status workflow and official updates.
-   Timeline and audit history.

### Phase 4 --- Complete Product Capabilities

-   Notifications.
-   Analytics.
-   Optional attachments.
-   Maintenance assignee experience.
-   Feedback and configuration management.

### Phase 5 --- Quality and Release

-   Automated tests and RLS security tests.
-   Accessibility and responsive QA.
-   Production deployment to Vercel.
-   Build verification and documentation.

## 19. Open Decisions for the University / Product Owner

The following decisions are not specified by the original challenge and
must be confirmed rather than assumed:

1.  Are faculty/staff accounts enabled at launch, and do they have the
    same reporting permissions as students?
2.  Can all authenticated campus users view all issue descriptions and
    locations, or are some buildings/issues restricted?
3.  Will maintenance personnel sign in with a separate role, or will
    administrators manage assignments on their behalf?
4.  Are issue photos or file attachments required at launch?
5.  What is the official list of campus buildings, rooms and maintenance
    teams?
6.  What service targets define overdue or escalated issues?
7.  Should reporters be able to confirm resolution, request reopening or
    submit feedback?
8.  Should email notifications be enabled, or are in-app notifications
    sufficient for the first release?
9.  What is the university's retention policy for user accounts, issue
    records and attachments?

## 20. Assumptions and Product Rules

-   The initial product is for authenticated campus users, not the
    general public.
-   Student is the default role after signup.
-   The challenge's five issue categories and four urgency levels are
    the initial defaults.
-   The challenge's four core relational tables remain mandatory.
-   Additional tables are introduced only to support complete-product
    capabilities.
-   Students can edit/delete their own issues only while they are Open.
-   Only administrators can perform privileged status changes in the
    base challenge workflow.
-   All status changes and official updates are auditable.
-   Upvotes indicate community support and do not automatically alter
    urgency.
-   Supabase PostgreSQL is the source of truth.
-   The UI must not contain hardcoded production issue data.
-   Any capability not explicitly defined in the challenge is a proposed
    product enhancement and should be confirmed with the product owner.

------------------------------------------------------------------------

**Document owner:** CampusFix project team\
**Reviewers:** Product owner, frontend developer, backend/database
developer, QA/presentation team\
**Companion documents recommended:** `DATABASE_SCHEMA.md`, `API.md`
(Supabase data-operation contract), `TECH_STACK.md`, `USER_FLOWS.md`,
and `TEST_PLAN.md`.
