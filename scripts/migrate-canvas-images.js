/*
Migration script: move base64 `canvas_image` values from `outfits` table
into Supabase Storage (bucket: `clothing-images`) and update the outfits
rows to store the public URL instead of the base64 data.

Usage:
  NODE_ENV=development node scripts/migrate-canvas-images.js

Environment variables required:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

This script is idempotent: it skips rows where `canvas_image` is already a
http(s) URL or NULL.
*/

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Querying outfits with embedded base64 canvas_image...');

  // Fetch outfits where canvas_image starts with 'data:image' (base64)
  const { data: outfits, error: fetchErr } = await supabase
    .from('outfits')
    .select('id, user_id, canvas_image, created_at')
    .ilike('canvas_image', 'data:image/%')
    .limit(500);

  if (fetchErr) {
    console.error('Failed to fetch outfits:', fetchErr);
    process.exit(1);
  }

  if (!outfits || outfits.length === 0) {
    console.log('No base64 canvas_image rows found. Exiting.');
    process.exit(0);
  }

  console.log('Found', outfits.length, 'rows to migrate.');

  for (const outfit of outfits) {
    try {
      const { id, user_id, canvas_image } = outfit;
      if (!canvas_image || typeof canvas_image !== 'string') {
        console.log(id, '-> no canvas_image, skipping');
        continue;
      }

      if (canvas_image.startsWith('http')) {
        console.log(id, '-> already a URL, skipping');
        continue;
      }

      const matches = canvas_image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        console.warn(id, '-> canvas_image not in expected data URL format, skipping');
        continue;
      }

      const contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const ext = contentType.split('/')[1] || 'png';
      const fileName = `${user_id}/outfits/outfit-${id}.${ext}`;

      console.log(id, '-> uploading to storage as', fileName);
      const { error: uploadError } = await supabase.storage
        .from('clothing-images')
        .upload(fileName, buffer, { contentType, upsert: true });

      if (uploadError) {
        console.error(id, '-> upload failed:', uploadError.message || uploadError);
        continue;
      }

      const { data: publicData } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(fileName);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) {
        console.error(id, '-> failed to get public URL after upload');
        continue;
      }

      // Update outfit record with public URL
      console.log(id, '-> updating outfit row with public URL');
      const { error: updateErr } = await supabase
        .from('outfits')
        .update({ canvas_image: publicUrl })
        .eq('id', id);

      if (updateErr) {
        console.error(id, '-> failed to update DB row:', updateErr);
        continue;
      }

      console.log(id, '-> migrated successfully to', publicUrl);
    } catch (err) {
      console.error('Error migrating outfit', outfit.id, err);
    }
  }

  console.log('Migration finished.');
}

main().catch(err => {
  console.error('Unhandled error in migration:', err);
  process.exit(1);
});
