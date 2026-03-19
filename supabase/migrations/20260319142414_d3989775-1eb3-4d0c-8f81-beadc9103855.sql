CREATE TABLE public.category_covers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL UNIQUE,
  image_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.category_covers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view category covers" ON public.category_covers
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow all inserts on category_covers" ON public.category_covers
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow all updates on category_covers" ON public.category_covers
  FOR UPDATE TO public USING (true);

CREATE POLICY "Allow all deletes on category_covers" ON public.category_covers
  FOR DELETE TO public USING (true);