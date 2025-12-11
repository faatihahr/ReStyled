# ReStyled Database Setup

Database schema untuk Digital Styling Wardrobe Assistant menggunakan Supabase (PostgreSQL).

## Files

- `supabase-schema.sql` - Schema database lengkap dengan tabel, indeks, trigger, dan RLS policies
- `seed-data.sql` - Data sampel untuk testing dan development

## Cara Setup di Supabase

### 1. Buat Project Supabase
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik "New Project"
3. Pilih organization dan beri nama project (misal: "restyled-app")
4. Set password database
5. Pilih region terdekat
6. Klik "Create new project"

### 2. Import Schema
1. Buka project Supabase
2. Pergi ke **SQL Editor** di sidebar
3. Copy-paste isi file `supabase-schema.sql`
4. Klik "Run" untuk execute schema

### 3. Import Sample Data (Optional)
1. Di SQL Editor yang sama
2. Copy-paste isi file `seed-data.sql`
3. Klik "Run" untuk insert data sampel

### 4. Setup Authentication
1. Pergi ke **Authentication > Settings**
2. Enable "Enable email confirmations" jika diperlukan
3. Setup email provider (gunakan default Supabase untuk development)
4. Tambahkan website URL di "Site URL" (misal: `http://localhost:3000`)

### 5. Setup Storage
1. Pergi ke **Storage**
2. Pastikan bucket `clothing-images` sudah terbuat (via schema)
3. Test upload gambar untuk memastikan permissions berjalan

## Environment Variables

Tambahkan ke `.env.local` di frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Tables Overview

### Core Tables
- **users** - Profil user dan preferensi
- **clothing_items** - Koleksi pakaian user
- **outfits** - Kombinasi pakaian yang tersimpan
- **outfit_logs** - Tracking kapan outfit dipakai

### Supporting Tables
- **style_preferences** - Preferensi style user
- **ai_analyses** - Hasil analisis AI untuk clothing items
- **recommendations** - Rekomendasi outfit yang diberikan
- **wardrobe_analytics** - Statistik dan analytics
- **shopping_lists** - Daftar belanja pakaian
- **inspiration_bookmarks** - Bookmark outfit inspirasi

## Features

### Row Level Security (RLS)
- User hanya bisa akses data mereka sendiri
- Public outfits bisa dilihat semua user
- Storage policies untuk upload gambar

### Indexes
- Optimized queries untuk filtering berdasarkan:
  - User ID
  - Category
  - Colors (GIN index)
  - Seasons (GIN index)
  - Occasion

### Functions
- `increment_wear_count()` - Update counter pemakaian
- `get_outfit_recommendations()` - Query rekomendasi outfit

### Views
- `wardrobe_stats` - Statistik wardrobe per user

## Testing Connection

Test koneksi database dengan query berikut di SQL Editor:

```sql
-- Test basic connection
SELECT COUNT(*) as total_users FROM users;

-- Test sample data
SELECT u.name, COUNT(ci.id) as item_count 
FROM users u 
LEFT JOIN clothing_items ci ON u.id = ci.user_id 
GROUP BY u.id, u.name;

-- Test RLS (run sebagai user yang sudah login)
SELECT * FROM clothing_items WHERE user_id = auth.uid();
```

## Backup & Migration

### Backup
```sql
-- Export schema
pg_dump --schema-only --no-owner --no-privileges > schema_backup.sql

-- Export data
pg_dump --data-only --no-owner --no-privileges > data_backup.sql
```

### Migration
Untuk update schema di production:

1. Test di development environment
2. Backup production data
3. Apply migration changes
4. Verify data integrity

## Performance Tips

1. **Indexes** - Schema sudah include optimal indexes
2. **JSON Queries** - Gunakan GIN indexes untuk JSON fields
3. **Batch Operations** - Gunakan batch inserts untuk multiple records
4. **Connection Pooling** - Supabase auto-handle connection pooling

## Security Notes

- RLS policies enabled untuk semua user tables
- Service role key hanya untuk server-side operations
- Storage policies prevent unauthorized file access
- Password hashing handled by Supabase Auth

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Check user authentication status
   - Verify policy conditions match data structure

2. **Storage Permission Denied**
   - Check storage bucket policies
   - Verify user folder structure

3. **JSON Query Performance**
   - Use appropriate GIN indexes
   - Consider JSONB vs JSON based on use case

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'clothing_items';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'clothing_items';

-- Check storage policies
SELECT * FROM storage.policies;
```

## Next Steps

1. Integrate dengan backend Node.js
2. Setup client-side Supabase di Next.js
3. Implement file upload ke storage
4. Connect dengan AI analysis service
5. Setup real-time subscriptions untuk live updates
