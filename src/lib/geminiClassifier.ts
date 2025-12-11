import { GoogleGenAI } from "@google/genai";

// Prompt untuk Gemini AI - Clothing Classification
const CLOTHING_CLASSIFICATION_PROMPT = `
Analyze this clothing item image and provide detailed classification in JSON format.

CLASSIFICATION RULES:
1. Be precise and consistent with categories
2. Identify the PRIMARY item only (ignore background/people)
3. Use the exact category names provided below
4. Detect ALL visible colors (max 3 main colors)
5. Assess the style and suitable occasions

OUTPUT FORMAT (strictly follow this JSON structure):
{
  "category": "string",
  "subcategory": "string",
  "colors": ["color1", "color2", "color3"],
  "primaryColor": "string",
  "style": ["style1", "style2"],
  "occasion": ["occasion1", "occasion2"],
  
  
}

CATEGORY OPTIONS (choose ONE):
- "tops" (atasan)
- "bottoms" (bawahan)
- "dresses" (dress/gamis)
- "outerwear" (jaket/blazer/cardigan)
- "shoes" (sepatu)
- "accessories" (aksesoris)

SUBCATEGORY by CATEGORY:
For "tops": t-shirt, blouse, shirt, tank-top, crop-top, sweater, hoodie, polo
For "bottoms": jeans, trousers, skirt, shorts, joggers, leggings
For "dresses": maxi-dress, mini-dress, midi-dress, kaftan, gamis
For "outerwear": jacket, blazer, cardigan, coat, vest, bomber
For "shoes": sneakers, heels, flats, boots, sandals, loafers
For "accessories": bag, hat, belt, scarf, jewelry, sunglasses

COLOR OPTIONS (use common color names):
black, white, gray, navy, blue, light-blue, red, pink, green, olive, yellow, orange, brown, beige, cream, purple, maroon, multi-color

PATTERN OPTIONS:
solid, striped, checkered, floral, polka-dot, abstract, geometric, animal-print, tie-dye, gradient, none

MATERIAL OPTIONS (if identifiable):
cotton, denim, leather, silk, wool, polyester, knit, linen, synthetic, chiffon, unknown

STYLE OPTIONS (choose 1-2 that fit):
casual, formal, business, sporty, elegant, bohemian, minimalist, streetwear, vintage, preppy, edgy, romantic, oversized, fitted

OCCASION OPTIONS (choose 1-3):
daily, work, formal-event, casual-hangout, sports, party, date, vacation, outdoor, indoor, religious

SEASON OPTIONS (choose 1-2):
spring, summer, fall, winter, all-season

IMPORTANT GUIDELINES:
- If the image is unclear or not clothing, return: {"error": "Not a valid clothing item"}
- Always use lowercase for values
- Be consistent: "t-shirt" not "tshirt", "light-blue" not "lightblue"
- For multi-color items, list up to 3 dominant colors
- Description should be 1 concise sentence (max 15 words)

Return ONLY the JSON object, no additional text or markdown.
`;

// Interface untuk classification result
export interface ClothingClassification {
  category: string;
  subcategory: string;
  colors: string[];
  primaryColor: string;
  pattern: string;
  material: string;
  style: string[];
  occasion: string[];
  season: string[];
  description: string;
  error?: string;
}

