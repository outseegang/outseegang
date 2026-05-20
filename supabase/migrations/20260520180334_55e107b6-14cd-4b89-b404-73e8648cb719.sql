
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(),'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid()=id);
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid()=id);
CREATE POLICY "Profiles insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid()=id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  color text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sizes text[] NOT NULL DEFAULT '{}',
  stock int NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed products
INSERT INTO public.products (name, category, color, price, sizes, stock, image_url, description) VALUES
('Moletom Outsee Going','Moletom','Azul Marinho',249.90,ARRAY['P','M','G','GG'],20,'/src/assets/moletom-azul-marinho.png','Moletom com zíper Outsee Going em azul marinho.'),
('Moletom Outsee Going','Moletom','Branco',249.90,ARRAY['P','M','G','GG'],20,'/src/assets/moletom-branco.png','Moletom com zíper Outsee Going em branco.'),
('Moletom Outsee Going','Moletom','Preto',249.90,ARRAY['P','M','G','GG'],20,'/src/assets/moletom-preto.png','Moletom com zíper Outsee Going em preto.'),
('Moletom Outsee Going','Moletom','Verde Militar',249.90,ARRAY['P','M','G','GG'],20,'/src/assets/moletom-verde-militar.png','Moletom com zíper Outsee Going em verde militar.'),
('Moletom Outsee Going','Moletom','Vermelho',249.90,ARRAY['P','M','G','GG'],20,'/src/assets/moletom-vermelho.png','Moletom com zíper Outsee Going em vermelho.'),
('Tênis Outseer','Tênis','Azul Camo',399.90,ARRAY['38','39','40','41','42','43'],15,'/src/assets/tenis-azul.png','Tênis Outseer com estampa camuflada azul.'),
('Tênis Outseer','Tênis','Branco Camo',399.90,ARRAY['38','39','40','41','42','43'],15,'/src/assets/tenis-branco.png','Tênis Outseer com estampa camuflada cinza/branco.'),
('Tênis Outseer','Tênis','Laranja Camo',399.90,ARRAY['38','39','40','41','42','43'],15,'/src/assets/tenis-laranja.png','Tênis Outseer com estampa camuflada laranja.'),
('Tênis Outseer','Tênis','Roxo Camo',399.90,ARRAY['38','39','40','41','42','43'],15,'/src/assets/tenis-roxo.png','Tênis Outseer com estampa camuflada roxa.');
