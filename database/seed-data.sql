-- Sample seed data for ReStyled Digital Wardrobe Assistant
-- Run this after creating the schema to populate with test data

-- Insert sample users
INSERT INTO users (id, email, password_hash, name, style_preferences, body_measurements) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'sarah@example.com', '$2b$10$example_hash_sarah', 'Sarah Johnson', 
 '{"color_preferences": ["blue", "white", "black"], "style_preferences": ["casual", "elegant"], "avoid_colors": ["orange"], "preferred_fit": "slim"}',
 '{"height": "5\'6\"", "size": "M", "body_type": "athletic"}'),

('550e8400-e29b-41d4-a716-446655440002', 'mike@example.com', '$2b$10$example_hash_mike', 'Mike Chen', 
 '{"color_preferences": ["black", "gray", "navy"], "style_preferences": ["casual", "minimalist"], "avoid_colors": ["pink"], "preferred_fit": "regular"}',
 '{"height": "5\'10\"", "size": "L", "body_type": "athletic"}'),

('550e8400-e29b-41d4-a716-446655440003', 'emma@example.com', '$2b$10$example_hash_emma', 'Emma Wilson', 
 '{"color_preferences": ["pastel", "white", "beige"], "style_preferences": ["bohemian", "casual"], "avoid_colors": ["black"], "preferred_fit": "relaxed"}',
 '{"height": "5\'4\"", "size": "S", "body_type": "petite"}');

-- Insert sample clothing items for Sarah
INSERT INTO clothing_items (user_id, name, category, subcategory, colors, pattern, style, seasons, material, brand, size, purchase_date, purchase_price, image_url, ai_analysis) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Classic White T-Shirt', 'top', 't-shirt', '["white"]', 'solid', 'casual', '{spring, summer, fall}', 'cotton', 'Uniqlo', 'M', '2024-01-15', 29.99, 'https://example.com/images/white-tshirt.jpg',
 '{"category_confidence": 0.95, "color_confidence": 0.98, "style_confidence": 0.87, "detected_features": ["round_neck", "short_sleeves"]}'),

('550e8400-e29b-41d4-a716-446655440001', 'Blue Denim Jeans', 'bottom', 'jeans', '["blue"]', 'solid', 'casual', '{spring, summer, fall, winter}', 'denim', 'Levi\'s', 'M', '2024-02-10', 89.99, 'https://example.com/images/blue-jeans.jpg',
 '{"category_confidence": 0.97, "color_confidence": 0.94, "style_confidence": 0.91, "detected_features": ["straight_fit", "medium_wash"]}'),

('550e8400-e29b-41d4-a716-446655440001', 'Black Blazer', 'outerwear', 'blazer', '["black"]', 'solid', 'formal', '{fall, winter, spring}', 'wool_blend', 'Zara', 'M', '2024-03-05', 149.99, 'https://example.com/images/black-blazer.jpg',
 '{"category_confidence": 0.92, "color_confidence": 0.96, "style_confidence": 0.89, "detected_features": ["single_breasted", "notched_lapel"]}'),

('550e8400-e29b-41d4-a716-446655440001', 'Floral Summer Dress', 'dress', 'sundress', '["white", "pink", "green"]', 'floral', 'casual', '{spring, summer}', 'cotton', 'H&M', 'M', '2024-04-20', 59.99, 'https://example.com/images/floral-dress.jpg',
 '{"category_confidence": 0.94, "color_confidence": 0.88, "style_confidence": 0.85, "detected_features": ["a_line", "spaghetti_straps"]}'),

('550e8400-e29b-41d4-a716-446655440001', 'Navy Sneakers', 'shoes', 'sneakers', '["navy", "white"]', 'solid', 'casual', '{spring, summer, fall}', 'canvas', 'Converse', '8', '2024-01-25', 69.99, 'https://example.com/images/navy-sneakers.jpg',
 '{"category_confidence": 0.96, "color_confidence": 0.91, "style_confidence": 0.87, "detected_features": ["low_top", "rubber_sole"]}');

-- Insert sample clothing items for Mike
INSERT INTO clothing_items (user_id, name, category, subcategory, colors, pattern, style, seasons, material, brand, size, purchase_date, purchase_price, image_url, ai_analysis) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'Black Hoodie', 'top', 'hoodie', '["black"]', 'solid', 'casual', '{fall, winter, spring}', 'cotton', 'Nike', 'L', '2024-02-15', 79.99, 'https://example.com/images/black-hoodie.jpg',
 '{"category_confidence": 0.93, "color_confidence": 0.97, "style_confidence": 0.86, "detected_features": ["pullover", "kangaroo_pocket"]}'),

('550e8400-e29b-41d4-a716-446655440002', 'Gray Joggers', 'bottom', 'joggers', '["gray"]', 'solid', 'sporty', '{fall, winter, spring}', 'fleece', 'Adidas', 'L', '2024-01-20', 49.99, 'https://example.com/images/gray-joggers.jpg',
 '{"category_confidence": 0.95, "color_confidence": 0.92, "style_confidence": 0.88, "detected_features": ["elastic_waist", "cuffed_ankles"]}'),

