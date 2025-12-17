/**
 * Clarifai Clothing Classifier
 * Uses Clarifai API for AI-powered clothing classification
 */

import { Model } from "clarifai-nodejs";

// Mapping Clarifai concepts to wardrobe categories
const CATEGORY_MAPPING: { [key: string]: { category: string; subcategory: string } } = {
  // Clothing items
  'shirt': { category: 'tops', subcategory: 'shirt' },
  't-shirt': { category: 'tops', subcategory: 't-shirt' },
  'blouse': { category: 'tops', subcategory: 'blouse' },
  'top': { category: 'tops', subcategory: 'top' },
  'sweater': { category: 'tops', subcategory: 'sweater' },
  'pullover': { category: 'tops', subcategory: 'sweater' },
  'hoodie': { category: 'tops', subcategory: 'hoodie' },
  'cardigan': { category: 'tops', subcategory: 'cardigan' },
  
  // Bottoms
  'pants': { category: 'bottoms', subcategory: 'pants' },
  'trousers': { category: 'bottoms', subcategory: 'trousers' },
  'jeans': { category: 'bottoms', subcategory: 'jeans' },
  'shorts': { category: 'bottoms', subcategory: 'shorts' },
  'skirt': { category: 'bottoms', subcategory: 'skirt' },
  'leggings': { category: 'bottoms', subcategory: 'leggings' },
  
  // Dresses
  'dress': { category: 'dress', subcategory: 'dress' },
  'dresses': { category: 'dress', subcategory: 'dress' },
  'gown': { category: 'dress', subcategory: 'gown' },
  'maxi dress': { category: 'dress', subcategory: 'maxi-dress' },
  'mini dress': { category: 'dress', subcategory: 'mini-dress' },
  
  // Outerwear
  'coat': { category: 'outerwear', subcategory: 'coat' },
  'jacket': { category: 'outerwear', subcategory: 'jacket' },
  'blazer': { category: 'outerwear', subcategory: 'blazer' },
  'vest': { category: 'outerwear', subcategory: 'vest' },
  
  // Shoes
  'shoes': { category: 'shoes', subcategory: 'shoes' },
  'sneakers': { category: 'shoes', subcategory: 'sneakers' },
  'boots': { category: 'shoes', subcategory: 'boots' },
  'sandals': { category: 'shoes', subcategory: 'sandals' },
  'heels': { category: 'shoes', subcategory: 'heels' },
  'flats': { category: 'shoes', subcategory: 'flats' },
  
  // Jewelry
  'necklace': { category: 'jewelry', subcategory: 'necklace' },
  'chain': { category: 'jewelry', subcategory: 'necklace' },
  'bracelet': { category: 'jewelry', subcategory: 'bracelet' },
  'earrings': { category: 'jewelry', subcategory: 'earrings' },
  'ring': { category: 'jewelry', subcategory: 'ring' },
  'jewelry': { category: 'jewelry', subcategory: 'jewelry' },
  
  // Accessories
  'bag': { category: 'accessories', subcategory: 'bag' },
  'handbag': { category: 'accessories', subcategory: 'handbag' },
  'backpack': { category: 'accessories', subcategory: 'backpack' },
  'purse': { category: 'accessories', subcategory: 'purse' },
  'wallet': { category: 'accessories', subcategory: 'wallet' },
  'hat': { category: 'accessories', subcategory: 'hat' },
  'cap': { category: 'accessories', subcategory: 'cap' },
  'scarf': { category: 'accessories', subcategory: 'scarf' },
  'belt': { category: 'accessories', subcategory: 'belt' },
  'watch': { category: 'accessories', subcategory: 'watch' },
  
  // Default fallback
  'clothing': { category: 'tops', subcategory: 'top' },
  'fashion': { category: 'tops', subcategory: 'top' }
};

export interface ClassificationResult {
  predicted_label: string;
  confidence: number;
  category: string;
  subcategory: string;
  all_predictions: Array<{
    label: string;
    confidence: number;
    category: string;
    subcategory: string;
  }>;
}

export class ClarifaiClassifier {
  private model!: Model;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const pat = process.env.CLARIFAI_PAT;
      if (!pat) {
        throw new Error('CLARIFAI_PAT not found in environment variables');
      }

