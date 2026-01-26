-- Fix user_roles INSERT policy - users can insert their own role during signup
CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add patient_id to profiles for patient users
ALTER TABLE public.profiles ADD COLUMN patient_id TEXT UNIQUE;

-- Create trigger to auto-generate patient_id for new profiles
CREATE OR REPLACE FUNCTION public.set_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.patient_id IS NULL THEN
    NEW.patient_id := 'PAT-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_patient_id_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_patient_id();

-- Update existing profiles to have patient_id
UPDATE public.profiles SET patient_id = 'PAT-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)) WHERE patient_id IS NULL;

-- Create patients table for doctor's patient records
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL UNIQUE DEFAULT ('PAT-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  notes TEXT,
  medical_report_analyzed BOOLEAN DEFAULT false,
  diabetes_prediction_performed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own patients"
ON public.patients FOR SELECT
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert patients"
ON public.patients FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own patients"
ON public.patients FOR UPDATE
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their own patients"
ON public.patients FOR DELETE
USING (auth.uid() = doctor_id);

-- Create patient_activities table for service logging
CREATE TABLE public.patient_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_used TEXT NOT NULL CHECK (service_used IN ('medical_report_analyzer', 'diabetes_prediction')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own activities"
ON public.patient_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own activities"
ON public.patient_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);