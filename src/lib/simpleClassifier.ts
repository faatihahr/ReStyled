// Simple Dataset-Only Classifier
// Direct classification based on keywords and simple patterns

export interface SimpleClassificationResult {
  category: string;
  styles: string[];
  confidence: number;
  matchedKeywords: string[];
  reasoning: string;
}

// Simple keyword-based classification rules
const CLASSIFICATION_RULES = [
  {
    category: 'TOPS',
    keywords: ['shirt', 'tshirt', 't-shirt', 'tee', 'top', 'blouse', 'pullover', 'sweater'],
    styles: ['Casual', 'Classic'],
    confidence: 0.9
  },
  {
    category: 'PANTS',
    keywords: ['pants', 'trousers', 'jeans', 'slacks', 'khakis', 'leggings', 'bottom'],
    styles: ['Casual', 'Classic'],
    confidence: 0.9
  },
  {
    category: 'DRESSES',
    keywords: ['dress', 'gown', 'frock', 'sundress', 'onepiece'],
    styles: ['Chic', 'Formal'],
    confidence: 0.9
  },
  {
    category: 'SKIRTS',
    keywords: ['skirt', 'mini', 'midi', 'maxi'],
    styles: ['Chic', 'Casual'],
    confidence: 0.9
  },
  {
    category: 'JACKETS',
    keywords: ['jacket', 'coat', 'blazer', 'outerwear', 'cardigan'],
    styles: ['Casual', 'Classic'],
    confidence: 0.9
  },
  {
    category: 'SHOES',
    keywords: ['shoes', 'footwear', 'sneakers', 'boots', 'sandals', 'foot'],
    styles: ['Casual', 'Athletic'],
    confidence: 0.9
  }
];

export class SimpleClassifier {
  classify(fileName?: string, imageData?: Buffer): SimpleClassificationResult {
    console.log('Starting simple dataset-only classification...');
    
    const fileNameLower = fileName?.toLowerCase() || '';
    const matchedKeywords: string[] = [];
    
    // Find matching category based on keywords
    for (const rule of CLASSIFICATION_RULES) {
      const foundKeywords = rule.keywords.filter(keyword => 
        fileNameLower.includes(keyword)
      );
      
      if (foundKeywords.length > 0) {
        matchedKeywords.push(...foundKeywords);
        console.log(`Matched ${rule.category} with keywords:`, foundKeywords);
        
        return {
          category: rule.category,
          styles: rule.styles,
          confidence: rule.confidence,
          matchedKeywords: foundKeywords,
          reasoning: `Direct keyword match: ${foundKeywords.join(', ')}`
        };
      }
    }
    
    // Fallback to default if no keywords match
    console.log('No keywords matched, defaulting to TOPS');
    return {
      category: 'TOPS',
      styles: ['Casual'],
      confidence: 0.5,
      matchedKeywords: [],
      reasoning: 'No keywords matched, using default TOPS category'
    };
  }
  
  // Get all available categories for modal
  getAvailableCategories(): string[] {
    return CLASSIFICATION_RULES.map(rule => rule.category);
  }
  
  // Get styles for a specific category
  getStylesForCategory(category: string): string[] {
    const rule = CLASSIFICATION_RULES.find(r => r.category === category);
    return rule?.styles || ['Casual'];
  }
}

export const simpleClassifier = new SimpleClassifier();