export class GeminiClassifier {
  private ai: GoogleGenAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  async classifyClothing(imageBuffer: Buffer, fileName?: string): Promise<ClothingClassification> {
    try {
      console.log('Starting Gemini AI clothing classification...');
      
      // Convert buffer to base64 for Gemini
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(fileName);
      
      // Create content with image and prompt
      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      };
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [
          CLOTHING_CLASSIFICATION_PROMPT,
          imagePart
        ]
      });
      
      const text = response.text;
      console.log('Gemini AI response:', text);
      
      // Check if response text exists
      if (!text) {
        throw new Error('No text in Gemini response');
      }
      
      // Parse the response
      const classification = this.parseGeminiResponse(text);
      
      console.log('Gemini classification result:', classification);
      return classification;

    } catch (error) {
      console.error('Gemini classification error:', error);
      
      // Fallback to basic classification
      return {
        category: 'tops',
        subcategory: 't-shirt',
        colors: ['unknown'],
        primaryColor: 'unknown',
        pattern: 'unknown',
        material: 'unknown',
        style: ['casual'],
        occasion: ['daily'],
        season: ['all-season'],
        description: 'Classification failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private parseGeminiResponse(text: string): ClothingClassification {
    try {
      // Check for error response
      if (text.includes('error')) {
        const errorMatch = text.match(/\{"error":\s*"([^"]+)"\}/);
        if (errorMatch) {
          throw new Error(errorMatch[1]);
        }
      }

      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return {
        category: this.validateCategory(parsed.category),
        subcategory: this.validateSubcategory(parsed.subcategory, parsed.category),
        colors: this.validateColors(parsed.colors || []),
        primaryColor: parsed.primaryColor || parsed.colors?.[0] || 'unknown',
        pattern: this.validatePattern(parsed.pattern),
        material: this.validateMaterial(parsed.material),
        style: this.validateStyles(parsed.style || []),
        occasion: this.validateOccasions(parsed.occasion || []),
        season: this.validateSeasons(parsed.season || []),
        description: parsed.description || 'Clothing item',
        error: parsed.error
      };

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw error;
    }
  }

  private validateCategory(category: string): string {
    const validCategories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
    return validCategories.includes(category?.toLowerCase()) ? category.toLowerCase() : 'tops';
  }

  private validateSubcategory(subcategory: string, category: string): string {
    const validSubcategories: Record<string, string[]> = {
      tops: ['t-shirt', 'blouse', 'shirt', 'tank-top', 'crop-top', 'sweater', 'hoodie', 'polo'],
      bottoms: ['jeans', 'trousers', 'skirt', 'shorts', 'joggers', 'leggings'],
      dresses: ['maxi-dress', 'mini-dress', 'midi-dress', 'kaftan', 'gamis'],
      outerwear: ['jacket', 'blazer', 'cardigan', 'coat', 'vest', 'bomber'],
      shoes: ['sneakers', 'heels', 'flats', 'boots', 'sandals', 'loafers'],
      accessories: ['bag', 'hat', 'belt', 'scarf', 'jewelry', 'sunglasses']
    };

    const categorySubcategories = validSubcategories[category] || [];
    return categorySubcategories.includes(subcategory?.toLowerCase()) ? subcategory.toLowerCase() : 'unknown';
  }

  private validateColors(colors: string[]): string[] {
    const validColors = ['black', 'white', 'gray', 'navy', 'blue', 'light-blue', 'red', 'pink', 'green', 'olive', 'yellow', 'orange', 'brown', 'beige', 'cream', 'purple', 'maroon', 'multi-color'];
    return colors.filter(color => 
      validColors.includes(color.toLowerCase())
    ).slice(0, 3);
  }

  private validatePattern(pattern: string): string {
    const validPatterns = ['solid', 'striped', 'checkered', 'floral', 'polka-dot', 'abstract', 'geometric', 'animal-print', 'tie-dye', 'gradient', 'none'];
    return validPatterns.includes(pattern?.toLowerCase()) ? pattern.toLowerCase() : 'unknown';
  }

  private validateMaterial(material: string): string {
    const validMaterials = ['cotton', 'denim', 'leather', 'silk', 'wool', 'polyester', 'knit', 'linen', 'synthetic', 'chiffon', 'unknown'];
    return validMaterials.includes(material?.toLowerCase()) ? material.toLowerCase() : 'unknown';
  }

  private validateStyles(styles: string[]): string[] {
    const validStyles = ['casual', 'formal', 'business', 'sporty', 'elegant', 'bohemian', 'minimalist', 'streetwear', 'vintage', 'preppy', 'edgy', 'romantic', 'oversized', 'fitted'];
    return styles.filter(style => validStyles.includes(style.toLowerCase())).slice(0, 2);
  }

  private validateOccasions(occasions: string[]): string[] {
    const validOccasions = ['daily', 'work', 'formal-event', 'casual-hangout', 'sports', 'party', 'date', 'vacation', 'outdoor', 'indoor', 'religious'];
    return occasions.filter(occasion => validOccasions.includes(occasion.toLowerCase())).slice(0, 3);
  }

  private validateSeasons(seasons: string[]): string[] {
    const validSeasons = ['spring', 'summer', 'fall', 'winter', 'all-season'];
    return seasons.filter(season => validSeasons.includes(season.toLowerCase())).slice(0, 2);
  }

  private getMimeType(fileName?: string): string {
    if (!fileName) return 'image/jpeg';
    
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'webp': return 'image/webp';
      case 'gif': return 'image/gif';
      default: return 'image/jpeg';
    }
  }

  // Method to check if Gemini is available
  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }
}

export const geminiClassifier = new GeminiClassifier();
