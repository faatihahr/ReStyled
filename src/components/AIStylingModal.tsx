'use client';

import { useState } from 'react';

interface AIStylingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateOutfit: (occasion?: string) => void;
  isGenerating: boolean;
}

export default function AIStylingModal({ 
  isOpen, 
  onClose, 
  onGenerateOutfit, 
  isGenerating 
}: AIStylingModalProps) {
  const [occasion, setOccasion] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateOutfit(occasion.trim() || undefined);
  };

  const handleSkip = () => {
    onGenerateOutfit(undefined);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto font-merriweather">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              AI Styling Assistant
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              disabled={isGenerating}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="mb-8">
            <p className="text-gray-600 mb-4 text-lg">Mau kemana?</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Ceritakan tujuan kamu agar AI bisa memberikan rekomendasi outfit yang tepat. 
              Atau lewati jika kamu ingin outfit acak.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="Contoh: ke kampus, meeting, kencan, jalan-jalan..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aace67] focus:border-transparent outline-none transition cursor-text"
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-[#aace67] to-pink-400 text-white py-3 px-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Membuat Outfit...' : 'Buat Outfit'}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                disabled={isGenerating}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Membuat...' : 'Lewati & Acak'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-400 text-center">
            AI akan menganalisis wardrobe kamu dan membuat outfit yang cocok
          </div>
        </div>
      </div>
    </div>
  );
}
