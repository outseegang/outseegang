ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color_hex text;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

UPDATE public.products SET color_hex = CASE
  WHEN lower(trim(color)) IN ('preto', 'preta', 'black') THEN '#0a0a0a'
  WHEN lower(trim(color)) IN ('branco', 'branca', 'white') THEN '#f5f5f5'
  WHEN lower(trim(color)) IN ('cinza') THEN '#7a7a7a'
  WHEN lower(trim(color)) IN ('grafite') THEN '#3a3a3a'
  WHEN lower(trim(color)) IN ('chumbo') THEN '#4a4a4a'
  WHEN lower(trim(color)) IN ('vermelho', 'vermelha') THEN '#dc2626'
  WHEN lower(trim(color)) IN ('azul') THEN '#2563eb'
  WHEN lower(trim(color)) IN ('azul marinho', 'marinho') THEN '#0c2340'
  WHEN lower(trim(color)) IN ('verde') THEN '#16a34a'
  WHEN lower(trim(color)) IN ('verde militar', 'militar') THEN '#4a5d23'
  WHEN lower(trim(color)) IN ('oliva') THEN '#6b7a3a'
  WHEN lower(trim(color)) IN ('amarelo', 'amarela') THEN '#facc15'
  WHEN lower(trim(color)) IN ('rosa', 'pink') THEN '#ec4899'
  WHEN lower(trim(color)) IN ('roxo') THEN '#7c3aed'
  WHEN lower(trim(color)) IN ('lilas', 'lilás') THEN '#a78bfa'
  WHEN lower(trim(color)) IN ('laranja') THEN '#f97316'
  WHEN lower(trim(color)) IN ('marrom') THEN '#78350f'
  WHEN lower(trim(color)) IN ('caramelo') THEN '#b45309'
  WHEN lower(trim(color)) IN ('bege') THEN '#d4b896'
  WHEN lower(trim(color)) IN ('areia') THEN '#c9b99a'
  WHEN lower(trim(color)) IN ('nude') THEN '#e8c5a0'
  WHEN lower(trim(color)) IN ('vinho', 'bordo', 'bordô') THEN '#7c1d2d'
  WHEN lower(trim(color)) IN ('dourado') THEN '#c9a84c'
  WHEN lower(trim(color)) IN ('prata') THEN '#c0c0c0'
  ELSE NULL
END
WHERE color_hex IS NULL;