import { NextRequest, NextResponse } from 'next/server';

interface Outfit {
  id: string;
  date: string;
  image: string;
  title: string;
  category: string;
  items?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Mock data - replace with actual database query
    const mockOutfits: Outfit[] = [
      {
        id: "1",
        date: "2024-06-01",
        image: "/images/black-dress.jpg",
        title: "Black Dress",
        category: "Look"
      },
      {
        id: "2", 
        date: "2024-06-02",
        image: "/images/white-top.jpg",
        title: "White Top",
        category: "Clothing"
      },
      {
        id: "3",
        date: "2024-06-02", 
        image: "/images/brown-pants.jpg",
        title: "Brown Pants",
        category: "Clothing"
      },
      {
        id: "4",
        date: "2024-06-03",
        image: "/images/pink-top.jpg", 
        title: "Pink Top",
        category: "Clothing"
      },
      {
        id: "5",
        date: "2024-06-24",
        image: "/images/workout-outfit.jpg",
        title: "Workout",
        category: "Look"
      },
      {
        id: "6",
        date: "2024-06-24",
        image: "/images/casual-outfit.jpg",
        title: "Tap to add notes",
        category: "Look"
      }
    ];

    // Filter by month and year if provided
    let filteredOutfits = mockOutfits;
    if (month && year) {
      filteredOutfits = mockOutfits.filter(outfit => {
        const outfitDate = new Date(outfit.date);
        return outfitDate.getMonth() + 1 === parseInt(month) && 
               outfitDate.getFullYear() === parseInt(year);
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredOutfits
    });

  } catch (error) {
    console.error('Calendar API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}
