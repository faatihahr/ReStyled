import { NextRequest, NextResponse } from 'next/server';
import { updateStylePreferences, getStylePreferences } from '../../../../lib/database';
import { authService } from '../../../services/authService';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const preferences = await getStylePreferences(user.id);
    
    if (!preferences) {
      return NextResponse.json({ error: 'User preferences not found' }, { status: 404 });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { gender, style, height, weight, skin_undertone } = body;

    if (!gender || !style || !height || !weight || !skin_undertone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const preferences = {
      gender,
      style_preferences: Array.isArray(style) ? style : [style],
      color_preferences: [], // Can be extended later
      avoid_colors: [],
      avoid_styles: [],
      preferred_fit: 'regular',
      body_type: 'unknown',
      lifestyle_factors: {
        height,
        weight,
        skin_undertone
      }
    };

    const savedPreferences = await updateStylePreferences(user.id, preferences);

    return NextResponse.json({ preferences: savedPreferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    
    const savedPreferences = await updateStylePreferences(user.id, body);

    return NextResponse.json({ preferences: savedPreferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
