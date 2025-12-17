'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { preferencesService } from '@/services/preferencesService';
import { imageProcessingService } from '@/services/imageProcessingService';
import QuestionnaireModal from '@/components/QuestionnaireModal';
import UploadModal from '@/components/UploadModal';
import ClothingItemModal from '@/components/ClothingItemModal';
import AIStylingModal from '@/components/AIStylingModal';
import OutfitDisplayModal from '@/components/OutfitDisplayModal';
import OutfitCanvasModal from '@/components/OutfitCanvasModal';
import ToastNotification from '@/components/ToastNotification';

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}


// Mock wardrobe items data
const mockWardrobeItems: WardrobeItem[] = [
  { id: '1', name: 'Beige Skirt', category: 'SKIRTS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '2', name: 'White Dress', category: 'DRESS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '3', name: 'Grey Pants', category: 'PANTS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '4', name: 'White Sneakers', category: 'SHOES', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '5', name: 'Brown Handbag', category: 'BAGS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '6', name: 'Colorful Nails', category: 'NAILS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '7', name: 'Beige Headscarf', category: 'TOPS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '8', name: 'Pearl Bracelet', category: 'JEWELRY', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '9', name: 'Summer Hat', category: 'HATS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '10', name: 'Baseball Cap', category: 'HATS', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
  { id: '11', name: 'Gel Nails', category: 'NAILS', imageUrl: '/images/33b1bd8be5edab56a55a73e0091d66ae.jpg' },
  { id: '12', name: 'Diamond Ring', category: 'JEWELRY', imageUrl: '/images/1e3655e496998529b1b9b35f284c3891.jpg' },
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
    const [activeNav, setActiveNav] = useState('wardrobe');
  
  // Check if we're on the calendar page
  useEffect(() => {
    if (window.location.pathname === '/calendar') {
      setActiveNav('calendar');
    }
  }, []);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showClothingItemModal, setShowClothingItemModal] = useState(false);
  const [processedImage, setProcessedImage] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'uploading' | 'classifying' | 'removing-bg' | 'uploading-result' | null>(null);
  
  // AI Styling states
  const [showAIStylingModal, setShowAIStylingModal] = useState(false);
  const [showOutfitDisplayModal, setShowOutfitDisplayModal] = useState(false);
  const [showOutfitCanvasModal, setShowOutfitCanvasModal] = useState(false);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [recommendedOutfits, setRecommendedOutfits] = useState<any[]>([]);
  const [currentOccasion, setCurrentOccasion] = useState<string>();
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedAIOutfit, setSelectedAIOutfit] = useState<any>(null);
  
  const categories = [
    { id: 'ALL', name: 'ALL', icon: '/images/icons/hanger.png' },
    { id: 'TOPS', name: 'TOPS', icon: '/images/icons/tops.png' },
    { id: 'PANTS', name: 'PANTS', icon: '/images/icons/pants.png' },
    { id: 'SHOES', name: 'SHOES', icon: '/images/icons/shoes.png' },
    { id: 'DRESS', name: 'DRESS', icon: '/images/icons/dress.png' },
    { id: 'SKIRTS', name: 'SKIRTS', icon: '/images/icons/skirt.png' },
    { id: 'BAGS', name: 'BAGS', icon: '/images/icons/bags.png' },
    { id: 'JEWELRY', name: 'JEWELRY', icon: '/images/icons/necklace.png' },
    { id: 'HATS', name: 'HATS', icon: '/images/icons/hat.png' },
    { id: 'NAILS', name: 'NAILS', icon: '/images/icons/nail.png' },
  ];

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
        
        // Show questionnaire if user has no preferences
        if (userData) {
          const hasPreferences = localStorage.getItem(`user_preferences_${userData.id}`);
          if (!hasPreferences) {
            setShowQuestionnaire(true);
          }
        }

        // Load wardrobe items from backend
        try {
          const items = await imageProcessingService.getWardrobeItems();
          setWardrobeItems(items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            imageUrl: item.processedImageUrl
          })));

          // If no items, load mock data for demo
          if (items.length === 0) {
            setWardrobeItems(mockWardrobeItems);
          }
        } catch (error) {
          console.error('Failed to fetch wardrobe items:', error);
          // Fallback to mock data
          setWardrobeItems(mockWardrobeItems);
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
  }, []);

  // Update URL based on active navigation and selected category
  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    // Don't redirect if we're on calendar page
    if (currentPath === '/calendar') {
      return;
    }
    
    const basePath = activeNav === 'wardrobe' ? '/dashboard/wardrobe' : '/dashboard';
    
    // Build search params based on selected category
    const searchParams = new URLSearchParams();
    if (selectedCategory !== 'ALL' && activeNav === 'wardrobe') {
      searchParams.set('category', selectedCategory.toLowerCase());
    }
    
    const newSearch = searchParams.toString();
    const expectedUrl = basePath + (newSearch ? `?${newSearch}` : '');
    const currentUrl = currentPath + currentSearch;
    
    if (currentUrl !== expectedUrl) {
      router.replace(expectedUrl);
    }
  }, [activeNav, selectedCategory, router]);

  // Sync selected category from URL on mount and URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && activeNav === 'wardrobe') {
      const categoryUpper = categoryFromUrl.toUpperCase();
      const validCategory = categories.find(cat => cat.id === categoryUpper);
      if (validCategory) {
        setSelectedCategory(categoryUpper);
      }
    }
  }, [searchParams, activeNav]);

  const handleQuestionnaireSubmit = async (data: any) => {
    try {
      if (user) {
        await preferencesService.saveUserPreferences({
          user_id: user.id,
          gender: data.gender,
          style: data.style,
          height: data.height,
          weight: data.weight,
          skin_undertone: data.skinUndertone
        });
        console.log('User preferences saved:', data);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Fallback to localStorage if API fails
      if (user) {
        localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(data));
      }
    }
  };

  const handleQuestionnaireSkip = () => {
    // Mark that user has seen questionnaire but skipped
    if (user) {
      localStorage.setItem(`questionnaire_skipped_${user.id}`, 'true');
    }
  };

  const handleLogout = () => {
    authService.removeToken();
    window.location.href = '/login';
  };

  const handlePhotoCapture = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await imageProcessingService.processImage(file);
      setProcessedImage(result);
      setShowUploadModal(false);
      setShowClothingItemModal(true);
    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Failed to process photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await imageProcessingService.processImage(file);
      setProcessedImage(result);
      setShowUploadModal(false);
      setShowClothingItemModal(true);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClothingItemSave = async (savedItem: any) => {
    // Refresh wardrobe items from backend
    try {
      const items = await imageProcessingService.getWardrobeItems();
      setWardrobeItems(items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        imageUrl: item.processedImageUrl
      })));
    } catch (error) {
      console.error('Failed to refresh wardrobe items:', error);
    }
    
    setShowClothingItemModal(false);
    setProcessedImage(null);
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
      
      // Show info if response was from cache or fallback
      if (result.cached) {
        console.log('Using cached AI response');
      }
      if (result.message) {
        console.log('AI message:', result.message);
      }
      
    } catch (error) {
      console.error('Error generating outfit:', error);
      alert('Failed to generate outfit. Please try again.');
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  // Handle saving AI outfit to canvas
  const handleSaveAIOutfitToCanvas = (outfit: any) => {
    console.log('Saving AI outfit to canvas:', outfit);
    
    // Convert AI outfit items to canvas format
    const canvasItems = outfit.itemDetails.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      imageUrl: item.processed_image_url,
      position: { x: 0, y: 0 }, // Will be positioned by canvas
      size: { width: 120, height: 120 }
    }));
    
    setSelectedAIOutfit({
      ...outfit,
      canvasItems: canvasItems
    });
    
    setShowOutfitDisplayModal(false);
    setShowOutfitCanvasModal(true);
  };

  // Handle saving outfit from canvas to calendar/database
  const handleSaveOutfitFromCanvas = async (savedOutfit: any) => {
    console.log('Saving outfit from canvas:', savedOutfit);
    
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Convert canvas outfit to database format
      const clothingItemIds = savedOutfit.items.map((item: any) => item.id);
      
      const outfitData = {
        name: savedOutfit.name,
        description: selectedAIOutfit?.description || `AI-generated outfit for ${currentOccasion || 'casual'}`,
        clothing_item_ids: clothingItemIds,
        occasion: currentOccasion || 'casual',
        season: 'all',
        canvas_image: savedOutfit.canvasImage,
        ai_generated: true
      };

      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(outfitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save outfit');
      }

      const result = await response.json();
      console.log('Outfit saved successfully:', result);
      
      // Close canvas modal and reset state
      setShowOutfitCanvasModal(false);
      setSelectedAIOutfit(null);
      
      // Show success notification and redirect to calendar
      setToast({ message: 'Outfit berhasil disimpan ke kalender!', type: 'success' });
      
      // Redirect to calendar after a short delay
      setTimeout(() => {
        router.push('/dashboard/calendar');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving outfit:', error);
      setToast({ message: 'Gagal menyimpan outfit. Silakan coba lagi.', type: 'error' });
    }
  };

  
  const filteredItems = selectedCategory === 'ALL' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === selectedCategory);

  
  const navigateToNextCategory = () => {
    const currentIndex = categories.findIndex(cat => cat.id === selectedCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCategory = categories[nextIndex];
    
    setSelectedCategory(nextCategory.id);
  };

  const navigateToPreviousCategory = () => {
    const currentIndex = categories.findIndex(cat => cat.id === selectedCategory);
    const prevIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
    const prevCategory = categories[prevIndex];
    
    setSelectedCategory(prevCategory.id);
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
              onClick={() => setShowAIStylingModal(true)}
              className={`p-4 rounded-full transition relative cursor-pointer ${
                activeNav === 'ai' 
                  ? 'bg-green-500 shadow-lg' 
                  : 'bg-gradient-to-r from-[#aace67] to-pink-400 hover:shadow-lg'
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
          
          {/* Manual Styling Hanger */}
          <div className="relative">
            <button 
              onClick={() => window.location.href = '/dashboard/manual'}
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
              onClick={() => setActiveNav('wardrobe')}
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
              onClick={() => {
                console.log('Dashboard calendar clicked');
                window.location.href = '/calendar';
              }}
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
          
          {/* Logout Icon */}
          <div className="relative mt-auto">
            <button 
              onClick={handleLogout}
              className="p-3 rounded-lg transition relative cursor-pointer hover:bg-red-100 group"
            >
              <img 
                src="/images/icons/logout.png" 
                alt="Logout" 
                className="w-8 h-8 group-hover:filter group-hover:brightness-0 group-hover:saturate-100"
                style={{ filter: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }}
              />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex lg:ml-20">
          <div className="flex-1 p-4 lg:p-8">
            {/* Category Filters */}
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Filter container - no scroll needed for max 4 cards */}
                <div 
                  className="flex-1 flex justify-center"
                >
                  <div className="flex items-center space-x-2 lg:space-x-4 pb-2">
                    {categories.map((category) => (
                      <div key={category.id} id={`category-${category.id}`} className="flex flex-col items-center">
                        <button
                          onClick={() => {
                            setSelectedCategory(category.id);
                          }}
                          className={`p-2 lg:p-4 rounded-full transition flex-shrink-0 cursor-pointer ${
                            selectedCategory === category.id
                              ? 'bg-gray-800 text-white'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          <img src={category.icon} alt={category.name} className="w-4 h-4 lg:w-6 lg:h-6" />
                        </button>
                        <span className={`text-xs mt-1 font-medium ${
                          selectedCategory === category.id ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Previous category button */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={navigateToPreviousCategory}
                    className="p-2 lg:p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition flex-shrink-0 cursor-pointer"
                  >
                    <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs mt-1 font-medium text-transparent">.</span>
                </div>
                
                {/* Next category button */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={navigateToNextCategory}
                    className="p-2 lg:p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition flex-shrink-0 cursor-pointer"
                  >
                    <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="text-xs mt-1 font-medium text-transparent">.</span>
                </div>
              </div>
            </div>

            {/* Wardrobe Items Grid - Responsive without Scroll */}
            <div className="pb-20 lg:pb-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="aspect-square sm:aspect-[3/4] lg:aspect-square bg-gray-200 flex items-center justify-center p-2">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Profile and Add Button - Desktop Only */}
          <div className="hidden xl:block xl:w-80 xl:p-8 xl:flex xl:flex-col xl:items-center">
            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              {/* Outfit Collage */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex flex-col items-center">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full mb-3 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-3 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <h3 className="font-semibold text-lg">{user?.name || 'User'}</h3>
                <p className="text-gray-500 text-sm">@{user?.username || user?.email?.split('@')[0] || 'user'}</p>
              </div>
            </div>

            {/* Add New Item Button */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="w-20 h-20 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-lg cursor-pointer mb-4"
            >
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>

                      </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
          <div className="flex justify-around items-center py-2">
            {/* Calendar Icon */}
            <button 
              onClick={() => setActiveNav('calendar')}
              className={`p-3 rounded-lg transition relative cursor-pointer ${
                activeNav === 'calendar' ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <img 
                src="/images/icons/calendar.png" 
                alt="Calendar" 
                className={`w-6 h-6 ${activeNav === 'calendar' ? 'filter brightness-0 saturate-100' : ''}`}
                style={{ filter: activeNav === 'calendar' ? 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' : '' }}
              />
            </button>
            
            {/* AI Styling Button */}
            <button 
              onClick={() => setShowAIStylingModal(true)}
              className={`p-3 rounded-full transition relative cursor-pointer ${
                activeNav === 'ai' 
                  ? 'bg-green-500 shadow-lg' 
                  : 'bg-gradient-to-r from-[#aace67] to-pink-400 hover:shadow-lg'
              }`}
            >
              <img 
                src="/images/icons/ai.png" 
                alt="AI Styling" 
                className="w-6 h-6"
              />
            </button>
            
            {/* Manual Styling Hanger */}
            <button 
              onClick={() => window.location.href = '/dashboard/manual'}
              className={`p-3 rounded-lg transition relative cursor-pointer ${
                activeNav === 'manual' ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <img 
                src="/images/icons/hanger.png" 
                alt="Manual Styling" 
                className={`w-6 h-6 ${activeNav === 'manual' ? 'filter brightness-0 saturate-100' : ''}`}
                style={{ filter: activeNav === 'manual' ? 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' : '' }}
              />
            </button>
            
            {/* Wardrobe Icon */}
            <button 
              onClick={() => setActiveNav('wardrobe')}
              className={`p-3 rounded-lg transition relative cursor-pointer ${
                activeNav === 'wardrobe' ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <img 
                src="/images/icons/closet.png" 
                alt="Wardrobe" 
                className={`w-6 h-6 ${activeNav === 'wardrobe' ? 'filter brightness-0 saturate-100' : ''}`}
                style={{ filter: activeNav === 'wardrobe' ? 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' : '' }}
              />
            </button>

            {/* Mobile Add Button */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="p-3 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition shadow-lg cursor-pointer"
            >
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Profile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              {user?.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-sm">{user?.name || 'User'}</h3>
                <p className="text-gray-500 text-xs">@{user?.username || user?.email?.split('@')[0] || 'user'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
              <img 
                src="/images/icons/logout.png" 
                alt="Logout" 
                className="w-5 h-5"
                style={{ filter: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onSubmit={handleQuestionnaireSubmit}
        onSkip={handleQuestionnaireSkip}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onPhotoCapture={handlePhotoCapture}
        onFileUpload={handleFileUpload}
      />

      {/* Clothing Item Modal */}
      {processedImage && (
        <ClothingItemModal
          isOpen={showClothingItemModal}
          onClose={() => setShowClothingItemModal(false)}
          processedImage={processedImage}
          onSave={handleClothingItemSave}
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
        onSaveToCanvas={handleSaveAIOutfitToCanvas}
      />

      {/* Outfit Canvas Modal */}
      {selectedAIOutfit && (
        <OutfitCanvasModal
          isOpen={showOutfitCanvasModal}
          onClose={() => {
            setShowOutfitCanvasModal(false);
            setSelectedAIOutfit(null);
          }}
          currentOutfit={selectedAIOutfit.canvasItems || []}
          wardrobeItems={wardrobeItems}
          onSave={handleSaveOutfitFromCanvas}
        />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-700 font-medium">Processing image...</p>
              <p className="text-gray-500 text-sm mt-2">Removing background & identifying item</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
