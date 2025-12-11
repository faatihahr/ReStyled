'use client';

import React, { useState, useEffect } from 'react';
import { imageProcessingService, ProcessedImageResult } from '@/services/imageProcessingService';

interface ClothingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  processedImage: ProcessedImageResult;
  onSave: (item: any) => void;
}

export default function ClothingItemModal({ 
  isOpen, 
  onClose, 
  processedImage, 
  onSave 
}: ClothingItemModalProps) {
  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(processedImage.detectedCategory);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(processedImage.suggestedStyles);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [styleOptions, setStyleOptions] = useState<string[]>([]);

  useEffect(() => {
    // Load categories and styles
    const loadOptions = async () => {
      try {
        const cats = await imageProcessingService.getCategories();
        const styles = imageProcessingService.getStyleOptions();
        setCategories(cats);
        setStyleOptions(styles);
      } catch (error) {
        console.error('Failed to load options:', error);
        // Fallback options
        setCategories(['TOPS', 'PANTS', 'DRESS', 'SKIRTS', 'SHOES', 'BAGS', 'JEWELRY', 'HATS', 'NAILS']);
        setStyleOptions(['Casual', 'Classic', 'Chic', 'Streetwear', 'Preppy', 'Vintage Retro', 'Y2K', 'Minimalist', 'Formal', 'Bohemian']);
      }
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      alert('Please enter a name for this item');
      return;
    }

    setIsSaving(true);
    try {
      const clothingItem = {
        name: itemName.trim(),
        category: selectedCategory,
        styles: selectedStyles,
        originalImageUrl: processedImage.processedImage, // For now using processed as original
        processedImageUrl: processedImage.processedImage
      };

      const savedItem = await imageProcessingService.saveToWardrobe(clothingItem);
      onSave(savedItem);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition z-10"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add to Wardrobe</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Preview</h3>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <img 
                  src={processedImage.processedImage} 
                  alt="Processed clothing item" 
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
              
              {/* AI Detection Info */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">AI Detection:</span> {processedImage.detectedCategory}
                  <br />
                  <span className="font-semibold">Confidence:</span> {Math.round(processedImage.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Item Details Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Item Details</h3>
              
              {/* Item Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., White Cotton Shirt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedCategory === category
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Styles (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {styleOptions.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleStyleToggle(style)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedStyles.includes(style)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save to Wardrobe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
