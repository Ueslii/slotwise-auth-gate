-- Add status column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';

-- Update existing profiles to set default status based on role
UPDATE public.profiles 
SET status = CASE 
  WHEN role = 'administrador' THEN 'pendente'
  ELSE 'ativo'
END
WHERE status IS NULL OR status = '';

-- Update the handle_new_user function to properly set status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_role TEXT;
  user_status TEXT;
BEGIN
  -- Lógica para converter o 'Tipo de conta' da interface para o 'role' do banco de dados
  IF lower(new.raw_user_meta_data->>'role') = 'prestador' THEN
    user_role := 'administrador';
    user_status := 'pendente';
  ELSE
    user_role := 'cliente';
    user_status := 'ativo';
  END IF;

  INSERT INTO public.profiles (id, full_name, role, status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    user_role,
    user_status
  );
  RETURN new;
END;
$function$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add RLS policies for other tables
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for establishments (owners can manage their own)
CREATE POLICY "Users can view own establishments" ON public.establishments
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own establishments" ON public.establishments
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own establishments" ON public.establishments
FOR UPDATE USING (auth.uid() = owner_id);

-- Basic RLS policies for appointments 
CREATE POLICY "Users can view related appointments" ON public.appointments
FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() IN (
    SELECT owner_id FROM establishments WHERE id = establishment_id
  )
);

CREATE POLICY "Clients can create appointments" ON public.appointments
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Establishment owners can update appointments" ON public.appointments
FOR UPDATE USING (
  auth.uid() IN (
    SELECT owner_id FROM establishments WHERE id = establishment_id
  )
);