import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return default categories and styles
    const categories = ['TOPS', 'PANTS', 'DRESS', 'SKIRTS', 'SHOES', 'BAGS', 'JEWELRY', 'HATS', 'NAILS'];
    const styles = ['Casual', 'Classic', 'Chic', 'Streetwear', 'Preppy', 'Vintage Retro', 'Y2K', 'Minimalist', 'Formal', 'Bohemian'];

    return NextResponse.json({
      categories,
      styles
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}
