import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/upload - Starting request');
    
    // Get the current user from session
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user session
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.log('Invalid token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    console.log('User verified:', user.id);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const filename = `profile-${user.id}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    console.log('Uploading to Supabase storage:', filename);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filename);

    console.log('Upload successful:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
