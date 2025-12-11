-- Wardrobe Items Table Schema
-- This table stores user's clothing items with AI-processed data

CREATE TABLE IF NOT EXISTS wardrobe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    styles TEXT[] DEFAULT '{}',
    original_image_url TEXT NOT NULL,
    processed_image_url TEXT,
    ai_confidence DECIMAL(3,2),
    ai_detected_label VARCHAR(100),
    colors TEXT[] DEFAULT '{}',
    pattern VARCHAR(100),
    material VARCHAR(100),
    season TEXT[] DEFAULT '{}',
    wear_count INTEGER DEFAULT 0,
    last_worn TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_created_at ON wardrobe_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_styles ON wardrobe_items USING GIN(styles);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wardrobe_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER wardrobe_items_updated_at
    BEFORE UPDATE ON wardrobe_items
    FOR EACH ROW
    EXECUTE FUNCTION update_wardrobe_items_updated_at();

-- RLS (Row Level Security) Policy
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own wardrobe items
CREATE POLICY "Users can view own wardrobe items"
    ON wardrobe_items FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own wardrobe items
CREATE POLICY "Users can insert own wardrobe items"
    ON wardrobe_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own wardrobe items
CREATE POLICY "Users can update own wardrobe items"
    ON wardrobe_items FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own wardrobe items
CREATE POLICY "Users can delete own wardrobe items"
    ON wardrobe_items FOR DELETE
    USING (auth.uid() = user_id);

-- Sample query to test the table
-- INSERT INTO wardrobe_items (user_id, name, category, styles, original_image_url, processed_image_url, ai_confidence, ai_detected_label)
-- VALUES ('user-uuid', 'Blue Denim Jeans', 'PANTS', ARRAY['Casual', 'Classic'], 'uploads/original.jpg', 'uploads/processed_no_bg.png', 0.92, 'jeans');
