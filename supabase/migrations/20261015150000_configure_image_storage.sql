INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('posters', 'posters', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('site-assets', 'site-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public_read_site_images" ON storage.objects;
CREATE POLICY "public_read_site_images" ON storage.objects FOR SELECT
  TO public USING (bucket_id IN ('posters', 'site-assets'));

DROP POLICY IF EXISTS "auth_upload_site_images" ON storage.objects;
CREATE POLICY "auth_upload_site_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id IN ('posters', 'site-assets'));

DROP POLICY IF EXISTS "auth_update_site_images" ON storage.objects;
CREATE POLICY "auth_update_site_images" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('posters', 'site-assets'))
  WITH CHECK (bucket_id IN ('posters', 'site-assets'));

DROP POLICY IF EXISTS "auth_delete_site_images" ON storage.objects;
CREATE POLICY "auth_delete_site_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id IN ('posters', 'site-assets'));
