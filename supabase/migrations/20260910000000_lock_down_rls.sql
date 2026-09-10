-- Lock down RLS: public reads, authenticated writes.
--
-- The original policies granted the `public` role (i.e. the anon key that ships
-- inside the JS bundle) full SELECT/INSERT/UPDATE/DELETE on products,
-- category_covers and the product-images bucket. Anyone who opened devtools
-- could read unpublished products or delete the whole catalog. The admin login
-- was client-side only and never protected any of it.
--
-- After this migration:
--   anon           -> can only read published products and public images
--   authenticated  -> full write access (the admin panel, via Supabase Auth)

-- ============ products ============
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
DROP POLICY IF EXISTS "Allow all selects" ON public.products;
DROP POLICY IF EXISTS "Allow all inserts" ON public.products;
DROP POLICY IF EXISTS "Allow all updates" ON public.products;
DROP POLICY IF EXISTS "Allow all deletes" ON public.products;

-- Visitors only ever see published rows.
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (visible = true);

-- The admin panel needs to see hidden products too.
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);

-- ============ category_covers ============
DROP POLICY IF EXISTS "Anyone can view category covers" ON public.category_covers;
DROP POLICY IF EXISTS "Allow all inserts on category_covers" ON public.category_covers;
DROP POLICY IF EXISTS "Allow all updates on category_covers" ON public.category_covers;
DROP POLICY IF EXISTS "Allow all deletes on category_covers" ON public.category_covers;

CREATE POLICY "Public can view category covers"
  ON public.category_covers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert category covers"
  ON public.category_covers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update category covers"
  ON public.category_covers FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete category covers"
  ON public.category_covers FOR DELETE
  TO authenticated
  USING (true);

-- ============ storage: product-images ============
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
