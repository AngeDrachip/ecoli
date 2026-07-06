-- profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- cards
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  card_number TEXT,
  expiry_date DATE,
  holder_name TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cards_user ON public.cards(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cards all" ON public.cards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- notification_schedules
CREATE TABLE public.notification_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  hour SMALLINT NOT NULL CHECK (hour >= 0 AND hour <= 23),
  minute SMALLINT NOT NULL CHECK (minute >= 0 AND minute <= 59),
  days SMALLINT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_schedules_user ON public.notification_schedules(user_id);
CREATE INDEX idx_schedules_card ON public.notification_schedules(card_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_schedules TO authenticated;
GRANT ALL ON public.notification_schedules TO service_role;
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own schedules all" ON public.notification_schedules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER cards_updated_at BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- profile auto-create on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();