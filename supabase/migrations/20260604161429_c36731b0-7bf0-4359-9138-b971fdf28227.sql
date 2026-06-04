ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false;