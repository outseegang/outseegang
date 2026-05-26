
-- Fix Users cancel own orders: add WITH CHECK so they can only set status to 'cancelled'
DROP POLICY IF EXISTS "Users cancel own orders" ON public.orders;
CREATE POLICY "Users cancel own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- Restrict listing/select on product-images bucket via storage.objects
-- Public bucket URLs still work for direct file access; this just prevents enumeration through the API.
DROP POLICY IF EXISTS "Public can list product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list product-images" ON storage.objects;
CREATE POLICY "Admins can list product-images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
