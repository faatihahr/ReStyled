import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch wardrobe items
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // Get category filter from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }

    const { data: items, error: dbError } = await query;

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch wardrobe items' }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });

  } catch (error) {
    console.error('GET wardrobe items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new wardrobe item
export async function POST(request: NextRequest) {
  try {
    // Get the current user from session
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token', details: authError?.message }, { status: 403 });
    }

    console.log('Authenticated user:', { id: user.id, email: user.email });

    const body = await request.json();
    const { name, category, styles, originalImageUrl, processedImageUrl } = body;

    console.log('Saving wardrobe item:', { name, category, styles, originalImageUrl, processedImageUrl, userId: user.id });

    // Validate required fields
    if (!originalImageUrl) {
      console.error('Missing originalImageUrl');
      return NextResponse.json({ error: 'Original image URL is required' }, { status: 400 });
    }

    // Insert wardrobe item
    const { data: item, error: dbError } = await supabase
      .from('wardrobe_items')
      .insert({
        user_id: user.id,
        name,
        category,
        styles: styles || [],
        original_image_url: originalImageUrl,
        processed_image_url: processedImageUrl,
        ai_confidence: 0.8,
        ai_detected_label: category
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      
      // Check specific error types
      if (dbError.message.includes('foreign key constraint')) {
        console.error('Foreign key constraint violation - user_id not found in users table');
        return NextResponse.json({ 
          error: 'User validation failed', 
          details: 'User ID does not exist in database. Please ensure you are properly authenticated.' 
        }, { status: 400 });
      }
      
      // Check if table doesn't exist
      if (dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database schema not set up', 
          details: 'Please execute wardrobe-schema.sql in Supabase SQL Editor' 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to save wardrobe item', 
        details: dbError.message 
      }, { status: 500 });
    }

    console.log('Wardrobe item saved successfully:', item);

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
        styles: item.styles,
        original_image_url: item.original_image_url,
        processed_image_url: item.processed_image_url,
        created_at: item.created_at
      }
    });

  } catch (error) {
    console.error('Wardrobe save error:', error);
    return NextResponse.json({ 
      error: 'Failed to save wardrobe item', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
