# Database Setup Instructions

## Execute the Wardrobe Items Schema

To ensure clothing items are saved to Supabase, you need to execute the SQL schema in your Supabase project.

### Steps:

1. **Go to Supabase Dashboard**
   - Login to https://supabase.com/dashboard
   - Select your project: `tnpzuhluiygzjbfqcuzc`

2. **Open SQL Editor**
   - In the left sidebar, click on "SQL Editor"
   - Click "New query"

3. **Execute the Schema**
   - Copy the contents of `database/wardrobe-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the schema

4. **Verify Table Creation**
   - Go to "Table Editor" in the left sidebar
   - You should see the `wardrobe_items` table
   - Click on it to verify the structure

### What the Schema Does:

- Creates `wardrobe_items` table with all necessary fields
- Adds indexes for better performance
- Sets up Row Level Security (RLS) policies
- Creates triggers for automatic timestamp updates
- Ensures users can only access their own clothing items

### Test the Integration:

After setting up the database:

1. Start your backend server: `npm run dev` (in backend folder)
2. Start your frontend: `npm run dev` (in root folder)
3. Try uploading a clothing item
4. Check Supabase Table Editor to see if the item was saved

### Expected Data Structure:

When you upload clothing, it should appear in Supabase like:

```sql
SELECT * FROM wardrobe_items;
```

Columns should include:
- `id` (UUID)
- `user_id` (UUID) 
- `name` (TEXT)
- `category` (TEXT)
- `styles` (TEXT[])
- `original_image_url` (TEXT)
- `processed_image_url` (TEXT)
- `ai_confidence` (DECIMAL)
- `ai_detected_label` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Troubleshooting:

If items aren't saving to Supabase:

1. Check if the schema was executed successfully
2. Verify backend environment variables are correct
3. Check browser console for authentication errors
4. Check backend console for database connection errors
