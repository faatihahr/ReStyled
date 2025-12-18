'use client';

import { useState } from 'react';

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  styles: string[];
  processed_image_url: string;
}

interface Outfit {
  id: string;
  name: string;
  description: string;
  items: string[];
  reasoning: string;
  itemDetails: OutfitItem[];
}

interface OutfitDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfits: Outfit[];
  occasion?: string;
  isLoading?: boolean;
  onSaveToCanvas?: (outfit: Outfit) => void;
}

export default function OutfitDisplayModal({ 
  isOpen, 
  onClose, 
  outfits, 
  occasion,
  isLoading = false,
  onSaveToCanvas
}: OutfitDisplayModalProps) {
  const [selectedOutfit, setSelectedOutfit] = useState<number>(0);

  if (!isOpen) return null;

  const currentOutfit = outfits[selectedOutfit];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 font-merriweather">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-700 font-medium">AI sedang membuat outfit...</p>
            <p className="text-gray-500 text-sm mt-2">Menganalisis wardrobe kamu</p>
          </div>
        </div>
      </div>
    );
  }

  if (!outfits || outfits.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Tidak Ada Rekomendasi</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600">
            Maaf, AI tidak bisa membuat rekomendasi outfit. Pastikan kamu memiliki cukup item di wardrobe.
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto font-merriweather">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Rekomendasi Outfit AI</h2>
            {occasion && (
              <p className="text-gray-600 mt-1">Untuk: {occasion}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Outfit Tabs */}
        {outfits.length > 1 && (
          <div className="flex space-x-2 mb-6">
            {outfits.map((outfit, index) => (
              <button
                key={outfit.id}
                onClick={() => setSelectedOutfit(index)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedOutfit === index
                    ? 'bg-gradient-to-r from-[#aace67] to-pink-400 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Outfit {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Current Outfit Display */}
        {currentOutfit && (
          <div className="space-y-6">
            {/* Outfit Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {currentOutfit.name}
              </h3>
              <p className="text-gray-600 mb-2">{currentOutfit.description}</p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>Alasan AI:</strong> {currentOutfit.reasoning}
                </p>
              </div>
            </div>

            {/* Outfit Items Grid */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Item-item dalam Outfit:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentOutfit.itemDetails.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={item.processed_image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = '/api/placeholder-image.png';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-medium text-gray-800 text-sm">{item.name}</h5>
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      {item.styles && item.styles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.styles.slice(0, 2).map((style) => (
                            <span
                              key={style}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  console.log('Simpan Outfit button clicked');
                  console.log('Current outfit:', currentOutfit);
                  console.log('onSaveToCanvas function:', onSaveToCanvas);
                  
                  if (onSaveToCanvas && currentOutfit) {
                    console.log('Calling onSaveToCanvas with:', currentOutfit);
                    onSaveToCanvas(currentOutfit);
                  } else {
                    console.log('Cannot save - missing onSaveToCanvas or currentOutfit');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-[#aace67] to-pink-400 text-white py-2 px-4 rounded-lg hover:shadow-lg transition"
              >
                Simpan Outfit
              </button>
              <button
                onClick={() => {
                  // TODO: Implement share functionality
                  console.log('Share outfit:', currentOutfit);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Bagikan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