('550e8400-e29b-41d4-a716-446655440002', 'White Oxford Shirt', 'top', 'button_up', '["white"]', 'solid', 'formal', '{spring, summer, fall, winter}', 'cotton', 'Brooks Brothers', 'L', '2024-03-10', 89.99, 'https://example.com/images/white-oxford.jpg',
 '{"category_confidence": 0.96, "color_confidence": 0.98, "style_confidence": 0.91, "detected_features": ["button_down", "long_sleeves"]}'),

('550e8400-e29b-41d4-a716-446655440002', 'Black Dress Shoes', 'shoes', 'dress_shoes', '["black"]', 'solid', 'formal', '{fall, winter, spring}', 'leather  ', '  'Cole Haan.
 '{"category_conf.
 '550e8400-e29b-41d4-a716-446655440002', 'Navy Chinos', 'bottom', 'chinos', '["navy"]', 'solid', 'casual', '{spring, summer, fall}', 'cotton', 'J.Crew', 'L', '2024-02-28', 69.99, 'https://example.com/images/navy-chinos.jpg',
 '{"category_confidence": 0.94, "color_confidence": 0.95, "style_confidence": 0.89, "detected_features": ["flat_front", "straight_leg"]}');
-- Insert sample clothing items for Emma
INSERT INTO clothing_items (user_id, name, category, subcategory, colors, pattern, style, seasons, material, brand, size, purchase_date, purchase_price, image_url, ai_analysis) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'Pastel Pink Cardigan', 'outerwear', 'cardigan', '["pink", "white"]', 'solid', 'bohemian', '{spring, fall}', 'acrylic', 'Free People', 'S', '2024-03-15', 79.99, 'https://example.com/images/pink-cardigan.jpg',
 '{"category_confidence": 0.91, "color_confidence": 0.89, "style_confidence": 0.86, "detected_features": ["open_front", "long_sleeves"]}'),

('550e8400-e29b-41d4-a716-446655440003', 'White Lace Top', 'top', 'blouse', '["white"]', 'lace', 'bohemian', '{spring, summer}', 'cotton', 'Anthropologie', 'S', '2024-04-10', 89.99, 'https://example.com/images/lace-top.jpg',
 '{"category_confidence": 0.92, "color_confidence": 0.94, "style_confidence": 0.88, "detected_features": ["v_neck", "sleeveless"]}'),

('550e8400-e29b-41d4-a716-446655440003', 'Beige Linen Pants', 'bottom', 'trousers', '["beige"]', 'solid', 'bohemian', '{spring, summer}', 'linen', 'Madewell', 'S', '2024-05-01', 99.99, 'https://example.com/images/linen-pants.jpg',
 '{"category_confidence": 0.93, "color_confidence": 0.91, "style_confidence": 0.87, "detected_features": ["wide_leg", "elastic_waist"]}'),

('550e8400-e29b-41d4-a716-446655440003', 'Brown Leather Boots', 'shoes', 'boots', '["brown"]', 'solid', 'bohemian', '{fall, winter, spring}', 'leather', 'Frye', '7', '2024-02-20', 189.99, 'https://example.com/images/brown-boots.jpg',
 '{"category_confidence": 0.95, "color_confidence": 0.93, "style_confidence": 0.90, "detected_features": ["ankle_height", "side_zipper"]}');

-- Insert sample outfits
INSERT INTO outfits (user_id, name, description, occasion, season, weather_suitable, style_tags, clothing_item_ids, ai_generated, confidence_score) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Casual Weekend Look', 'Perfect for weekend brunch or casual outings', 'casual', 'spring', '{sunny, mild}', '{comfortable, relaxed}', 
 ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005'], true, 0.92),

('550e8400-e29b-41d4-a716-446655440001', 'Business Casual Meeting', 'Professional yet stylish for office meetings', 'work', 'fall', '{mild, cloudy}', '{professional, polished}', 
 ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'], true, 0.88),

('550e8400-e29b-41d4-a716-446655440001', 'Summer Garden Party', 'Elegant and comfortable for outdoor events', 'party', 'summer', '{sunny, warm}', '{elegant, feminine}', 
 ARRAY['550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'], true, 0.85),

('550e8400-e29b-41d4-a716-446655440002', 'Gym Ready', 'Comfortable workout outfit', 'sport', 'all', '{any}', '{athletic, comfortable}', 
 ARRAY['550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007'], true, 0.90),

('550e8400-e29b-41d4-a716-446655440002', 'Smart Casual Friday', 'Relaxed but put-together for casual office days', 'work', 'spring', '{mild}', '{smart, casual}', 
 ARRAY['550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440009'], true, 0.87),

('550e8400-e29b-41d4-a716-446655440003', 'Boho Chic Brunch', 'Free-spirited and stylish for weekend gatherings', 'casual', 'spring', '{sunny, mild}', '{bohemian, artistic}', 
 ARRAY['550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440014'], true, 0.91),

('550e8400-e29b-41d4-a716-446655440003', 'Cozy Autumn Day', 'Warm and layered for crisp fall weather', 'casual', 'fall', '{cool, crisp}', '{cozy, layered}', 
 ARRAY['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440015'], true, 0.89);

-- Insert sample outfit logs
INSERT INTO outfit_logs (user_id, outfit_id, worn_date, occasion, weather, temperature, user_rating, notes) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-06-15', 'brunch', 'sunny', 72.5, 5, 'Perfect for Sunday brunch with friends!'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '2024-06-18', 'work_meeting', 'cloudy', 68.0, 4, 'Good for presentation, felt confident'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '2024-06-14', 'gym', 'indoor', 70.0, 5, 'Great workout session'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '2024-06-16', 'art_gallery', 'sunny', 75.0, 5, 'Got so many compliments!'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', '2024-06-17', 'coffee_shop', 'cool', 65.0, 4, 'Perfect autumn weather for this outfit');

