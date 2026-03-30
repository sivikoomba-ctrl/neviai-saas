-- ============================================================
-- Supabase RLS Migration for NeviAIB0015 SaaS App
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Helper function: get the current user's org_id from memberships
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.memberships
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Trigger function: auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Profiles: users can read/update their own profile
-- ============================================================

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- Organizations: members can read their org
-- ============================================================

CREATE POLICY "Members can read their organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- Memberships: users can see memberships in their org
-- ============================================================

CREATE POLICY "Users can read memberships in their org"
  ON public.memberships FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can read own memberships"
  ON public.memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage memberships"
  ON public.memberships FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- Data tables: org-scoped access via current_org_id()
-- ============================================================

-- Contacts
CREATE POLICY "Org members can read contacts"
  ON public.contacts FOR SELECT
  USING (org_id = current_org_id());

CREATE POLICY "Org members can insert contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can update contacts"
  ON public.contacts FOR UPDATE
  USING (org_id = current_org_id())
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can delete contacts"
  ON public.contacts FOR DELETE
  USING (org_id = current_org_id());

-- Deals
CREATE POLICY "Org members can read deals"
  ON public.deals FOR SELECT
  USING (org_id = current_org_id());

CREATE POLICY "Org members can insert deals"
  ON public.deals FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can update deals"
  ON public.deals FOR UPDATE
  USING (org_id = current_org_id())
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can delete deals"
  ON public.deals FOR DELETE
  USING (org_id = current_org_id());

-- Interactions
CREATE POLICY "Org members can read interactions"
  ON public.interactions FOR SELECT
  USING (org_id = current_org_id());

CREATE POLICY "Org members can insert interactions"
  ON public.interactions FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can delete interactions"
  ON public.interactions FOR DELETE
  USING (org_id = current_org_id());

-- Emails
CREATE POLICY "Org members can read emails"
  ON public.emails FOR SELECT
  USING (org_id = current_org_id());

CREATE POLICY "Org members can insert emails"
  ON public.emails FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can update emails"
  ON public.emails FOR UPDATE
  USING (org_id = current_org_id())
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can delete emails"
  ON public.emails FOR DELETE
  USING (org_id = current_org_id());

-- Campaigns
CREATE POLICY "Org members can read campaigns"
  ON public.campaigns FOR SELECT
  USING (org_id = current_org_id());

CREATE POLICY "Org members can insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (org_id = current_org_id())
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can delete campaigns"
  ON public.campaigns FOR DELETE
  USING (org_id = current_org_id());

-- Templates
CREATE POLICY "Org members can read templates"
  ON public.templates FOR SELECT
  USING (org_id = current_org_id());

CREATE POLICY "Org members can insert templates"
  ON public.templates FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can update templates"
  ON public.templates FOR UPDATE
  USING (org_id = current_org_id())
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "Org members can delete templates"
  ON public.templates FOR DELETE
  USING (org_id = current_org_id());

-- Usages
CREATE POLICY "Org members can read usage"
  ON public.usages FOR SELECT
  USING (org_id = current_org_id());

CREATE POLICY "System can manage usage"
  ON public.usages FOR ALL
  USING (org_id = current_org_id());

-- ============================================================
-- Revoke direct anon/public access to SECURITY DEFINER functions
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.current_org_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
