-- Create asset collections table for organizing and sharing assets
CREATE TABLE IF NOT EXISTS public.asset_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_collections
CREATE POLICY "Users can view their own collections"
  ON public.asset_collections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections"
  ON public.asset_collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.asset_collections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.asset_collections
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable by everyone"
  ON public.asset_collections
  FOR SELECT
  USING (is_public = true);

-- Create collection items table
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.asset_collections(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.user_designs(id) ON DELETE CASCADE,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collection_items
CREATE POLICY "Users can view items in their collections"
  ON public.collection_items
  FOR SELECT
  USING (
    collection_id IN (
      SELECT id FROM public.asset_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to their collections"
  ON public.collection_items
  FOR INSERT
  WITH CHECK (
    collection_id IN (
      SELECT id FROM public.asset_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their collections"
  ON public.collection_items
  FOR UPDATE
  USING (
    collection_id IN (
      SELECT id FROM public.asset_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their collections"
  ON public.collection_items
  FOR DELETE
  USING (
    collection_id IN (
      SELECT id FROM public.asset_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public collection items are viewable"
  ON public.collection_items
  FOR SELECT
  USING (
    collection_id IN (
      SELECT id FROM public.asset_collections WHERE is_public = true
    )
  );

-- Create asset comments table
CREATE TABLE IF NOT EXISTS public.asset_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.user_designs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  x_position FLOAT,
  y_position FLOAT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_comments
CREATE POLICY "Users can view comments on their assets"
  ON public.asset_comments
  FOR SELECT
  USING (
    asset_id IN (
      SELECT id FROM public.user_designs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments"
  ON public.asset_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.asset_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.asset_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at on asset_collections
CREATE TRIGGER update_asset_collections_updated_at
  BEFORE UPDATE ON public.asset_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on asset_comments
CREATE TRIGGER update_asset_comments_updated_at
  BEFORE UPDATE ON public.asset_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add brand_dna column to brand_assets for storing extracted style rules
ALTER TABLE public.brand_assets ADD COLUMN IF NOT EXISTS brand_dna JSONB DEFAULT '{}'::jsonb;

-- Add favorites column to user_designs
ALTER TABLE public.user_designs ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Add version tracking to user_designs
ALTER TABLE public.user_designs ADD COLUMN IF NOT EXISTS parent_asset_id UUID REFERENCES public.user_designs(id) ON DELETE SET NULL;
ALTER TABLE public.user_designs ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;