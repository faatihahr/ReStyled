'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { preferencesService } from '@/services/preferencesService';
import QuestionnaireModal from '@/components/QuestionnaireModal';


export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [activeNav, setActiveNav] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Load outfits from localStorage only (temporary fix for 401 error)
  const loadOutfits = useCallback(() => {
    try {
      const localOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
      console.log('Loaded outfits from localStorage:', localOutfits.length);
      setSavedOutfits(localOutfits);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setSavedOutfits([]);
    }
  }, []);

  useEffect(() => {
    // Refresh outfits when window gets focus (user navigates back from manual page)
    const handleFocus = () => {
      console.log('Window focused, reloading outfits...');
      loadOutfits();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadOutfits]);

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
      } catch (error) {
        console.error('Failed to fetch user:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    loadOutfits();
    
    // Add event listener for storage changes (when manual page saves)
    const handleStorageChange = () => {
      console.log('Storage changed, reloading outfits...');
      loadOutfits();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
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

  // Filter outfits for selected date or show all if no date selected
  const filteredOutfits = selectedDate 
    ? savedOutfits.filter(outfit => {
        const outfitDate = new Date(outfit.date).toDateString();
        const selected = selectedDate.toDateString();
        return outfitDate === selected;
      })
    : savedOutfits;

  const handleWearToday = (outfitId: string) => {
    const updatedOutfits = savedOutfits.map(outfit => {
      if (outfit.id === outfitId) {
        return {
          ...outfit,
          date: new Date().toISOString(),
          name: `Outfit ${new Date().toLocaleDateString()}`
        };
      }
      return outfit;
    });
    
    setSavedOutfits(updatedOutfits);
    localStorage.setItem('savedOutfits', JSON.stringify(updatedOutfits));
    
    // Select today's date to show the moved outfit
    setSelectedDate(new Date());
  };

  const handleEditOutfit = (outfit: any, event?: React.MouseEvent) => {
    console.log('Edit button clicked for outfit:', outfit.name);
    event?.stopPropagation();
    // Store the outfit to be edited in localStorage for the manual page to pick up
    localStorage.setItem('editingOutfit', JSON.stringify(outfit));
    router.push('/dashboard/manual');
  };

  const handleDeleteOutfit = async (outfitId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    try {
      console.log('Attempting to delete outfit:', outfitId);
      
      // Get auth token asynchronously
      const token = await authService.getToken();
      console.log('Token retrieved:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.error('No auth token available');
        // Fallback to localStorage only
        const updatedOutfits = savedOutfits.filter(outfit => outfit.id !== outfitId);
        setSavedOutfits(updatedOutfits);
        localStorage.setItem('savedOutfits', JSON.stringify(updatedOutfits));
        setActiveDropdown(null);
        return;
      }

      console.log('Making DELETE request to /api/outfits');
      // Call API to delete from database
      const response = await fetch('/api/outfits', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: outfitId })
      });

      console.log('DELETE response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('DELETE response data:', responseData);

      // Remove from localStorage as well
      const updatedOutfits = savedOutfits.filter(outfit => outfit.id !== outfitId);
      setSavedOutfits(updatedOutfits);
      localStorage.setItem('savedOutfits', JSON.stringify(updatedOutfits));
      setActiveDropdown(null);
      console.log('Outfit deleted successfully');
    } catch (error) {
      console.error('Error deleting outfit from database:', error);
      console.error('Full error details:', error instanceof Error ? error.message : error);
      // Fallback to localStorage if API fails
      const updatedOutfits = savedOutfits.filter(outfit => outfit.id !== outfitId);
      setSavedOutfits(updatedOutfits);
      localStorage.setItem('savedOutfits', JSON.stringify(updatedOutfits));
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (outfitId: string) => {
    setActiveDropdown(activeDropdown === outfitId ? null : outfitId);
  };

  const handleNavigation = (section: string) => {
    setActiveNav(section);
    switch (section) {
      case 'wardrobe':
        router.push('/dashboard/wardrobe');
        break;
      case 'ai':
        // For now, stay on calendar as AI section isn't implemented yet
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

          {/* Calendar Icon - Active */}
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
          <button 
            onClick={handleLogout}
            className="p-3 rounded-lg hover:bg-red-100 transition cursor-pointer mt-auto"
          >
            <img 
              src="/images/icons/logout.png" 
              alt="Logout" 
              className="w-8 h-8"
              style={{ filter: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }}
            />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-20">
          
          {/* Calendar Content */}
          <div className="p-4 lg:p-8">
            {/* Calendar Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="text-2xl font-bold text-gray-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button 
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 rounded-md transition ${
                      viewMode === 'month' ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 rounded-md transition ${
                      viewMode === 'week' ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-4 py-2 rounded-md transition ${
                      viewMode === 'day' ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    Day
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              {viewMode === 'month' && (
                <div className="grid grid-cols-7 gap-1">
                  {/* Week day headers */}
                  {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {getDaysInMonth(currentDate).map((date, index) => (
                    <div
                      key={index}
                      onClick={() => date && handleDateClick(date)}
                      className={`aspect-square border rounded-lg p-2 cursor-pointer transition ${
                        date 
                          ? 'hover:bg-gray-50' 
                          : ''
                      } ${
                        selectedDate && date && 
                        date.toDateString() === selectedDate.toDateString()
                          ? 'bg-green-100 border-green-500'
                          : 'border-gray-200'
                      } ${
                        date && date.toDateString() === new Date().toDateString()
                          ? 'bg-blue-50 border-blue-300'
                          : ''
                      }`}
                    >
                      {date && (
                        <>
                          <div className="text-sm font-medium">
                            {date.getDate()}
                          </div>
                          {/* Show outfit image if exists for this date */}
                          {(() => {
                            const dateOutfits = savedOutfits.filter(outfit => {
                              const outfitDate = new Date(outfit.date).toDateString();
                              return outfitDate === date.toDateString();
                            });
                            
                            if (dateOutfits.length > 0 && (dateOutfits[0].canvasImage || dateOutfits[0].canvas_image)) {
                              return (
                                <img 
                                  src={dateOutfits[0].canvasImage || dateOutfits[0].canvas_image} 
                                  alt="Outfit"
                                  className="w-full h-28 object-contain rounded mt-1"
                                />
                              );
                            }
                            return null;
                          })()}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'week' && (
                <div className="text-center py-12 text-gray-500">
                  Week view coming soon...
                </div>
              )}

              {viewMode === 'day' && (
                <div className="text-center py-12 text-gray-500">
                  Day view coming soon...
                </div>
              )}
            </div>

            {/* Saved Outfits Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              
              <h3 className="text-lg font-semibold mb-4">Saved Outfits</h3>
              {savedOutfits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No saved outfits yet</p>
                  <button 
                    onClick={() => router.push('/dashboard/manual')}
                    className="px-6 py-3 bg-gradient-to-r from-[#aace67] to-pink-400 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Create Your First Outfit
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOutfits.map((outfit) => (
                    <div key={outfit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition relative">
                      {/* Three-dot menu */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => toggleDropdown(outfit.id)}
                          className="p-1 rounded hover:bg-gray-100 transition"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                          </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        {activeDropdown === outfit.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={(e) => {
                                e?.stopPropagation();
                                console.log('EDIT CLICKED - Inline function');
                                localStorage.setItem('editingOutfit', JSON.stringify(outfit));
                                router.push('/dashboard/manual');
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition rounded-t-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e?.stopPropagation();
                                console.log('DELETE CLICKED - Inline function');
                                
                                // Try database delete first, then update localStorage
                                const deleteOutfit = async () => {
                                  try {
                                    const token = authService.getToken();
                                    if (token) {
                                      const response = await fetch('/api/outfits', {
                                        method: 'DELETE',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ id: outfit.id })
                                      });
                                      
                                      if (response.ok) {
                                        console.log('Deleted from database successfully');
                                      }
                                    }
                                  } catch (error) {
                                    console.log('Database delete failed, using localStorage only');
                                  }
                                  
                                  // Always update localStorage and UI
                                  const updatedOutfits = savedOutfits.filter(o => o.id !== outfit.id);
                                  setSavedOutfits(updatedOutfits);
                                  localStorage.setItem('savedOutfits', JSON.stringify(updatedOutfits));
                                  setActiveDropdown(null);
                                  console.log('Outfit deleted from localStorage and calendar');
                                };
                                
                                deleteOutfit();
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition text-red-600 rounded-b-lg"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-800 mb-2">{outfit.name}</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        {new Date(outfit.date).toLocaleDateString()}
                      </p>
                      <div className="mb-3">
                        {outfit.canvasImage || outfit.canvas_image ? (
                          <img 
                            src={outfit.canvasImage || outfit.canvas_image} 
                            alt={outfit.name}
                            className="w-full h-48 object-contain bg-gray-50 rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">No canvas image available</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleWearToday(outfit.id)}
                          className="flex-1 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
                        >
                          Wear Today
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No outfits planned for this date</p>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-[#aace67] to-pink-400 text-white rounded-lg font-semibold hover:shadow-lg transition">
                    Plan Outfit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
            <div className="flex justify-around items-center py-2">
              {/* Calendar Icon */}
              <button 
                onClick={() => handleNavigation('calendar')}
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
                onClick={() => handleNavigation('ai')}
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
                onClick={() => handleNavigation('manual')}
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
                onClick={() => handleNavigation('wardrobe')}
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
      </div>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onSubmit={handleQuestionnaireSubmit}
        onSkip={handleQuestionnaireSkip}
      />
    </div>
  );
}
