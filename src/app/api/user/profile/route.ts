import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/user/profile - Starting request');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Create a service-role Supabase client (do NOT attach the user's token as a header)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Getting user from Supabase...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.log('Invalid token or user error:', userError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User verified:', user.id);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, username, profile_picture, header_image } = body;

    // Perform a server-side (admin) update using the service role key
    const { data: updatedUser, error: updateError } = await supabaseClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        name: name || user.user_metadata?.name,
        username: username || user.user_metadata?.username,
        profile_picture: profile_picture || user.user_metadata?.profile_picture,
        header_image: header_image || user.user_metadata?.header_image,
      }
    });

    if (updateError) {
      console.error('Error updating user metadata (admin):', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Also update in users table if it exists
    try {
      const { error: tableUpdateError } = await supabaseClient
        .from('users')
        .update({
          name: name || user.user_metadata?.name,
          username: username || user.user_metadata?.username,
          avatar_url: profile_picture || user.user_metadata?.profile_picture,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (tableUpdateError && tableUpdateError.code !== 'PGRST116') {
        console.log('Table update error (non-critical):', tableUpdateError);
      }
    } catch (tableError) {
      console.log('Table update error (non-critical):', tableError);
    }

    console.log('Profile updated successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: name || user.user_metadata?.name,
        username: username || user.user_metadata?.username,
        profile_picture: profile_picture || user.user_metadata?.profile_picture,
        header_image: header_image || user.user_metadata?.header_image,
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/user/profile - Starting request');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Create a service-role Supabase client for admin operations
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Getting user from Supabase...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.log('Invalid token or user error:', userError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User verified:', user.id);
    
    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      username: user.user_metadata?.username || '',
      profile_picture: user.user_metadata?.profile_picture || '',
      header_image: user.user_metadata?.header_image || '',
      created_at: user.created_at
    };

    console.log('Profile retrieved successfully');
    return NextResponse.json({ user: userProfile });

  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
