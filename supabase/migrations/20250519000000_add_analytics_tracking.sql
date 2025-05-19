
-- Add visitor_count field to analytics table
ALTER TABLE IF EXISTS public.analytics 
ADD COLUMN IF NOT EXISTS visitor_count INTEGER NOT NULL DEFAULT 0;

-- Create a table for storing detailed domain activity
CREATE TABLE IF NOT EXISTS public.domain_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES public.consent_scripts(id),
  event_type TEXT NOT NULL, -- 'ping', 'view', 'accept', 'reject', 'partial'
  domain TEXT NOT NULL,
  url TEXT,
  visitor_id TEXT,
  session_id TEXT,
  user_agent TEXT,
  region TEXT DEFAULT 'other',
  language TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies to domain_activity
ALTER TABLE public.domain_activity ENABLE ROW LEVEL SECURITY;

-- Create a policy for admins to view all domain activities
CREATE POLICY "Admins can view all domain activities" 
  ON public.domain_activity 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin'
    )
  );

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

-- Create an index for faster lookups by script_id
CREATE INDEX IF NOT EXISTS domain_activity_script_id_idx ON public.domain_activity (script_id);
