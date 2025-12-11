-- ReStyled Digital Wardrobe Assistant - Supabase Database Schema
-- Created for PostgreSQL/Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE occasion_type AS ENUM ('work', 'casual', 'party', 'formal', 'sport', 'date', 'travel', 'other');
CREATE TYPE season_type AS ENUM ('spring', 'summer', 'fall', 'winter', 'all');
CREATE TYPE category_type AS ENUM ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories', 'underwear', 'other');
CREATE TYPE style_type AS ENUM ('casual', 'formal', 'sporty', 'elegant', 'bohemian', 'minimalist', 'vintage', 'trendy');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    style_preferences JSONB DEFAULT '{}',
    body_measurements JSONB DEFAULT '{}',
    climate_zone VARCHAR(50),
    is_active BOOLEAN DEFAULT true
);

-- Clothing items table
CREATE TABLE clothing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category category_type NOT NULL,
    subcategory VARCHAR(100),
    colors JSONB DEFAULT '[]',
    pattern VARCHAR(100),
    style style_type,
    seasons season_type[] DEFAULT '{}',
    material VARCHAR(100),
    brand VARCHAR(100),
    size VARCHAR(50),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    image_url VARCHAR(500) NOT NULL,
    ai_analysis JSONB DEFAULT '{}',
    wear_count INTEGER DEFAULT 0,
    last_worn DATE,
    is_favorite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outfits table
CREATE TABLE outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    occasion occasion_type,
    season season_type,
    weather_suitable VARCHAR(100)[] DEFAULT '{}',
    style_tags VARCHAR(100)[] DEFAULT '{}',
    clothing_item_ids UUID[] DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3, 2) DEFAULT 0.00,
    favorite_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outfit logs (tracking when outfits are worn)
CREATE TABLE outfit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL,
    worn_date DATE NOT NULL,
    occasion VARCHAR(100),
    weather VARCHAR(50),
    temperature DECIMAL(5, 2),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    notes TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Style preferences table
CREATE TABLE style_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    color_preferences JSONB DEFAULT '[]',
    style_preferences style_type[] DEFAULT '{}',
    avoid_colors JSONB DEFAULT '[]',
    avoid_styles VARCHAR(100)[] DEFAULT '{}',
    preferred_fit VARCHAR(50),
    body_type VARCHAR(50),
    lifestyle_factors JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analyses table
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clothing_item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    analysis_version VARCHAR(50) DEFAULT '1.0',
    features_extracted JSONB DEFAULT '{}',
    confidence_scores JSONB DEFAULT '{}',
    processing_time DECIMAL(8, 3),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
    algorithm_version VARCHAR(50) DEFAULT '1.0',
    context JSONB DEFAULT '{}',
    confidence_score DECIMAL(3, 2) DEFAULT 0.00,
    user_feedback BOOLEAN,
    feedback_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wardrobe analytics table
CREATE TABLE wardrobe_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    metric_data JSONB DEFAULT '{}',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping lists table
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    items_needed JSONB DEFAULT '[]',
    budget DECIMAL(10, 2),
    priority VARCHAR(50) DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspiration bookmarks table
CREATE TABLE inspiration_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL,
    source_url VARCHAR(500),
    tags VARCHAR(100)[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON clothing_items(category);
CREATE INDEX idx_clothing_items_colors ON clothing_items USING GIN(colors);
CREATE INDEX idx_clothing_items_seasons ON clothing_items USING GIN(seasons);
CREATE INDEX idx_clothing_items_active ON clothing_items(is_active);
CREATE INDEX idx_clothing_items_favorite ON clothing_items(is_favorite);

CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfits_occasion ON outfits(occasion);
CREATE INDEX idx_outfits_season ON outfits(season);
CREATE INDEX idx_outfits_public ON outfits(is_public);
CREATE INDEX idx_outfits_favorite ON outfits(is_favorite);
CREATE INDEX idx_outfits_clothing_items ON outfits USING GIN(clothing_item_ids);

CREATE INDEX idx_outfit_logs_user_id ON outfit_logs(user_id);
CREATE INDEX idx_outfit_logs_outfit_id ON outfit_logs(outfit_id);
CREATE INDEX idx_outfit_logs_date ON outfit_logs(worn_date);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_outfit_id ON recommendations(outfit_id);
CREATE INDEX idx_recommendations_confidence ON recommendations(confidence_score);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothing_items_updated_at BEFORE UPDATE ON clothing_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_style_preferences_updated_at BEFORE UPDATE ON style_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Clothing items policies
CREATE POLICY "Users can view own clothing items" ON clothing_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own clothing items" ON clothing_items
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Outfits policies
CREATE POLICY "Users can view own outfits" ON outfits
    FOR SELECT USING (auth.uid()::text = user_id::text OR is_public = true);

CREATE POLICY "Users can manage own outfits" ON outfits
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Outfit logs policies
CREATE POLICY "Users can manage own outfit logs" ON outfit_logs
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Style preferences policies
CREATE POLICY "Users can manage own style preferences" ON style_preferences
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Recommendations policies
CREATE POLICY "Users can view own recommendations" ON recommendations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own recommendations feedback" ON recommendations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON wardrobe_analytics
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert analytics" ON wardrobe_analytics
    FOR INSERT WITH CHECK (true);

-- Shopping lists policies
CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Inspiration bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON inspiration_bookmarks
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Insert sample data for testing
INSERT INTO users (id, email, password_hash, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@restyled.com', '$2b$10$example_hash', 'Demo User');

-- Create storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public) VALUES 
('clothing-images', 'clothing-images', true);

-- Storage policies for clothing images
CREATE POLICY "Users can upload their own clothing images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'clothing-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own clothing images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'clothing-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own clothing images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'clothing-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own clothing images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'clothing-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create view for wardrobe statistics
CREATE VIEW wardrobe_stats AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    COUNT(ci.id) as total_items,
    COUNT(CASE WHEN ci.is_favorite = true THEN 1 END) as favorite_items,
    COUNT(DISTINCT ci.category) as unique_categories,
    SUM(ci.wear_count) as total_wears,
    AVG(ci.purchase_price) as avg_item_price,
    SUM(ci.purchase_price) as total_wardrobe_value
FROM users u
LEFT JOIN clothing_items ci ON u.id = ci.user_id AND ci.is_active = true
GROUP BY u.id, u.name;

-- Create function to update wear count
CREATE OR REPLACE FUNCTION increment_wear_count(item_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE clothing_items 
    SET wear_count = wear_count + 1, 
        last_worn = CURRENT_DATE
    WHERE id = item_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get outfit recommendations
CREATE OR REPLACE FUNCTION get_outfit_recommendations(
    user_uuid UUID,
    occasion_param VARCHAR DEFAULT 'casual',
    limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
    outfit_id UUID,
    outfit_name VARCHAR,
    confidence_score DECIMAL,
    clothing_items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.confidence_score,
        json_agg(
            json_build_object(
                'id', ci.id,
                'name', ci.name,
                'category', ci.category,
                'image_url', ci.image_url,
                'colors', ci.colors
            )
        ) as clothing_items
    FROM outfits o
    JOIN clothing_items ci ON ci.id = ANY(o.clothing_item_ids)
    WHERE o.user_id = user_uuid
        AND (occasion_param = 'any' OR o.occasion = occasion_param::occasion_type)
        AND o.confidence_score > 0.5
    GROUP BY o.id, o.name, o.confidence_score
    ORDER BY o.confidence_score DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
