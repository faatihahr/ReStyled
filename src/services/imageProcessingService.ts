// Image processing service using backend APIs
// Integrates with backend for background removal and AI classification

export interface ProcessedImageResult {
  originalImage: File;
  processedImage: string; // Base64 or URL
  detectedCategory: string;
  suggestedStyles: string[];
  confidence: number;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  styles: string[];
  originalImageUrl: string;
  processedImageUrl: string;
  createdAt: Date;
}

// Style options for classification
const STYLE_OPTIONS = [
  'Casual', 'Classic', 'Chic', 'Streetwear', 'Preppy', 
  'Vintage Retro', 'Y2K', 'Minimalist', 'Formal', 'Bohemian'
];

class ImageProcessingService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const { authService } = await import('./authService');
      return await authService.getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Process uploaded image with Next.js API route
  async processImage(imageFile: File): Promise<ProcessedImageResult> {
    try {
      console.log('Processing image with Next.js API:', imageFile.name);
      
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required - no token found');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const apiUrl = '/api/process-image';
      console.log('Calling Next.js API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Image processing failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      // Convert the API response to our frontend format
      return {
        originalImage: imageFile,
        processedImage: result.result.imageUrl,
        detectedCategory: result.result.classification.category,
        suggestedStyles: result.result.classification.styles,
        confidence: result.result.classification.confidence
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Save processed clothing item to Next.js API
  async saveToWardrobe(item: Omit<ClothingItem, 'id' | 'createdAt'>): Promise<ClothingItem> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/wardrobe/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          styles: item.styles,
          originalImageUrl: item.originalImageUrl,
          processedImageUrl: item.processedImageUrl
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save API Error Response:', errorText);
        throw new Error(`Failed to save item: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Save API Response:', result);

      // Convert API response to frontend format
      return {
        id: result.item.id,
        name: result.item.name,
        category: result.item.category,
        styles: result.item.styles,
        originalImageUrl: result.item.original_image_url,
        processedImageUrl: result.item.processed_image_url,
        createdAt: new Date(result.item.created_at)
      };
    } catch (error) {
      console.error('Error saving to wardrobe:', error);
      throw new Error('Failed to save item to wardrobe');
    }
  }

  // Get all wardrobe items from Next.js API
  async getWardrobeItems(category?: string): Promise<ClothingItem[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required - no token found');
      }

      let url = '/api/wardrobe/items';
      if (category && category !== 'ALL') {
        url += `?category=${category}`;
      }

      console.log('Fetching wardrobe items from Next.js API:', url);
      console.log('Token available:', !!token);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Wardrobe API response status:', response.status);
      console.log('Wardrobe API response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Wardrobe API Error Response:', errorText);
        throw new Error(`Failed to fetch wardrobe items: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Wardrobe API Response:', result);
      
      // Convert API response to frontend format
      return result.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        styles: item.styles,
        originalImageUrl: item.original_image_url,
        processedImageUrl: item.processed_image_url,
        createdAt: new Date(item.created_at)
      }));
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      // Return empty array on error for now
      return [];
    }
  }

  // Update clothing item in Next.js API
  async updateWardrobeItem(itemId: string, updates: Partial<ClothingItem>): Promise<ClothingItem> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/wardrobe/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updates.name,
          category: updates.category,
          styles: updates.styles
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update item: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      return {
        id: result.item.id,
        name: result.item.name,
        category: result.item.category,
        styles: result.item.styles,
        originalImageUrl: result.item.original_image_url,
        processedImageUrl: result.item.processed_image_url,
        createdAt: new Date(result.item.created_at)
      };
    } catch (error) {
      console.error('Error updating wardrobe item:', error);
      throw new Error('Failed to update item');
    }
  }

  // Delete clothing item from Next.js API
  async deleteWardrobeItem(itemId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/wardrobe/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete item: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      throw new Error('Failed to delete item');
    }
  }

  // Get available style options
  getStyleOptions(): string[] {
    return STYLE_OPTIONS;
  }

  // Get available categories from Next.js API
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch('/api/wardrobe/options');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      // Ensure ACCESSORIES is present in categories for UI
      if (Array.isArray(result.categories) && !result.categories.includes('ACCESSORIES')) {
        result.categories.push('ACCESSORIES');
      }
      return result.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories (include ACCESSORIES)
      return ['TOPS', 'PANTS', 'DRESS', 'SKIRTS', 'SHOES', 'BAGS', 'JEWELRY', 'HATS', 'NAILS', 'ACCESSORIES'];
    }
  }
}

export const imageProcessingService = new ImageProcessingService();
