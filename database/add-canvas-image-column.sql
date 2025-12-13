-- Add canvas_image column to outfits table
-- Run this in Supabase SQL Editor to add the missing column

ALTER TABLE outfits 
ADD COLUMN canvas_image TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN outfits.canvas_image IS 'Base64 encoded image data of the outfit canvas visualization';
