-- Enhanced brand_assets table with new columns
ALTER TABLE brand_assets 
ADD COLUMN IF NOT EXISTS questionnaire_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS competitive_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS generation_iterations INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS export_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS team_collaborators UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Brand asset files table
CREATE TABLE IF NOT EXISTS brand_asset_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_asset_id UUID REFERENCES brand_assets(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE brand_asset_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_asset_files
CREATE POLICY "Users can view their brand asset files"
ON brand_asset_files FOR SELECT
USING (
  brand_asset_id IN (
    SELECT id FROM brand_assets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their brand asset files"
ON brand_asset_files FOR INSERT
WITH CHECK (
  brand_asset_id IN (
    SELECT id FROM brand_assets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their brand asset files"
ON brand_asset_files FOR DELETE
USING (
  brand_asset_id IN (
    SELECT id FROM brand_assets WHERE user_id = auth.uid()
  )
);

-- AI generation logs table
CREATE TABLE IF NOT EXISTS ai_brand_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_asset_id UUID REFERENCES brand_assets(id) ON DELETE CASCADE,
  prompt_data JSONB NOT NULL,
  model_used TEXT NOT NULL,
  generation_time INTERVAL,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_brand_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_brand_generations
CREATE POLICY "Users can view their AI generation logs"
ON ai_brand_generations FOR SELECT
USING (
  brand_asset_id IN (
    SELECT id FROM brand_assets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their AI generation logs"
ON ai_brand_generations FOR INSERT
WITH CHECK (
  brand_asset_id IN (
    SELECT id FROM brand_assets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their AI generation logs"
ON ai_brand_generations FOR UPDATE
USING (
  brand_asset_id IN (
    SELECT id FROM brand_assets WHERE user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_asset_files_brand_asset_id ON brand_asset_files(brand_asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_brand_generations_brand_asset_id ON ai_brand_generations(brand_asset_id);