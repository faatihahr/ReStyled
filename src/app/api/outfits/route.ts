import { NextRequest, NextResponse } from 'next/server';
import { createOutfit, getOutfits, updateOutfit, deleteOutfit } from '../../../../lib/database';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/outfits - Starting request');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    console.log('Getting user from Supabase...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.log('Invalid token or user error:', userError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User verified:', user.id);
    console.log('Fetching outfits from database...');
    const outfits = await getOutfits(user.id);
    console.log('Database outfits count:', outfits?.length || 0);
    console.log('Database outfits:', outfits);
    
    return NextResponse.json({ outfits });
  } catch (error) {
    console.error('Error getting outfits:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to get outfits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/outfits - Starting request');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('Creating Supabase client with token...');
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    console.log('Getting user from Supabase...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.log('Invalid token or user error:', userError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User verified:', user.id);
    
    // Ensure user exists in users table
    console.log('Checking user in users table...');
    const { data: existingUser, error: userCheckError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (userCheckError && userCheckError.code === 'PGRST116') {
      console.log('User not found in users table, creating...');
      const { error: createUserError } = await supabaseClient
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          password_hash: '', // Empty string for Supabase Auth users
          created_at: new Date().toISOString()
        });
      
      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
      
      console.log('User created successfully');
    } else if (userCheckError) {
      console.error('Error checking user:', userCheckError);
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
    } else {
      console.log('User exists in users table');
    }
    
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, description, clothing_item_ids, occasion, season, canvas_image } = body;

    if (!name || !clothing_item_ids || !Array.isArray(clothing_item_ids)) {
      console.log('Missing required fields:', { name, clothing_item_ids });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating outfit data...');
    const outfitData = {
      name,
      description: description || '',
      user_id: user.id,
      clothing_item_ids,
      occasion: occasion || 'casual',
      season: season || 'all',
      canvas_image: canvas_image || null,
      weather_suitable: [],
      style_tags: [],
      ai_generated: false,
      confidence_score: 1.0,
      favorite_count: 0,
      is_public: false,
      is_favorite: false
    };

    console.log('Saving outfit to database...', outfitData);
    const outfit = await createOutfit(outfitData);
    console.log('Outfit saved successfully:', outfit);
    
    return NextResponse.json({ outfit });
  } catch (error) {
    console.error('Error saving outfit:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to save outfit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/outfits - Starting request');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    console.log('Getting user from Supabase...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.log('Invalid token or user error:', userError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User verified:', user.id);

    const body = await request.json();
    console.log('Request body:', body);
    const { id, name, description, clothing_item_ids, occasion, season, canvas_image } = body;

    if (!id || !name || !clothing_item_ids || !Array.isArray(clothing_item_ids)) {
      console.log('Missing required fields:', { id, name, clothing_item_ids });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.log('Invalid UUID format, this is likely a locally stored outfit');
      // For locally stored outfits with string IDs, we can't update in database
      // Return success since the client will handle localStorage update
      return NextResponse.json({ 
        success: true, 
        message: 'Local outfit - client will handle update' 
      });
    }

    const outfitData = {
      name,
      description: description || '',
      clothing_item_ids,
      occasion: occasion || 'casual',
      season: season || 'all',
      updated_at: new Date().toISOString()
    };

    console.log('Updating outfit with data:', outfitData);
    const outfit = await updateOutfit(id, outfitData);
    console.log('Outfit updated successfully:', outfit);
    
    return NextResponse.json({ outfit });
  } catch (error) {
    console.error('Error updating outfit:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to update outfit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/outfits - Starting request');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    console.log('Getting user from Supabase...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.log('Invalid token or user error:', userError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User verified:', user.id);

    const body = await request.json();
    console.log('Request body:', body);
    const { id } = body;

    if (!id) {
      console.log('Missing outfit ID');
      return NextResponse.json(
        { error: 'Missing outfit ID' },
        { status: 400 }
      );
    }

    console.log('Deleting outfit:', id);
    
    // Check if the ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.log('Invalid UUID format, this is likely a locally stored outfit');
      // For locally stored outfits with string IDs, we can't delete from database
      // Return success since the client will handle localStorage cleanup
      return NextResponse.json({ 
        success: true, 
        message: 'Local outfit - client will handle cleanup' 
      });
    }
    
    await deleteOutfit(id);
    console.log('Outfit deleted successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to delete outfit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
