-- ==============================================================================
-- CampusFix — Initial Database Schema & Security Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin', 'maintenance')),
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on email & role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 2. Maintenance Teams & Buildings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.maintenance_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. Issues Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('IT & Wi-Fi', 'Electrical', 'Plumbing', 'Lab Equipment', 'Furniture')),
  building TEXT NOT NULL,
  room_location TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed', 'Rejected')),
  assigned_team_id UUID REFERENCES public.maintenance_teams(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  duplicate_of UUID REFERENCES public.issues(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_urgency ON public.issues(urgency);
CREATE INDEX IF NOT EXISTS idx_issues_building ON public.issues(building);
CREATE INDEX IF NOT EXISTS idx_issues_created_by ON public.issues(created_by);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Issue Upvotes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issue_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_issue_user_upvote UNIQUE (issue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_upvotes_issue_id ON public.issue_upvotes(issue_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON public.issue_upvotes(user_id);

-- ------------------------------------------------------------------------------
-- 5. Issue Updates & Audit History
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issue_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN ('comment', 'status_change', 'assignment', 'resolution', 'rejection', 'priority_change', 'reopening', 'created')),
  message TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_updates_issue_id ON public.issue_updates(issue_id);

-- ------------------------------------------------------------------------------
-- 6. Notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 7. Resolution Feedback
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issue_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_resolved BOOLEAN DEFAULT true,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_issue_feedback UNIQUE (issue_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 8. Contact Messages
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 9. Trigger: Automatic Profile Creation On User Signup
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student', -- ALWAYS defaults to student; admin role cannot be self-provisioned
    NEW.raw_user_meta_data->>'department'
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES Policies
CREATE POLICY "Profiles readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own non-role profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin() OR (
      id = auth.uid() AND
      role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ISSUES Policies
CREATE POLICY "Issues are readable by authenticated users"
  ON public.issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can report issues as themselves"
  ON public.issues FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Reporters can update own issue while Open, admins can update any"
  ON public.issues FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR
    (created_by = auth.uid() AND status = 'Open')
  );

CREATE POLICY "Reporters can delete own issue while Open, admins can delete any"
  ON public.issues FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR
    (created_by = auth.uid() AND status = 'Open')
  );

-- UPVOTES Policies
CREATE POLICY "Upvotes viewable by authenticated"
  ON public.issue_upvotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upvote as themselves"
  ON public.issue_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own upvote"
  ON public.issue_upvotes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ISSUE UPDATES Policies
CREATE POLICY "Public updates readable by authenticated; internal by admins only"
  ON public.issue_updates FOR SELECT
  TO authenticated
  USING (
    is_internal = false OR public.is_admin()
  );

CREATE POLICY "Admins or authors can insert updates"
  ON public.issue_updates FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- NOTIFICATIONS Policies
CREATE POLICY "Users can only read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update read status on own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System and admins can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- BUILDINGS & TEAMS Policies
CREATE POLICY "Buildings viewable by authenticated"
  ON public.buildings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Buildings managed by admins"
  ON public.buildings FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Teams viewable by authenticated"
  ON public.maintenance_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teams managed by admins"
  ON public.maintenance_teams FOR ALL
  TO authenticated
  USING (public.is_admin());

-- FEEDBACK Policies
CREATE POLICY "Feedback viewable by admins and reporter"
  ON public.issue_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Reporters can submit feedback"
  ON public.issue_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- CONTACT MESSAGES Policies
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_admin());
