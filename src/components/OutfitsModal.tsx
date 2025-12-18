'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface Outfit {
  id: string;
  name: string;
  description: string;
  canvas_image?: string;
  canvasImage?: string;
  occasion: string;
  created_at: string;
  clothing_items: any[];
}

interface OutfitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OutfitsModal({ isOpen, onClose }: OutfitsModalProps) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOutfits();
    }
  }, [isOpen]);

  const fetchOutfits = async () => {
    setLoading(true);
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/outfits', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch outfits');
      }

      const data = await response.json();
      console.log('Outfits data received:', data);
      console.log('First outfit canvas_image:', data.outfits?.[0]?.canvas_image);
      setOutfits(data.outfits || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      // Don't use mock data - let the error show so user knows there's an issue
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete outfit');
      }

      // Refresh outfits list
      fetchOutfits();
    } catch (error) {
      console.error('Error deleting outfit:', error);
      alert('Failed to delete outfit. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Outfits</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading outfits...</div>
          </div>
        ) : outfits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No outfits yet</h3>
            <p className="text-gray-500">Create your first outfit using AI styling!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                {/* Outfit Canvas Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {(outfit.canvas_image || outfit.canvasImage) ? (
                    <img 
                      src={outfit.canvasImage || outfit.canvas_image} 
                      alt={outfit.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load outfit image:', outfit.canvasImage || outfit.canvas_image);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center">
                            <div class="text-gray-400 text-center">
                              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="text-sm">Image failed to load</p>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteOutfit(outfit.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Outfit Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{outfit.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{outfit.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="capitalize">{outfit.occasion}</span>
                    <span>{new Date(outfit.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
