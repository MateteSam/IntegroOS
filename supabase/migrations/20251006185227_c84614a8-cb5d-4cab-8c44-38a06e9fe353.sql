-- Create user_designs table for tracking generated assets
CREATE TABLE public.user_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  asset_type TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create metrics table for analytics tracking
CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_generations table for AI history
CREATE TABLE public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  generation_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  result JSONB NOT NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_cache table for caching AI responses
CREATE TABLE public.ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.user_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_designs
CREATE POLICY "Users can manage their designs"
  ON public.user_designs FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for metrics
CREATE POLICY "Users can manage their metrics"
  ON public.metrics FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for ai_generations
CREATE POLICY "Users can view their generations"
  ON public.ai_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their generations"
  ON public.ai_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_cache (public read, system write)
CREATE POLICY "Anyone can read cache"
  ON public.ai_cache FOR SELECT
  USING (true);

CREATE POLICY "System can manage cache"
  ON public.ai_cache FOR ALL
  USING (true);

-- Create storage bucket for generated assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-assets', 'generated-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload their assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generated-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'generated-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'generated-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add updated_at trigger to user_designs
CREATE TRIGGER update_user_designs_updated_at
BEFORE UPDATE ON public.user_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();