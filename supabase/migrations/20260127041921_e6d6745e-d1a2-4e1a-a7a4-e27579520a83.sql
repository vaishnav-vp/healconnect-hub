-- Add license_number column to profiles for doctors
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS license_number text UNIQUE;

-- Create index for license number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_license_number ON public.profiles(license_number) WHERE license_number IS NOT NULL;

-- Create function to get user email by license number (for doctor login)
CREATE OR REPLACE FUNCTION public.get_email_by_license(p_license_number text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.profiles
  WHERE license_number = p_license_number
  LIMIT 1
$$;

-- Create function to check if license number exists
CREATE OR REPLACE FUNCTION public.license_number_exists(p_license_number text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE license_number = p_license_number
  )
$$;