      // Initialize Model for clothing detection
      this.model = new Model({
        url: "https://clarifai.com/clarifai/main/models/apparel-detection",
        authConfig: {
          pat: pat,
        },
      });

      this.isInitialized = true;
      console.log('Clarifai classifier initialized successfully');
    } catch (error) {
      console.error('Error initializing Clarifai classifier:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Classify clothing item using Clarifai API
   */
  async classifyClothing(imageBuffer: Buffer): Promise<ClassificationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      throw new Error('Failed to initialize Clarifai classifier');
    }

    try {
      console.log('Starting Clarifai classification...');

      // Make the API call using Model.predictByBytes()
      const modelPrediction = await this.model.predictByBytes({
        inputBytes: imageBuffer,
        inputType: "image"
      });

      // Process the response
      const result = this.processClarifaiResponse(modelPrediction);
      console.log('Clarifai classification result:', result);
      
      return result;

    } catch (error) {
      console.error('Clarifai classification error:', error);
      
      // Fallback result
      return {
        predicted_label: 'clothing',
        confidence: 0.5,
        category: 'tops',
        subcategory: 'top',
        all_predictions: [{
          label: 'clothing',
          confidence: 0.5,
          category: 'tops',
          subcategory: 'top'
        }]
      };
    }
  }

  /**
   * Process Clarifai API response and format it
   */
  private processClarifaiResponse(response: any): ClassificationResult {
    try {
      console.log('Raw Clarifai response:', JSON.stringify(response, null, 2));
      
      // Handle apparel-detection model response format
      // The response should have regions with conceptsList
      const regions = response?.[0]?.data?.regionsList;
      
      if (!regions || !Array.isArray(regions) || regions.length === 0) {
        console.log('No regions found, checking other response formats');
        return this.processGenericResponse(response);
      }

      console.log('Found regions:', regions.length);

      // Collect all concepts from all regions
      const allConcepts: any[] = [];
      
      for (const region of regions) {
        const concepts = region.data?.conceptsList || [];
        for (const concept of concepts) {
          if (concept.name && concept.value) {
            allConcepts.push({
              name: concept.name,
              value: concept.value,
              boundingBox: region.regionInfo?.boundingBox
            });
          }
        }
      }

      console.log('All concepts found:', allConcepts);

      if (allConcepts.length === 0) {
        throw new Error('No valid concepts found in regions');
      }

      // Get top predictions
      const allPredictions = allConcepts
        .map((concept: any) => {
          const name = concept.name.toLowerCase();
          const mapping = CATEGORY_MAPPING[name] || CATEGORY_MAPPING['clothing'];
          
          return {
            label: concept.name,
            confidence: concept.value,
            category: mapping.category,
            subcategory: mapping.subcategory
          };
        })
        .sort((a: any, b: any) => b.confidence - a.confidence)
        .slice(0, 10);

      const topPrediction = allPredictions[0];

      return {
        predicted_label: topPrediction.label,
        confidence: topPrediction.confidence,
        category: topPrediction.category,
        subcategory: topPrediction.subcategory,
        all_predictions: allPredictions
      };

    } catch (error) {
      console.error('Error processing Clarifai response:', error);
      return this.processGenericResponse(response);
    }
  }

  /**
   * Fallback processor for generic response formats
   */
  private processGenericResponse(response: any): ClassificationResult {
    try {
      console.log('Processing as generic response');
      
      // Handle different response formats
      let outputs = [];
      
      if (Array.isArray(response)) {
        outputs = response;
      } else if (response && response.outputs) {
        outputs = response.outputs;
      } else if (response && response.length > 0) {
        outputs = response;
      } else {
        outputs = [response];
      }

      if (outputs.length === 0) {
        throw new Error('No outputs in Clarifai response');
      }

      const firstOutput = outputs[0];
      let concepts = [];
      
      // Try different paths to find concepts
      if (firstOutput && firstOutput.data && firstOutput.data.concepts) {
        concepts = firstOutput.data.concepts;
      } else if (firstOutput && firstOutput.concepts) {
        concepts = firstOutput.concepts;
      } else if (firstOutput && Array.isArray(firstOutput)) {
        concepts = firstOutput;
      }

      if (!Array.isArray(concepts) || concepts.length === 0) {
        throw new Error('No concepts found in generic response');
      }

      // Get top predictions
      const allPredictions = concepts
        .filter((concept: any) => concept && (concept.name || concept.label) && concept.value)
        .map((concept: any) => {
          const name = (concept.name || concept.label || '').toLowerCase();
          const mapping = CATEGORY_MAPPING[name] || CATEGORY_MAPPING['clothing'];
          
          return {
            label: concept.name || concept.label || 'clothing',
            confidence: concept.value || 0.3,
            category: mapping.category,
            subcategory: mapping.subcategory
          };
        })
        .sort((a: any, b: any) => b.confidence - a.confidence)
        .slice(0, 10);

      if (allPredictions.length === 0) {
        throw new Error('No valid predictions found');
      }

      const topPrediction = allPredictions[0];

      return {
        predicted_label: topPrediction.label,
        confidence: topPrediction.confidence,
        category: topPrediction.category,
        subcategory: topPrediction.subcategory,
        all_predictions: allPredictions
      };

    } catch (error) {
      console.error('Error in generic response processing:', error);
      
      // Return fallback result
      return {
        predicted_label: 'clothing',
        confidence: 0.3,
        category: 'tops',
        subcategory: 'top',
        all_predictions: [{
          label: 'clothing',
          confidence: 0.3,
          category: 'tops',
          subcategory: 'top'
        }]
      };
    }
  }

  /**
   * Check if classifier is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get detailed clothing analysis including colors, patterns, etc.
   */
  async getClothingAnalysis(imageBuffer: Buffer): Promise<{
    category: string;
    styles: string[];
    confidence: number;
    description: string;
    colors: string[];
    material: string;
    occasion: string[];
    season: string[];
    subcategory: string;
    pattern: string;
    primaryColor: string;
    reasoning: string;
  }> {
    const classification = await this.classifyClothing(imageBuffer);
    
    // For now, use basic analysis. In production, you could use multiple Clarifai models
    // for color detection, pattern recognition, etc.
    return {
      category: classification.category.toUpperCase(),
      styles: this.inferStyles(classification.predicted_label),
      confidence: classification.confidence,
      description: `${classification.predicted_label} - ${classification.confidence.toFixed(2)} confidence`,
      colors: ['Unknown'], // Could use color detection model
      material: 'Unknown', // Could use texture/material detection model
      occasion: this.inferOccasion(classification.predicted_label),
      season: this.inferSeason(classification.predicted_label),
      subcategory: classification.subcategory,
      pattern: 'unknown',
      primaryColor: 'unknown',
      reasoning: `Clarifai AI classification using apparel detection model`,
      all_predictions: classification.all_predictions
    } as any;
  }

  /**
   * Infer clothing styles based on category
   */
  private inferStyles(label: string): string[] {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('suit') || labelLower.includes('blazer')) {
      return ['Formal', 'Business'];
    } else if (labelLower.includes('dress') || labelLower.includes('gown')) {
      return ['Formal', 'Evening'];
    } else if (labelLower.includes('hoodie') || labelLower.includes('sneakers')) {
      return ['Casual', 'Sporty'];
    } else {
      return ['Casual'];
    }
  }

  /**
   * Infer occasion based on clothing type
   */
  private inferOccasion(label: string): string[] {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('suit') || labelLower.includes('blazer') || labelLower.includes('dress')) {
      return ['formal', 'work', 'special'];
    } else if (labelLower.includes('hoodie') || labelLower.includes('jeans')) {
      return ['casual', 'daily'];
    } else {
      return ['daily'];
    }
  }

  /**
   * Infer season based on clothing type
   */
  private inferSeason(label: string): string[] {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('coat') || labelLower.includes('sweater') || labelLower.includes('jacket')) {
      return ['fall', 'winter'];
    } else if (labelLower.includes('shorts') || labelLower.includes('tank')) {
      return ['summer', 'spring'];
    } else {
      return ['all-season'];
    }
  }
}

// Singleton instance
export const clarifaiClassifier = new ClarifaiClassifier();
