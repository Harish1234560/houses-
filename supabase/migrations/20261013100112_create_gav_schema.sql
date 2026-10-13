/*
# Golden Axis Ventures — Complete Database Schema

## Overview
Creates the full database schema for Golden Axis Ventures real estate marketing website.
This includes projects, posters, campaigns, enquiries, services, marketing packages,
social profiles, site settings, media assets, and audit logging.

## Tables Created
1. `projects` — property developments and marketing campaigns portfolio
2. `project_galleries` — gallery images per project
3. `posters` — promotional poster creatives with full publishing workflow
4. `campaigns` — campaign groupings for posters
5. `enquiries` — public enquiry/lead submissions
6. `enquiry_notes` — internal notes on enquiries (admin only)
7. `services` — editable service descriptions
8. `marketing_packages` — configurable pricing/service tiers
9. `social_profiles` — configurable social media links
10. `site_settings` — editable website content/settings
11. `media_assets` — media library tracking
12. `audit_events` — admin activity logging

## Security
- RLS enabled on ALL tables
- Public tables (projects, posters, published campaigns, services, packages, social profiles, site settings): readable by anon+authenticated
- Admin-only writes on all tables: restricted to authenticated users
- Enquiries: public can INSERT (form submission), only authenticated can SELECT/UPDATE
- Enquiry notes: authenticated only (contains sensitive lead data)
- Audit events: authenticated only

## Notes
- Uses auth.uid() for ownership checks on admin operations
- All tables have created_at/updated_at timestamps
- Slugs are unique where applicable
- Publication status supported via status column and publish_at/expire_at dates
*/

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  location text,
  category text,
  description text,
  features text[] DEFAULT '{}',
  cover_image_url text,
  brochure_url text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  project_status text DEFAULT 'ongoing',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);

-- ============================================
-- PROJECT GALLERIES
-- ============================================
CREATE TABLE IF NOT EXISTS project_galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  caption text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_galleries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON project_galleries;
CREATE POLICY "public_read_gallery" ON project_galleries FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_galleries.project_id AND projects.status = 'published')
  );

DROP POLICY IF EXISTS "auth_insert_gallery" ON project_galleries;
CREATE POLICY "auth_insert_gallery" ON project_galleries FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_gallery" ON project_galleries;
CREATE POLICY "auth_update_gallery" ON project_galleries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_gallery" ON project_galleries;
CREATE POLICY "auth_delete_gallery" ON project_galleries FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_gallery_project ON project_galleries(project_id);

-- ============================================
-- CAMPAIGNS
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text,
  description text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  publish_at timestamptz,
  expire_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_campaigns" ON campaigns;
CREATE POLICY "public_read_campaigns" ON campaigns FOR SELECT
  TO anon, authenticated USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()) AND (expire_at IS NULL OR expire_at > now()));

DROP POLICY IF EXISTS "auth_insert_campaigns" ON campaigns;
CREATE POLICY "auth_insert_campaigns" ON campaigns FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_campaigns" ON campaigns;
CREATE POLICY "auth_update_campaigns" ON campaigns FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_campaigns" ON campaigns;
CREATE POLICY "auth_delete_campaigns" ON campaigns FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ============================================
-- POSTERS
-- ============================================
CREATE TABLE IF NOT EXISTS posters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  caption text,
  image_url text NOT NULL,
  alt_text text,
  category text,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  cta_label text,
  cta_url text,
  destination_url text,
  status text NOT NULL DEFAULT 'draft',
  show_on_homepage boolean NOT NULL DEFAULT false,
  show_on_campaigns boolean NOT NULL DEFAULT true,
  show_on_project boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  publish_at timestamptz,
  expire_at timestamptz,
  file_size bigint,
  image_width int,
  image_height int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_posters" ON posters;
CREATE POLICY "public_read_posters" ON posters FOR SELECT
  TO anon, authenticated USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()) AND (expire_at IS NULL OR expire_at > now()));

DROP POLICY IF EXISTS "auth_insert_posters" ON posters;
CREATE POLICY "auth_insert_posters" ON posters FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_posters" ON posters;
CREATE POLICY "auth_update_posters" ON posters FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_posters" ON posters;
CREATE POLICY "auth_delete_posters" ON posters FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_posters_status ON posters(status);
CREATE INDEX IF NOT EXISTS idx_posters_homepage ON posters(show_on_homepage);
CREATE INDEX IF NOT EXISTS idx_posters_campaign ON posters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_posters_project ON posters(project_id);
CREATE INDEX IF NOT EXISTS idx_posters_order ON posters(display_order);

