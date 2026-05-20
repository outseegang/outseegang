
ALTER FUNCTION public.set_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Replace image_url with slug keys
UPDATE public.products SET image_url = 'moletom-azul-marinho' WHERE image_url LIKE '%moletom-azul-marinho%';
UPDATE public.products SET image_url = 'moletom-branco' WHERE image_url LIKE '%moletom-branco%';
UPDATE public.products SET image_url = 'moletom-preto' WHERE image_url LIKE '%moletom-preto%';
UPDATE public.products SET image_url = 'moletom-verde-militar' WHERE image_url LIKE '%moletom-verde-militar%';
UPDATE public.products SET image_url = 'moletom-vermelho' WHERE image_url LIKE '%moletom-vermelho%';
UPDATE public.products SET image_url = 'tenis-azul' WHERE image_url LIKE '%tenis-azul%';
UPDATE public.products SET image_url = 'tenis-branco' WHERE image_url LIKE '%tenis-branco%';
UPDATE public.products SET image_url = 'tenis-laranja' WHERE image_url LIKE '%tenis-laranja%';
UPDATE public.products SET image_url = 'tenis-roxo' WHERE image_url LIKE '%tenis-roxo%';
