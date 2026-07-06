REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Storage policies on card-images bucket, path prefix = user id
CREATE POLICY "own card images select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own card images insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own card images update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own card images delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);