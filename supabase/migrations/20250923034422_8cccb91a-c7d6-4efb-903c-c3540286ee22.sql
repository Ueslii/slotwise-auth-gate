-- RLS policies for appointments table to support client booking journey

-- Allow clients to view their own appointments
CREATE POLICY "Clients can view their own appointments v2" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = client_id);

-- Allow establishment owners to view appointments for their establishment
CREATE POLICY "Establishment owners can view appointments v2" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() IN (
  SELECT owner_id FROM public.establishments 
  WHERE id = appointments.establishment_id
));

-- Allow authenticated users to create appointments
CREATE POLICY "Authenticated users can create appointments v2" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Allow public access to view establishments (for public booking pages)
CREATE POLICY "Public can view establishments" 
ON public.establishments 
FOR SELECT 
USING (true);

-- Allow public access to view services (for public booking pages)
CREATE POLICY "Public can view services" 
ON public.services 
FOR SELECT 
USING (true);

-- Allow public access to view availabilities (for public booking pages)
CREATE POLICY "Public can view availabilities" 
ON public.availabilities 
FOR SELECT 
USING (true);