-- Integro OS Expansion Schema

-- 1. Add RBAC roles to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'User';
-- Restrict roles to known values
ALTER TABLE public.profiles ADD CONSTRAINT check_profile_role CHECK (role IN ('Admin', 'Marketing', 'Design', 'Sales', 'User'));

-- 2. Create websites table for Headless CMS
CREATE TABLE IF NOT EXISTS public.websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for websites
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view websites"
  ON public.websites FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can insert websites"
  ON public.websites FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can update websites"
  ON public.websites FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can delete websites"
  ON public.websites FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Create trigger for updated_at on websites
CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3. Create content_blocks table for Headless CMS
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
  block_key text NOT NULL, -- e.g., 'hero_title', 'about_us_text'
  content_type text DEFAULT 'text', -- 'text', 'html', 'json', 'image'
  body text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(website_id, block_key)
);

-- Enable RLS for content_blocks
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Anyone can read content blocks (since they feed public websites)
CREATE POLICY "Public can view content blocks"
  ON public.content_blocks FOR SELECT
  USING (true);

CREATE POLICY "Authorized roles can modify content blocks"
  ON public.content_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'Marketing', 'Design')
    )
  );

-- Create trigger for updated_at on content_blocks
CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 4. Create agent_logs for Agent Memory (The Nervous System)
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  action text NOT NULL,
  status text DEFAULT 'completed',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for agent_logs
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view agent logs"
  ON public.agent_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Allow authenticated services (e.g. edge functions/python backend) to insert logs.
-- Assuming they run with service role, this policy is optional, but for completeness:
CREATE POLICY "Authenticated users can insert agent logs"
  ON public.agent_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

