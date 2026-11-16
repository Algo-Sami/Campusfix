# CampusFix — Smart Campus Issue & Maintenance Portal

CampusFix is a centralized campus issue-reporting and maintenance-management web application. It connects students, faculty, and administrators to report problems, eliminate duplicates, prioritize repairs, publish official progress updates, and track transparent resolutions.

---

## Key Features

### 1. Modern Glassmorphism Visual Identity
- Clean, modern SaaS aesthetic inspired by soft glassmorphism cards and vibrant campus colors.
- Responsive design tailored for mobile, tablet, and desktop viewports.
- Accessible contrast, clear typography, and Lucide icons.

### 2. Public Experience
- **Home (`/`)**: Hero section, problem statements, three-step workflow, features grid, benefits breakdown, and call to action.
- **About (`/about`)**: Platform mission, campus community goals, and workflow breakdown.
- **Features (`/features`)**: Complete overview of reporting, duplicate awareness, triage, notifications, and analytics.
- **FAQs (`/faqs`)**: Interactive accordion answering common campus maintenance questions.
- **Contact Us (`/contact`)**: Inquiries submission form with real-time field validation.

### 3. Authentication & Profile Security
- Powered by Supabase Authentication.
- Glassmorphism authentication cards for **Sign In (`/login`)**, **Sign Up (`/signup`)**, and **Password Recovery (`/forgot-password`)**.
- Automatic profile creation trigger on signup with guaranteed default `student` role.
- Server-side route protection preventing unauthorized access to protected student and administrative dashboards.

### 4. Student & Faculty Dashboard
- **Overview (`/dashboard`)**: KPI metrics (Total Submitted, Open, In Progress, Resolved) and quick links.
- **Campus Issue Feed (`/issues`)**: Filter by category, building, urgency, and status; search by keywords; community upvoting; pagination.
- **Guided Issue Reporting (`/issues/new`)**: Step 1 searches for existing issues to prevent duplicates; Step 2 provides validated submission.
- **Issue Details (`/issues/[id]`)**: Full chronological action timeline, public updates, upvote counter, and post-resolution feedback form.
- **My Reports (`/my-issues`)**: Personal submissions management with edit and delete capabilities while issues remain `Open`.
- **Notification Center (`/notifications`)**: In-app alerts for status updates, team assignments, and resolution notes.
- **Profile (`/profile`)**: Manage personal details and display names.

### 5. Campus Administration Portal
- **Admin Overview (`/admin`)**: Operational control center with live KPIs, Priority Triage Queue (Critical & High urgency), and category breakdowns.
- **Issue Management (`/admin/issues`)**: Full triage table with filters, search, sorting, and direct link to triage controls.
- **Comprehensive Triage Control (`/admin/issues/[id]`)**:
  - Adjust urgency levels and link duplicate canonical reports.
  - Assign maintenance teams (IT, Electrical, Plumbing, Labs, Carpentry).
  - Post official public progress updates (notifies reporter).
  - Save confidential internal notes (hidden from students via PostgreSQL RLS).
  - Execute validated status transitions (`Open` &rarr; `In Progress` &rarr; `Resolved` / `Rejected` / `Closed`) with mandatory reasons.
- **Operational Analytics (`/admin/analytics`)**: Real database analytics tracking resolution rate, average and median resolution time in hours, category charts, building distributions, and most upvoted issues.
- **Users & Roles (`/admin/users`)**: Search campus accounts and manage role assignments.
- **Campus Settings (`/admin/settings`)**: Maintain building catalogs, maintenance teams, and SLA targets.

---

## Technology Stack

- **Live Production URL**: [https://campusfix-gules.vercel.app](https://campusfix-gules.vercel.app)
- **Framework**: Next.js 16 (App Router, Server Actions, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom glassmorphism styles
- **Icons**: Lucide React
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with server-side cookie verification (`@supabase/ssr`)
- **Deployment Target**: Vercel

---

## Local Development Setup

### 1. Prerequisites
- Node.js 18+ (tested on v24)
- npm or pnpm

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd Campusfix
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup & Migrations
In your Supabase project SQL Editor, run:
1. `supabase/migrations/001_initial_schema.sql` (Tables, triggers, RLS policies)
2. `supabase/seed.sql` (Initial buildings and maintenance teams)

To grant your user administrator access, execute:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@university.edu';
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Build
To verify type safety and build output:
```bash
npm run build
```
