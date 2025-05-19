
-- Fix RLS policies for domain_activity table to ensure admins can access it

-- First, drop existing policies
DROP POLICY IF EXISTS "Admins can view all domain activities" ON public.domain_activity;
DROP POLICY IF EXISTS "Users can view their own domain activities" ON public.domain_activity;

-- Create a policy for admins to view all domain activities using the is_admin() function
-- This uses the is_admin() function which is already defined in the database
CREATE POLICY "Admins can view all domain activities" 
  ON public.domain_activity 
  FOR SELECT 
  USING (public.is_admin());

-- Create a policy for users to view their own domain activities
CREATE POLICY "Users can view their own domain activities" 
  ON public.domain_activity 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.consent_scripts cs
      JOIN public.websites w ON cs.website_id = w.id
      WHERE cs.id = domain_activity.script_id AND w.user_id = auth.uid()
    )
  );
