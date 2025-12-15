'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Shuffle, Heart, Share2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { preferencesService } from '@/services/preferencesService';
import { imageProcessingService } from '@/services/imageProcessingService';
import { supabase } from '@/services/authService';
import QuestionnaireModal from '@/components/QuestionnaireModal';
import OutfitCanvasModal from '@/components/OutfitCanvasModal';
import AIStylingModal from '@/components/AIStylingModal';
import OutfitDisplayModal from '@/components/OutfitDisplayModal';

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

interface SelectedItems {
  outerwear?: WardrobeItem;
  tops?: WardrobeItem;
  bottoms?: WardrobeItem;
  dresses?: WardrobeItem;
  shoes?: WardrobeItem;
}

// Mock wardrobe items data
const mockWardrobeItems: WardrobeItem[] = [
  { id: '1', name: 'Black Ruched Top', category: 'TOPS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '2', name: 'Red V-neck Top', category: 'TOPS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '3', name: 'Light Purple Ribbed Top', category: 'TOPS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '4', name: 'Light Green Mini Skirt', category: 'SKIRTS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '5', name: 'Blue Patchwork Jeans', category: 'PANTS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '6', name: 'Pink Wide-leg Trousers', category: 'PANTS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '7', name: 'Olive Green Chelsea Boots', category: 'SHOES', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '8', name: 'Black Chunky Sneakers', category: 'SHOES', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '9', name: 'Light Green Ankle Boots', category: 'SHOES', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '10', name: 'Brown Handbag', category: 'BAGS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '11', name: 'Colorful Nails', category: 'NAILS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '12', name: 'Pearl Bracelet', category: 'JEWELRY', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '13', name: 'Summer Hat', category: 'HATS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '14', name: 'Diamond Ring', category: 'JEWELRY', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '15', name: 'White Dress', category: 'DRESS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '16', name: 'Black Leather Jacket', category: 'OUTERWEAR', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
];

export default function ManualStylingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [activeNav, setActiveNav] = useState('manual');
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
  const [sliderMode, setSliderMode] = useState<2 | 3 | 4>(3);
  const [showCanvas, setShowCanvas] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<WardrobeItem[]>([]);
  const [currentIndexes, setCurrentIndexes] = useState({
    tops: 0,
    bottoms: 0,
    shoes: 0,
    outerwear: 0,
    dresses: 0
  });
  const [favorites, setFavorites] = useState(new Set());
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<any>(null);
  
  // AI Styling states
  const [showAIStylingModal, setShowAIStylingModal] = useState(false);
  const [showOutfitDisplayModal, setShowOutfitDisplayModal] = useState(false);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [recommendedOutfits, setRecommendedOutfits] = useState<any[]>([]);
  const [currentOccasion, setCurrentOccasion] = useState<string>();

  useEffect(() => {
    const fetchUser = async () => {
      const token = authService.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        if (userData) {
          const hasPreferences = localStorage.getItem(`user_preferences_${userData.id}`);
          if (!hasPreferences) {
            setShowQuestionnaire(true);
          }
        }

        try {
          const items = await imageProcessingService.getWardrobeItems();
          const wardrobeData = items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            imageUrl: item.processedImageUrl
          }));
          setWardrobeItems(wardrobeData);
          
          // Initialize selectedItems with first available items
          const initialSelected: SelectedItems = {};
          const categories = ['tops', 'bottoms', 'shoes', 'outerwear', 'dresses'];
          categories.forEach(category => {
            const categoryItems = wardrobeData.filter(item => 
              item.category.toLowerCase() === category.toLowerCase()
            );
            if (categoryItems.length > 0) {
              initialSelected[category as keyof SelectedItems] = categoryItems[0];
            }
          });
          setSelectedItems(initialSelected);
        } catch (error) {
          console.error('Failed to fetch wardrobe items:', error);
          setWardrobeItems([]);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        authService.removeToken();
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Check if we're editing an existing outfit
    const editingOutfitData = localStorage.getItem('editingOutfit');
    if (editingOutfitData) {
      try {
        const outfit = JSON.parse(editingOutfitData);
        setEditingOutfit(outfit);
        setIsEditingMode(true);
        
        // Load the outfit items into the selected state
        if (outfit.items && outfit.items.length > 0) {
          const newSelectedItems: SelectedItems = {};
          const newIndexes: any = {};
          
          outfit.items.forEach((item: any) => {
            const category = item.category?.toLowerCase();
            if (category && wardrobeItems.some(wi => wi.id === item.id)) {
              newSelectedItems[category as keyof SelectedItems] = item;
              // Find the index of this item in the wardrobe items
              const categoryItems = wardrobeItems.filter(wi => wi.category.toLowerCase() === category);
              const itemIndex = categoryItems.findIndex(wi => wi.id === item.id);
              newIndexes[category] = itemIndex >= 0 ? itemIndex : 0;
            }
          });
          
          setSelectedItems(newSelectedItems);
          setCurrentIndexes(prev => ({ ...prev, ...newIndexes }));
          
          // Set slider mode based on outfit composition
          if (outfit.items.some((item: any) => item.category?.toLowerCase() === 'dresses')) {
            setSliderMode(2);
          } else if (outfit.items.some((item: any) => item.category?.toLowerCase() === 'outerwear')) {
            setSliderMode(4);
          } else {
            setSliderMode(3);
          }
        }
        
        // Clear the editing outfit from localStorage
        localStorage.removeItem('editingOutfit');
      } catch (error) {
        console.error('Error parsing editing outfit:', error);
        localStorage.removeItem('editingOutfit');
      }
    }
  }, []);

  const handleLogout = () => {
    authService.removeToken();
    window.location.href = '/login';
  };

  const handleQuestionnaireSubmit = async (preferences: any) => {
    try {
      await preferencesService.saveUserPreferences(preferences);
      setShowQuestionnaire(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleQuestionnaireSkip = () => {
    setShowQuestionnaire(false);
  };

  // AI Styling handler
  const handleAIStyling = async (occasion?: string) => {
    setIsGeneratingOutfit(true);
    setShowAIStylingModal(false);
    setCurrentOccasion(occasion);
    setShowOutfitDisplayModal(true); // Open modal immediately with loading state
    
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/ai-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ occasion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate outfit');
      }

      const result = await response.json();
      console.log('AI styling result:', result);
      
      setRecommendedOutfits(result.outfits || []);
      
    } catch (error) {
      console.error('Error generating outfit:', error);
      alert('Failed to generate outfit. Please try again.');
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  const handleNavigation = (section: string) => {
    setActiveNav(section);
    switch (section) {
      case 'wardrobe':
        router.push('/dashboard/wardrobe');
        break;
      case 'ai':
        setShowAIStylingModal(true);
        break;
      case 'manual':
        router.push('/dashboard/manual');
        break;
      case 'calendar':
        router.push('/dashboard/calendar');
        break;
      default:
        break;
    }
  };

  const getItemsByCategory = (category: string) => {
    console.log(`Getting items for category: ${category}`);
    console.log('All wardrobe items:', wardrobeItems.map(item => ({ id: item.id, name: item.name, category: item.category })));
    
    let items: WardrobeItem[] = [];
    
    // Handle dresses category - include dress variations
    if (category.toLowerCase() === 'dresses') {
      items = wardrobeItems.filter(item => 
        item.category.toLowerCase() === 'dress' ||
        item.category.toLowerCase() === 'dresses'
      );
      console.log(`Found ${items.length} items for dresses:`, items);
    }
    // Handle bottoms category - include skirts and pants variations
    else if (category.toLowerCase() === 'bottoms') {
      items = wardrobeItems.filter(item => 
        item.category.toLowerCase() === 'skirts' ||
        item.category.toLowerCase() === 'skirt' ||
        item.category.toLowerCase() === 'pants' ||
        item.category.toLowerCase() === 'pant'
      );
      console.log(`Found ${items.length} items for bottoms (including skirts/pants):`, items);
    } else {
      // Regular category lookup with case-insensitive fallback
      items = wardrobeItems.filter(item => item.category === category);
      console.log(`Found ${items.length} items for ${category}:`, items);
      
      if (items.length === 0) {
        const lowercaseItems = wardrobeItems.filter(item => item.category === category.toLowerCase());
        console.log(`Found ${lowercaseItems.length} items for ${category.toLowerCase()}:`, lowercaseItems);
        items = lowercaseItems;
      }
    }
    
    return items;
  };

  const handleSlide = (category: string, direction: 'next' | 'prev') => {
    const items = getItemsByCategory(category.toUpperCase());
    if (items.length === 0) return;
    
    setCurrentIndexes(prev => {
      const currentIndex = prev[category as keyof typeof prev];
      let newIndex;
      
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % items.length;
      } else {
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      }
      
      // Update selectedItems with the new item
      setSelectedItems(selected => ({
        ...selected,
        [category.toLowerCase()]: items[newIndex]
      }));
      
      return { ...prev, [category]: newIndex };
    });
  };

  const shuffleOutfit = () => {
    const categories = ['tops', 'bottoms', 'shoes'];
    if (sliderMode === 4) categories.unshift('outerwear');
    if (sliderMode === 2) {
      categories.length = 0;
      categories.push('dresses', 'shoes');
    }
    
    console.log('Shuffle categories for mode', sliderMode, ':', categories);
    
    const newIndexes: any = {};
    categories.forEach(category => {
      const items = getItemsByCategory(category.toUpperCase());
      console.log(`Items for ${category}:`, items.length, items);
      newIndexes[category] = items.length > 0 ? Math.floor(Math.random() * items.length) : 0;
    });
    
    setCurrentIndexes(prev => ({ ...prev, ...newIndexes }));
    
    categories.forEach(category => {
      const items = getItemsByCategory(category.toUpperCase());
      if (items.length > 0) {
        setSelectedItems(prev => ({
          ...prev,
          [category]: items[newIndexes[category]]
        }));
      }
    });
  };

  const getOutfitId = () => {
    return `${currentIndexes.tops}-${currentIndexes.bottoms}-${currentIndexes.shoes}-${currentIndexes.outerwear}-${currentIndexes.dresses}`;
  };

  const toggleFavorite = () => {
    const outfitId = getOutfitId();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(outfitId)) {
        newFavorites.delete(outfitId);
      } else {
        newFavorites.add(outfitId);
      }
      return newFavorites;
    });
  };

  const isFavorite = favorites.has(getOutfitId());

  const handleSaveOutfit = () => {
    setShowCanvas(true);
  };

  const handleFinalSave = async (outfitData: any) => {
    console.log('handleFinalSave called with outfitData:', outfitData);
    
    if (!outfitData) {
      console.error('No outfit data to save');
      return;
    }
    
    console.log('Saving outfit with canvas image:', outfitData.canvasImage ? 'Yes' : 'No');
    
    try {
      if (isEditingMode && editingOutfit) {
        // Update existing outfit
        const token = await authService.getToken();
        
        if (token) {
          // Try to update via API first
          const updateData = {
            id: editingOutfit.id,
            name: outfitData.name || editingOutfit.name,
            description: outfitData.description || `Outfit updated on ${new Date().toLocaleDateString()}`,
            clothing_item_ids: outfitData.items.map((item: any) => item.id).filter(Boolean),
            occasion: 'casual',
            season: 'all'
          };

          console.log('Sending PUT request with data:', updateData);
          console.log('Editing outfit ID:', editingOutfit.id);
          console.log('Outfit data items:', outfitData.items);

          const response = await fetch('/api/outfits', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });

          console.log('PUT response status:', response.status);
          
          if (response.ok) {
            const responseData = await response.json();
            console.log('PUT response data:', responseData);
            console.log('PUT request successful');
            
            // Check if this was a local outfit update
            if (responseData.message && responseData.message.includes('Local outfit')) {
              console.log('Local outfit detected - updating localStorage only');
              
              // For local outfits, update localStorage
              const updatedOutfit = {
                ...editingOutfit,
                ...outfitData,
                date: new Date().toISOString(),
                canvasImage: outfitData.canvasImage
              };
              
              const existingOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
              const outfitIndex = existingOutfits.findIndex((outfit: any) => outfit.id === editingOutfit.id);
              
              if (outfitIndex >= 0) {
                existingOutfits[outfitIndex] = updatedOutfit;
                localStorage.setItem('savedOutfits', JSON.stringify(existingOutfits));
              }
            } else {
              console.log('Database outfit updated - no localStorage save needed');
            }
            
            setShowCanvas(false);
            router.push('/dashboard/calendar');
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('PUT request failed:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
        }

        // Fallback to localStorage only if API fails or no token
        const updatedOutfit = {
          ...editingOutfit,
          ...outfitData,
          date: new Date().toISOString(),
          name: outfitData.name || editingOutfit.name
        };
        
        const existingOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
        const outfitIndex = existingOutfits.findIndex((outfit: any) => outfit.id === editingOutfit.id);
        
        if (outfitIndex >= 0) {
          existingOutfits[outfitIndex] = updatedOutfit;
          localStorage.setItem('savedOutfits', JSON.stringify(existingOutfits));
        }
        
        setShowCanvas(false);
        router.push('/dashboard/calendar');
        return;
      }
      
      // Get auth token for new outfits
      const token = await authService.getToken();
      console.log('Token:', token);
      
      if (!token) {
        console.error('No auth token available');
        // Try to get current user session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);
        
        if (!session) {
          console.error('No active session found');
          return;
        }
        
        // Use session token
        const sessionToken = session.access_token;
        console.log('Session token:', sessionToken);
        
        if (!sessionToken) {
          console.error('No session token available');
          return;
        }
        
        // Prepare outfit data for API
        const clothingItemIds = outfitData.items.map((item: any) => item.id).filter(Boolean);
        
        // Save to localStorage only (testing approach)
        console.log('Saving outfit to localStorage for testing adverts...');
        
 const savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
        const newOutfit = {
          id: `outfit_${Date.now()}`, // Generate unique ID
          name: outfitData.name,
          description: outfitData.description || '',
          canvasImage: outfitData.canvasImage,
          clothing_item_ids: outfitData.items.map((item: any) => item.id).filter(Boolean),
          occasion: outfitData.occasion || 'casual',
          season: outfitData.season || 'all',
          user_id: user?.id || 'test_user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        savedOutfits.push(newOutfit);
        localStorage.setItem('savedOutfits', JSON.stringify(savedOutfits));
        console.log('Outfit saved to localStorage for testing:', newOutfit);
        
        setShowCanvas(false);
        router.push('/dashboard/calendar');
        return;
      }

      // Save to localStorage only (testing approach)
      console.log('Saving outfit to localStorage for testing...');
      
      const savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
      const newOutfit = {
        id: `outfit_${Date.now()}`,
        name: outfitData.name,
        description: outfitData.description || '',
        canvasImage: outfitData.canvasImage,
        clothing_item_ids: outfitData.items.map((item: any) => item.id).filter(Boolean),
        occasion: outfitData.occasion || 'casual',
        season: outfitData.season || 'all',
        user_id: user?.id || 'test_user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      savedOutfits.push(newOutfit);
      localStorage.setItem('savedOutfits', JSON.stringify(savedOutfits));
      console.log('Outfit saved to localStorage:', newOutfit);
      
      setShowCanvas(false);
      router.push('/dashboard/calendar');
      return;
    } catch (error) {
      console.error('Error saving outfit to database:', error);
      
      // Fallback to localStorage if database save fails
      try {
        const existingOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
        
        if (isEditingMode && editingOutfit) {
          // Update existing outfit
          const outfitIndex = existingOutfits.findIndex((outfit: any) => outfit.id === editingOutfit.id);
          if (outfitIndex >= 0) {
            existingOutfits[outfitIndex] = {
              ...editingOutfit,
              ...outfitData,
              date: new Date().toISOString()
            };
          }
        } else {
          // Add new outfit
          existingOutfits.push(outfitData);
        }
        
        localStorage.setItem('savedOutfits', JSON.stringify(existingOutfits));
      } catch (localStorageError) {
        console.error('Error saving outfit to localStorage:', localStorageError);
      }
    }
  };

  const getCurrentOutfitItems = () => {
    const items = [];
    
    // Add selected clothing items based on slider mode
    if (sliderMode === 2) {
      if (selectedItems.dresses) items.push({
        ...selectedItems.dresses,
        position: { x: 50, y: 50 },
        size: { width: 120, height: 120 }
      });
      if (selectedItems.shoes) items.push({
        ...selectedItems.shoes,
        position: { x: 200, y: 50 },
        size: { width: 120, height: 120 }
      });
    } else if (sliderMode === 3) {
      if (selectedItems.tops) items.push({
        ...selectedItems.tops,
        position: { x: 50, y: 50 },
        size: { width: 120, height: 120 }
      });
      if (selectedItems.bottoms) items.push({
        ...selectedItems.bottoms,
        position: { x: 200, y: 50 },
        size: { width: 120, height: 120 }
      });
      if (selectedItems.shoes) items.push({
        ...selectedItems.shoes,
        position: { x: 350, y: 50 },
        size: { width: 120, height: 120 }
      });
    } else if (sliderMode === 4) {
      if (selectedItems.outerwear) items.push({
        ...selectedItems.outerwear,
        position: { x: 50, y: 50 },
        size: { width: 120, height: 120 }
      });
      if (selectedItems.tops) items.push({
        ...selectedItems.tops,
        position: { x: 200, y: 50 },
        size: { width: 120, height: 120 }
      });
      if (selectedItems.bottoms) items.push({
        ...selectedItems.bottoms,
        position: { x: 350, y: 50 },
        size: { width: 120, height: 120 }
      });
      if (selectedItems.shoes) items.push({
        ...selectedItems.shoes,
        position: { x: 500, y: 50 },
        size: { width: 120, height: 120 }
      });
    }
    
    return items.filter(Boolean);
  };

  const SliderItem = ({ category, label }: { category: string; label: string }) => {
    const items = getItemsByCategory(category.toUpperCase());
    const currentIndex = currentIndexes[category as keyof typeof currentIndexes];
    const currentItem = items[currentIndex];

    console.log(`SliderItem - Category: ${category}, Items: ${items.length}, CurrentIndex: ${currentIndex}`);

    if (!items.length) {
      console.log(`No items found for category: ${category}`);
      return (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</h3>
            <span className="text-xs text-gray-500">0 items</span>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6 text-center">
            <p className="text-gray-500">No {label.toLowerCase()} available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</h3>
          <span className="text-xs text-gray-500">{currentIndex + 1}/{items.length}</span>
        </div>
        
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => handleSlide(category, 'prev')}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all active:scale-95 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 shadow-md">
                <img src={currentItem.imageUrl} alt={currentItem.name} className="max-w-full max-h-full object-contain mx-auto my-auto" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{currentItem.name}</p>
                <p className="text-xs text-gray-500 mt-1">Tap arrows to change</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSlide(category, 'next')}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all active:scale-95 z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#aace67] via-pink-100 to-[#ffa4a4] flex items-center justify-center" style={{ fontFamily: 'Merriweather, serif' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#aace67] via-pink-100 to-[#ffa4a4]" style={{ fontFamily: 'Merriweather, serif' }}>
      <div className="flex flex-col lg:flex-row">
        {/* Left Navigation Bar - Desktop Only */}
        <div className="hidden lg:flex lg:w-20 bg-white shadow-lg lg:flex-col lg:items-center lg:py-8 lg:space-y-8 lg:h-screen lg:fixed lg:left-0 lg:top-0">
          {/* AI Styling Button */}
          <div className="relative">
            <button 
              onClick={() => handleNavigation('ai')}
              className={`p-4 rounded-full transition relative cursor-pointer shadow-lg ${
                activeNav === 'ai' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-[#aace67] to-pink-400 hover:shadow-xl'
              }`}
            >
              <img 
                src="/images/icons/ai.png" 
                alt="AI Styling" 
                className="w-8 h-8"
              />
            </button>
            {activeNav === 'ai' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full"></div>
            )}
          </div>
          
          {/* Manual Styling Hanger - Active */}
          <div className="relative">
            <button 
              onClick={() => handleNavigation('manual')}
              className={`p-3 rounded-lg transition relative cursor-pointer ${
                activeNav === 'manual' ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <img 
                src="/images/icons/hanger.png" 
                alt="Manual Styling" 
                className={`w-8 h-8 ${activeNav === 'manual' ? 'filter brightness-0 saturate-100' : ''}`}
                style={{ filter: activeNav === 'manual' ? 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' : '' }}
              />
            </button>
            {activeNav === 'manual' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full"></div>
            )}
          </div>
          
          {/* Wardrobe Icon */}
          <div className="relative">
            <button 
              onClick={() => handleNavigation('wardrobe')}
              className={`p-3 rounded-lg transition relative cursor-pointer ${
                activeNav === 'wardrobe' ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <img 
                src="/images/icons/closet.png" 
                alt="Wardrobe" 
                className={`w-8 h-8 ${activeNav === 'wardrobe' ? 'filter brightness-0 saturate-100' : ''}`}
                style={{ filter: activeNav === 'wardrobe' ? 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' : '' }}
              />
            </button>
            {activeNav === 'wardrobe' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full"></div>
            )}
          </div>
          
          {/* Calendar Icon */}
          <div className="relative">
            <button 
              onClick={() => handleNavigation('calendar')}
              className={`p-3 rounded-lg transition relative cursor-pointer ${
                activeNav === 'calendar' ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <img 
                src="/images/icons/calendar.png" 
                alt="Calendar" 
                className={`w-8 h-8 ${activeNav === 'calendar' ? 'filter brightness-0 saturate-100' : ''}`}
                style={{ filter: activeNav === 'calendar' ? 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' : '' }}
              />
            </button>
            {activeNav === 'calendar' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full"></div>
            )}
          </div>

          {/* Logout Button */}
          <div className="relative mt-auto">
            <button 
              onClick={handleLogout}
              className="p-3 rounded-lg transition relative cursor-pointer hover:bg-gray-100"
            >
              <img 
                src="/images/icons/logout.png" 
                alt="Logout" 
                className="w-8 h-8"
                style={{ filter: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }}
              />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex lg:ml-20">
          <div className="flex-1 p-4 lg:p-8">
            {/* Manual Styling Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {isEditingMode ? 'Edit Outfit' : 'Manual Outfit Styling'}
              </h1>
              <p className="text-white/80 text-sm">
                {isEditingMode ? 'Modify your perfect look' : 'Mix & match your perfect look'}
              </p>
              
              {/* Slider Mode Selection */}
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setSliderMode(2)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    sliderMode === 2
                      ? 'bg-white text-green-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  2 Items
                </button>
                <button
                  onClick={() => setSliderMode(3)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    sliderMode === 3
                      ? 'bg-white text-green-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  3 Items
                </button>
                <button
                  onClick={() => setSliderMode(4)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    sliderMode === 4
                      ? 'bg-white text-green-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  4 Items
                </button>
              </div>
            </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            {wardrobeItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No items in your wardrobe yet</p>
                <button 
                  onClick={() => router.push('/dashboard/wardrobe')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  Add Items to Wardrobe
                </button>
              </div>
            ) : (
              <>
                {sliderMode === 2 && (
                  <>
                    <SliderItem category="dresses" label="Dresses/One-sets" />
                    <SliderItem category="shoes" label="Shoes" />
                  </>
                )}
                
                {sliderMode === 3 && (
                  <>
                    <SliderItem category="tops" label="Tops" />
                    <SliderItem category="bottoms" label="Bottoms" />
                    <SliderItem category="shoes" label="Shoes" />
                  </>
                )}
                
                {sliderMode === 4 && (
                  <>
                    <SliderItem category="outerwear" label="Outerwear" />
                    <SliderItem category="tops" label="Tops" />
                    <SliderItem category="bottoms" label="Bottoms" />
                    <SliderItem category="shoes" label="Shoes" />
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 justify-center mt-8">
            <button
              onClick={shuffleOutfit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#aace67] to-pink-400 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              <Shuffle className="w-5 h-5" />
              Shuffle
            </button>
            
            <button
              onClick={handleSaveOutfit}
              className={`p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleSaveOutfit}
              className="p-3 rounded-full bg-white text-gray-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {favorites.size > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                💜 {favorites.size} outfit{favorites.size !== 1 ? 's' : ''} saved
              </p>
            </div>
          )}
        </div>
      </div>

      {showQuestionnaire && (
        <QuestionnaireModal
          isOpen={showQuestionnaire}
          onSubmit={handleQuestionnaireSubmit}
          onSkip={handleQuestionnaireSkip}
          onClose={() => setShowQuestionnaire(false)}
        />
      )}

      {showCanvas && (
        <OutfitCanvasModal
          isOpen={showCanvas}
          onClose={() => setShowCanvas(false)}
          currentOutfit={getCurrentOutfitItems()}
          wardrobeItems={wardrobeItems}
          onSave={handleFinalSave}
          editingOutfit={editingOutfit}
          isEditingMode={isEditingMode}
        />
      )}

      {/* AI Styling Modal */}
      <AIStylingModal
        isOpen={showAIStylingModal}
        onClose={() => setShowAIStylingModal(false)}
        onGenerateOutfit={handleAIStyling}
        isGenerating={isGeneratingOutfit}
      />

      {/* Outfit Display Modal */}
      <OutfitDisplayModal
        isOpen={showOutfitDisplayModal}
        onClose={() => setShowOutfitDisplayModal(false)}
        outfits={recommendedOutfits}
        occasion={currentOccasion}
        isLoading={isGeneratingOutfit}
      />
      </div>
    </div>
  );
}
