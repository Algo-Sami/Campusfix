# CampusFix — Database Schema Documentation

## Overview
CampusFix uses PostgreSQL hosted on Supabase. Security and role-based permissions are enforced at the database level using Row Level Security (RLS) policies and database triggers.

---

## 1. Tables & Relationships

### `public.profiles`
Represents application user profiles, mirroring `auth.users`.
- `id` (UUID, Primary Key) &rarr; references `auth.users(id)`
- `full_name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `role` (TEXT, NOT NULL, DEFAULT `'student'`) &mdash; Values: `student`, `faculty`, `admin`, `maintenance`
- `department` (TEXT, Nullable)
- `avatar_url` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### `public.issues`
Primary entity storing campus maintenance requests.
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `created_by` (UUID, NOT NULL) &rarr; references `profiles(id)`
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL) &mdash; `IT & Wi-Fi`, `Electrical`, `Plumbing`, `Lab Equipment`, `Furniture`
- `building` (TEXT, NOT NULL)
- `room_location` (TEXT, NOT NULL)
- `urgency` (TEXT, NOT NULL) &mdash; `Low`, `Medium`, `High`, `Critical`
- `status` (TEXT, NOT NULL, DEFAULT `'Open'`) &mdash; `Open`, `In Progress`, `Resolved`, `Closed`, `Rejected`
- `assigned_team_id` (UUID, Nullable) &rarr; references `maintenance_teams(id)`
- `assigned_to` (UUID, Nullable) &rarr; references `profiles(id)`
- `duplicate_of` (UUID, Nullable) &rarr; self-references `issues(id)`
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)
- `resolved_at` (TIMESTAMPTZ, Nullable)
- `closed_at` (TIMESTAMPTZ, Nullable)

### `public.issue_upvotes`
Community support for issues.
- `id` (UUID, Primary Key)
- `issue_id` (UUID, NOT NULL) &rarr; references `issues(id)`
- `user_id` (UUID, NOT NULL) &rarr; references `profiles(id)`
- `created_at` (TIMESTAMPTZ, NOT NULL)
- **Constraint:** `UNIQUE(issue_id, user_id)` (Strictly prevents duplicate upvotes)

### `public.issue_updates`
Append-only chronological audit log and progress tracking.
- `id` (UUID, Primary Key)
- `issue_id` (UUID, NOT NULL) &rarr; references `issues(id)`
- `author_id` (UUID, NOT NULL) &rarr; references `profiles(id)`
- `update_type` (TEXT, NOT NULL) &mdash; `comment`, `status_change`, `assignment`, `resolution`, `rejection`, `priority_change`, `reopening`, `created`
- `message` (TEXT, NOT NULL)
- `old_value` (TEXT, Nullable)
- `new_value` (TEXT, Nullable)
- `is_internal` (BOOLEAN, NOT NULL, DEFAULT `false`) &mdash; Internal admin notes hidden from students
- `created_at` (TIMESTAMPTZ, NOT NULL)

### `public.notifications`
In-app alerts for users.
- `id` (UUID, Primary Key)
- `user_id` (UUID, NOT NULL) &rarr; references `profiles(id)`
- `issue_id` (UUID, Nullable) &rarr; references `issues(id)`
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL, DEFAULT `'general'`)
- `is_read` (BOOLEAN, NOT NULL, DEFAULT `false`)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### `public.buildings`
Campus building catalog.
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL, UNIQUE)
- `code` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ)

### `public.maintenance_teams`
Maintenance response units.
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL, UNIQUE)
- `description` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ)

### `public.issue_feedback`
Post-resolution student verification and satisfaction.
- `id` (UUID, Primary Key)
- `issue_id` (UUID, NOT NULL) &rarr; references `issues(id)`
- `user_id` (UUID, NOT NULL) &rarr; references `profiles(id)`
- `rating` (INTEGER, 1 to 5)
- `is_resolved` (BOOLEAN)
- `comment` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ)

### `public.contact_messages`
Public website contact form inquiries.
- `id` (UUID, Primary Key)
- `full_name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `subject` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ)

---

## 2. Row Level Security (RLS) Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Authenticated | Database Trigger (`handle_new_user`) | Own profile (role immutable) / Admin | Admin |
| `issues` | Authenticated | Authenticated (`created_by = auth.uid()`) | Own issue while `Open` / Admin | Own issue while `Open` / Admin |
| `issue_upvotes` | Authenticated | Own user ID (`user_id = auth.uid()`) | N/A (immutable) | Own user ID (`user_id = auth.uid()`) |
| `issue_updates` | Authenticated (Public) / Admins (Internal) | Admin / Assigned Staff | Disallowed (Append-only) | Disallowed (Append-only) |
| `notifications` | Own notifications | Trigger / Admin | Own read status (`is_read`) | Own notifications |
| `buildings` | Authenticated | Admin | Admin | Admin |
| `maintenance_teams`| Authenticated | Admin | Admin | Admin |
| `issue_feedback` | Reporter / Admin | Reporter (`user_id = auth.uid()`) | Disallowed | Disallowed |
| `contact_messages` | Admin | Anyone (Public Form) | Disallowed | Admin |