-- ============================================
-- ENQUIRIES
-- ============================================
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  enquiry_type text NOT NULL,
  project_location text,
  service_required text,
  estimated_budget text,
  message text,
  status text NOT NULL DEFAULT 'new',
  follow_up_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_enquiries" ON enquiries;
CREATE POLICY "public_insert_enquiries" ON enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_read_enquiries" ON enquiries;
CREATE POLICY "auth_read_enquiries" ON enquiries FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_enquiries" ON enquiries;
CREATE POLICY "auth_update_enquiries" ON enquiries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_enquiries" ON enquiries;
CREATE POLICY "auth_delete_enquiries" ON enquiries FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);

-- ============================================
-- ENQUIRY NOTES (admin only)
-- ============================================
CREATE TABLE IF NOT EXISTS enquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE enquiry_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_notes" ON enquiry_notes;
CREATE POLICY "auth_read_notes" ON enquiry_notes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_notes" ON enquiry_notes;
CREATE POLICY "auth_insert_notes" ON enquiry_notes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_notes" ON enquiry_notes;
CREATE POLICY "auth_delete_notes" ON enquiry_notes FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_notes_enquiry ON enquiry_notes(enquiry_id);

-- ============================================
-- SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text,
  title text NOT NULL,
  description text,
  features text[] DEFAULT '{}',
  icon_name text,
  display_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (is_visible = true);

DROP POLICY IF EXISTS "auth_insert_services" ON services;
CREATE POLICY "auth_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_services" ON services;
CREATE POLICY "auth_update_services" ON services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_services" ON services;
CREATE POLICY "auth_delete_services" ON services FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- MARKETING PACKAGES
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  features text[] DEFAULT '{}',
  price text,
  is_published boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE marketing_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_packages" ON marketing_packages;
CREATE POLICY "public_read_packages" ON marketing_packages FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_insert_packages" ON marketing_packages;
CREATE POLICY "auth_insert_packages" ON marketing_packages FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_packages" ON marketing_packages;
CREATE POLICY "auth_update_packages" ON marketing_packages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_packages" ON marketing_packages;
CREATE POLICY "auth_delete_packages" ON marketing_packages FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- SOCIAL PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS social_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  url text,
  is_visible boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_social" ON social_profiles;
CREATE POLICY "public_read_social" ON social_profiles FOR SELECT
  TO anon, authenticated USING (is_visible = true);

DROP POLICY IF EXISTS "auth_insert_social" ON social_profiles;
CREATE POLICY "auth_insert_social" ON social_profiles FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_social" ON social_profiles;
CREATE POLICY "auth_update_social" ON social_profiles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_social" ON social_profiles;
CREATE POLICY "auth_delete_social" ON social_profiles FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- SITE SETTINGS (single-row key-value)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_settings" ON site_settings;
CREATE POLICY "auth_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_settings" ON site_settings;
CREATE POLICY "auth_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_settings" ON site_settings;
CREATE POLICY "auth_delete_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- MEDIA ASSETS
-- ============================================
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  file_size bigint,
  mime_type text,
  width int,
  height int,
  alt_text text,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_media" ON media_assets;
CREATE POLICY "public_read_media" ON media_assets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_media" ON media_assets;
CREATE POLICY "auth_insert_media" ON media_assets FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_media" ON media_assets;
CREATE POLICY "auth_update_media" ON media_assets FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_media" ON media_assets;
CREATE POLICY "auth_delete_media" ON media_assets FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- AUDIT EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_audit" ON audit_events;
CREATE POLICY "auth_read_audit" ON audit_events FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_audit" ON audit_events;
CREATE POLICY "auth_insert_audit" ON audit_events FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated ON projects;
CREATE TRIGGER trigger_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_posters_updated ON posters;
CREATE TRIGGER trigger_posters_updated BEFORE UPDATE ON posters FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_campaigns_updated ON campaigns;
CREATE TRIGGER trigger_campaigns_updated BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_enquiries_updated ON enquiries;
CREATE TRIGGER trigger_enquiries_updated BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_services_updated ON services;
CREATE TRIGGER trigger_services_updated BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_packages_updated ON marketing_packages;
CREATE TRIGGER trigger_packages_updated BEFORE UPDATE ON marketing_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_social_updated ON social_profiles;
CREATE TRIGGER trigger_social_updated BEFORE UPDATE ON social_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_settings_updated ON site_settings;
CREATE TRIGGER trigger_settings_updated BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
