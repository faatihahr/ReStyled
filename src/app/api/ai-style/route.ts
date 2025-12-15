import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    // Get the current user from session
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user session
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const body = await request.json();
    const { occasion } = body;

    // Fetch user's wardrobe items with AI analysis data
    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (wardrobeError) {
      console.error('Database error:', wardrobeError);
      return NextResponse.json({ error: 'Failed to fetch wardrobe items' }, { status: 500 });
    }

    if (!wardrobeItems || wardrobeItems.length === 0) {
      return NextResponse.json({ 
        error: 'No wardrobe items found',
        message: 'Please upload some clothing items first to get AI recommendations'
      }, { status: 400 });
    }

    console.log('Found wardrobe items:', wardrobeItems.length);

    // Prepare wardrobe data for AI analysis
    // Shuffle items to avoid bias towards recently uploaded items
    const shuffledItems = [...wardrobeItems].sort(() => Math.random() - 0.5);
    
    const wardrobeData = shuffledItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      styles: item.styles || [],
      ai_confidence: item.ai_confidence,
      ai_detected_label: item.ai_detected_label,
      processed_image_url: item.processed_image_url
    }));

    const prompt = createOutfitPrompt(wardrobeData, occasion);
    
    console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');

    // Generate outfit recommendations using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const text = response.text;

    console.log('Gemini response:', text);

    // Parse AI response to extract outfit recommendations
    let outfitRecommendations;
    try {
      // Clean up the response and extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outfitRecommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        outfitRecommendations = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw response:', text);
      
      // Return a basic outfit as fallback
      const fallbackOutfit = createFallbackOutfit(wardrobeData);
      return NextResponse.json({
        success: true,
        outfits: fallbackOutfit,
        message: 'AI response parsing failed, showing basic recommendation'
      });
    }

    // Validate and format the recommendations
    const formattedOutfits = formatOutfitRecommendations(outfitRecommendations, wardrobeData);

    return NextResponse.json({
      success: true,
      outfits: formattedOutfits,
      occasion: occasion || 'casual',
      wardrobeItemCount: wardrobeData.length
    });

  } catch (error) {
    console.error('AI styling error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate outfit recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function createOutfitPrompt(wardrobeData: any[], occasion?: string) {
  const occasionContext = occasion 
    ? `untuk acara "${occasion}"`
    : 'untuk penggunaan sehari-hari (casual)';

  // Extract all available styles from wardrobe data
  const allStyles = [...new Set(wardrobeData.flatMap(item => item.styles || []))];
  const styleCategories = {
    casual: ['Casual', 'Streetwear', 'Minimalist', 'Classic'],
    formal: ['Classic', 'Chic', 'Minimalist'],
    trendy: ['Y2K', 'Vintage Retro', 'Streetwear'],
    romantic: ['Chic', 'Classic', 'Vintage Retro'],
    beach: ['Casual', 'Minimalist', 'Y2K'],
    campus: ['Casual', 'Streetwear', 'Classic', 'Minimalist'],
    office: ['Classic', 'Chic', 'Minimalist'],
    date: ['Chic', 'Classic', 'Y2K', 'Vintage Retro']
  };

  let targetStyles = [];
  if (occasion) {
    const occasionLower = occasion.toLowerCase();
    if (occasionLower.includes('kampus') || occasionLower.includes('campus')) {
      targetStyles = [...styleCategories.campus];
    } else if (occasionLower.includes('kantor') || occasionLower.includes('office')) {
      targetStyles = [...styleCategories.office];
    } else if (occasionLower.includes('kencan') || occasionLower.includes('date')) {
      targetStyles = [...styleCategories.date];
    } else if (occasionLower.includes('pantai') || occasionLower.includes('beach')) {
      targetStyles = [...styleCategories.beach];
    } else if (occasionLower.includes('jalan') || occasionLower.includes('hangout')) {
      targetStyles = [...styleCategories.casual, ...styleCategories.trendy];
    } else {
      targetStyles = [...styleCategories.casual]; // default
    }
  } else {
    targetStyles = [...styleCategories.casual];
  }

  return `Kamu adalah stylist AI profesional. Saya punya data wardrobe dengan item-item berikut:

${wardrobeData.map(item => `
- ID: ${item.id}
- Nama: ${item.name}
- Kategori: ${item.category}
- Gaya: ${item.styles.join(', ')}
- Tingkat kepercayaan AI: ${item.ai_confidence}
`).join('\n')}

Gaya yang tersedia di wardrobe: ${allStyles.join(', ')}

Buat 3 rekomendasi outfit ${occasionContext}. Untuk setiap outfit, fokus pada gaya yang berbeda:
- Outfit 1: Prioritaskan gaya ${targetStyles[0]} dengan ${targetStyles[1] || 'sentuhan modern'}
- Outfit 2: Prioritaskan gaya ${targetStyles[1] || 'Casual'} dengan ${targetStyles[2] || 'sentuhan trendi'}
- Outfit 3: Prioritaskan gaya ${targetStyles[2] || 'Chic'} dengan ${targetStyles[3] || 'sentuhan klasik'}

Pertimbangkan:
1. Kombinasi warna yang harmonis
2. Keseimbangan antara atas, bawah, dan aksesori
3. Gaya yang sesuai dengan acara tetapi menampilkan variasi
4. Manfaatkan semua tag gaya yang tersedia di database
5. Tingkat kepercayaan AI dalam analisis
6. Hindari menggunakan item yang sama di semua outfit

Kembalikan respons dalam format JSON berikut:
{
  "outfit_1": {
    "name": "Nama Outfit 1",
    "description": "Deskripsi singkat outfit ini",
    "items": ["id1", "id2", "id3"],
    "reasoning": "Alasan pemilihan item ini"
  },
  "outfit_2": {
    "name": "Nama Outfit 2", 
    "description": "Deskripsi singkat outfit ini",
    "items": ["id4", "id5", "id6"],
    "reasoning": "Alasan pemilihan item ini"
  },
  "outfit_3": {
    "name": "Nama Outfit 3",
    "description": "Deskripsi singkat outfit ini", 
    "items": ["id7", "id8", "id9"],
    "reasoning": "Alasan pemilihan item ini"
  }
}

Hanya kembalikan JSON, tanpa teks tambahan.`;
}

function formatOutfitRecommendations(recommendations: any, wardrobeData: any[]) {
  const formatted = [];
  
  for (let i = 1; i <= 3; i++) {
    const outfitKey = `outfit_${i}`;
    const outfit = recommendations[outfitKey];
    
    if (outfit && outfit.items) {
      // Validate that all item IDs exist in wardrobe
      const validItems = outfit.items.filter((itemId: string) => 
        wardrobeData.find(item => item.id === itemId)
      );
      
      if (validItems.length > 0) {
        formatted.push({
          id: outfitKey,
          name: outfit.name || `Outfit ${i}`,
          description: outfit.description || `Rekomendasi outfit ${i}`,
          items: validItems,
          reasoning: outfit.reasoning || 'Dipilih berdasarkan analisis AI',
          itemDetails: validItems.map((itemId: string) => 
            wardrobeData.find(item => item.id === itemId)
          ).filter(Boolean)
        });
      }
    }
  }
  
  // If no valid outfits found, create fallback
  if (formatted.length === 0) {
    return createFallbackOutfit(wardrobeData);
  }
  
  return formatted;
}

function createFallbackOutfit(wardrobeData: any[]) {
  // Group items by category
  const tops = wardrobeData.filter(item => 
    ['TOPS', 'top', 'shirt', 'blouse'].includes(item.category.toLowerCase())
  );
  const bottoms = wardrobeData.filter(item => 
    ['PANTS', 'bottom', 'skirt', 'trousers'].includes(item.category.toLowerCase())
  );
  const shoes = wardrobeData.filter(item => 
    ['SHOES', 'shoes', 'sneakers', 'sandals'].includes(item.category.toLowerCase())
  );

  const fallbackOutfit = {
    id: 'fallback_outfit',
    name: 'Outfit Kasual',
    description: 'Rekomendasi outfit kasual yang nyaman',
    items: [],
    reasoning: 'Dipilih sebagai outfit dasar yang cocok untuk sehari-hari',
    itemDetails: []
  };

  // Add one item from each category if available
  if (tops.length > 0) {
    fallbackOutfit.items.push(tops[0].id);
    fallbackOutfit.itemDetails.push(tops[0]);
  }
  if (bottoms.length > 0) {
    fallbackOutfit.items.push(bottoms[0].id);
    fallbackOutfit.itemDetails.push(bottoms[0]);
  }
  if (shoes.length > 0) {
    fallbackOutfit.items.push(shoes[0].id);
    fallbackOutfit.itemDetails.push(shoes[0]);
  }

  return [fallbackOutfit];
}