-- Insert style preferences
INSERT INTO style_preferences (user_id, color_preferences, style_preferences, avoid_colors, avoid_styles, preferred_fit, body_type, lifestyle_factors) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '["blue", "white", "black", "gray"]', '{casual, elegant}', '["orange", "neon_green"]', '{overly_trendy, gothic}', 'slim', 'athletic', '{"activity_level": "moderate", "work_environment": "business_casual", "climate": "temperate"}'),

('550e8400-e29b-41d4-a716-446655440002', '["black", "gray", "navy", "white"]', '{casual, minimalist, formal}', '["pink", "purple"]', '{bohemian, vintage}', 'regular', 'athletic', '{"activity_level": "high", "work_environment": "smart_casual", "climate": "temperate"}'),

('550e8400-e29b-41d4-a716-446655440003', '["pastel", "white", "beige", "cream"]', '{bohemian, casual}', '["black", "dark_gray"]', '{minimalist, formal}', 'relaxed', 'petite', '{"activity_level": "low", "work_environment": "creative", "climate": "warm"}');

-- Insert sample recommendations
INSERT INTO recommendations (user_id, outfit_id, algorithm_version, context, confidence_score, user_feedback) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '1.0', '{"occasion": "casual", "weather": "sunny", "temperature": 72}', 0.92, true),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '1.0', '{"occasion": "work", "weather": "cloudy", "temperature": 68}', 0.88, true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '1.0', '{"occasion": "sport", "weather": "indoor", "temperature": 70}', 0.90, true),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '1.0', '{"occasion": "casual", "weather": "sunny", "temperature": 75}', 0.91, true);

-- Insert sample shopping lists
INSERT INTO shopping_lists (user_id, name, items_needed, budget, priority) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Summer Wardrobe Update', '[{"category": "dress", "colors": ["blue", "white"], "style": "casual"}, {"category": "shoes", "colors": ["white"], "style": "sandals"}]', 200.00, 'medium'),

('550e8400-e29b-41d4-a716-446655440002', 'Work Essentials', '[{"category": "shirt", "colors": ["white", "blue"], "style": "formal"}, {"category": "shoes", "colors": ["black"], "style": "dress_shoes"}]', 300.00, 'high'),

('550e8400-e29b-41d4-a716-446655440003', 'Fall Layering Pieces', '[{"category": "sweater", "colors": ["beige", "cream"], "style": "bohemian"}, {"category": "outerwear", "colors": ["brown"], "style": "casual"}]', 250.00, 'low');

-- Insert sample inspiration bookmarks
INSERT INTO inspiration_bookmarks (user_id, tags, notes) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '{minimalist, work, casual}', 'Love this clean office look'),
('550e8400-e29b-41d4-a716-446655440002', '{athletic, streetwear}', 'Great casual outfit inspiration'),
('550e8400-e29b-41d4-a716-446655440003', '{bohemian, festival, summer}', 'Perfect for music festival season');

-- Insert sample analytics data
INSERT INTO wardrobe_analytics (user_id, metric_type, metric_data, period_start, period_end) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'most_worn_items', '{"items": [{"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Classic White T-Shirt", "wear_count": 8}]}', '2024-06-01', '2024-06-30'),

('550e8400-e29b-41d4-a716-446655440001', 'cost_per_wear', '{"average": 12.50, "items": [{"id": "550e8400-e29b-41d4-a716-446655440001", "cost_per_wear": 3.75}]}', '2024-06-01', '2024-06-30'),

('550e8400-e29b-41d4-a716-446655440002', 'wardrobe_value', '{"total_value": 479.95, "item_count": 5, "average_item_value": 95.99}', '2024-06-01', '2024-06-30'),

('550e8400-e29b-41d4-a716-446655440003', 'color_distribution', '{"colors": [{"color": "white", "percentage": 35}, {"color": "beige", "percentage": 25}, {"color": "brown", "percentage": 20}]}', '2024-06-01', '2024-06-30');
