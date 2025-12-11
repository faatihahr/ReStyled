// Local Clothing Classification System
// Uses pattern matching and heuristics instead of external AI

interface ClothingPattern {
  category: string;
  keywords: string[];
  visualPatterns: {
    aspectRatio: { min: number; max: number };
    colorPatterns: string[];
    shapeHints: string[];
  };
  styles: string[];
}

const CLOTHING_PATTERNS: ClothingPattern[] = [
  {
    category: 'PANTS',
    keywords: ['pants', 'trousers', 'jeans', 'slacks', 'khakis', 'leggings'],
    visualPatterns: {
      aspectRatio: { min: 0.2, max: 0.6 }, // Pants are much wider than tall
      colorPatterns: ['denim', 'neutral', 'dark'],
      shapeHints: ['long', 'vertical', 'two-legged', 'wide']
    },
    styles: ['Casual', 'Classic']
  },
  {
    category: 'SHIRT',
    keywords: ['shirt', 't-shirt', 'top', 'blouse', 'tee', 'pullover'],
    visualPatterns: {
      aspectRatio: { min: 0.6, max: 1.2 }, // Shirts are more square-ish
      colorPatterns: ['varied', 'patterned', 'solid'],
      shapeHints: ['sleeves', 'collar', 'upper-body']
    },
    styles: ['Casual', 'Classic']
  },
  {
    category: 'DRESS',
    keywords: ['dress', 'gown', 'frock', 'sundress'],
    visualPatterns: {
      aspectRatio: { min: 0.4, max: 0.8 },
      colorPatterns: ['elegant', 'patterned', 'solid'],
      shapeHints: ['one-piece', 'flowing', 'feminine']
    },
    styles: ['Chic', 'Formal']
  },
  {
    category: 'SKIRTS',
    keywords: ['skirt', 'mini', 'midi', 'maxi'],
    visualPatterns: {
      aspectRatio: { min: 0.8, max: 1.5 }, // Skirts can be very wide
      colorPatterns: ['varied', 'patterned'],
      shapeHints: ['bottom-half', 'flowing', 'circular']
    },
    styles: ['Chic', 'Casual']
  },
  {
    category: 'JACKETS',
    keywords: ['jacket', 'coat', 'blazer', 'outerwear'],
    visualPatterns: {
      aspectRatio: { min: 0.7, max: 1.1 },
      colorPatterns: ['dark', 'neutral', 'bold'],
      shapeHints: ['layered', 'structured', 'weatherproof']
    },
    styles: ['Casual', 'Classic']
  },
  {
    category: 'SHOES',
    keywords: ['shoes', 'footwear', 'sneakers', 'boots', 'sandals'],
    visualPatterns: {
      aspectRatio: { min: 1.5, max: 4.0 }, // Shoes are significantly taller than wide
      colorPatterns: ['varied', 'athletic', 'formal'],
      shapeHints: ['foot-shaped', 'paired', 'ground-level', 'tall']
    },
    styles: ['Casual', 'Streetwear']
  }
];

export class ClothingClassifier {
  private analyzeImageMetadata(buffer: Buffer) {
    // Enhanced image analysis for better classification
    // In a real implementation, you might use sharp or jimp for actual image processing
    return {
      width: 800, // Default assumptions
      height: 600,
      aspectRatio: 800 / 600,
      dominantColors: ['blue', 'black'], // Simplified
      hasTransparency: false,
      // Add more features for better classification
      estimatedShape: 'unknown', // Will be determined by aspect ratio
      complexity: 'medium' // Pattern complexity
    };
  }

  private determineShapeFromAspectRatio(aspectRatio: number): string {
    if (aspectRatio < 0.4) return 'very_wide'; // Strong pants indicator
    if (aspectRatio < 0.7) return 'wide'; // Likely pants, could be dresses
    if (aspectRatio < 1.2) return 'square'; // Likely shirts, jackets
    if (aspectRatio < 1.5) return 'slightly_tall'; // Could be tall items
    if (aspectRatio < 3.0) return 'tall'; // Likely shoes
    return 'very_tall'; // Definitely shoes or accessories
  }

  private calculateScore(pattern: ClothingPattern, metadata: any): number {
    let score = 0;
    
    // Enhanced aspect ratio scoring with shape detection
    const shape = this.determineShapeFromAspectRatio(metadata.aspectRatio);
    const { min, max } = pattern.visualPatterns.aspectRatio;
    
    if (metadata.aspectRatio >= min && metadata.aspectRatio <= max) {
      score += 30;
    }
    
    // Shape-based scoring for better accuracy
    if (pattern.category === 'PANTS' && (shape === 'very_wide' || shape === 'wide')) {
      score += 30; // Strong bonus for pants-like shapes
    }
    if (pattern.category === 'SHIRT' && shape === 'square') {
      score += 20;
    }
    if (pattern.category === 'SHOES' && (shape === 'tall' || shape === 'very_tall')) {
      score += 30; // Strong bonus for shoes-like shapes
    }
    if (pattern.category === 'DRESS' && (shape === 'wide' || shape === 'square')) {
      score += 20;
    }
    
    // Penalty for wrong shapes
    if (pattern.category === 'PANTS' && (shape === 'tall' || shape === 'very_tall')) {
      score -= 20; // Penalize pants if shape looks like shoes
    }
    if (pattern.category === 'SHOES' && (shape === 'very_wide' || shape === 'wide')) {
      score -= 20; // Penalize shoes if shape looks like pants
    }
    
    // Color pattern scoring
    if (pattern.visualPatterns.colorPatterns.includes('varied') || 
        pattern.visualPatterns.colorPatterns.some(c => metadata.dominantColors.includes(c))) {
      score += 20;
    }
    
    // Base score for matching
    score += 25; // Base confidence
    
    return Math.min(score, 100);
  }

  classify(imageBuffer: Buffer, fileName?: string) {
    console.log('Starting enhanced local clothing classification...');
    
    const metadata = this.analyzeImageMetadata(imageBuffer);
    metadata.estimatedShape = this.determineShapeFromAspectRatio(metadata.aspectRatio);
    
    console.log('Enhanced image metadata:', metadata);
    
    // Analyze filename for hints
    const fileNameLower = fileName?.toLowerCase() || '';
    
    // Score each pattern
    const scores = CLOTHING_PATTERNS.map(pattern => {
      let score = this.calculateScore(pattern, metadata);
      
      // Bonus points for filename keywords
      const keywordMatch = pattern.keywords.find(keyword => 
        fileNameLower.includes(keyword)
      );
      if (keywordMatch) {
        score += 25;
        console.log(`Keyword match: ${keywordMatch} for ${pattern.category}`);
      }
      
      // Special bonus for pants detection
      if (pattern.category === 'PANTS') {
        // Check for pants-related keywords in filename
        const pantsKeywords = ['pants', 'trousers', 'jeans', 'slacks', 'khakis', 'leggings'];
        const pantsKeywordMatch = pantsKeywords.find(keyword => fileNameLower.includes(keyword));
        if (pantsKeywordMatch) {
          score += 30; // Strong bonus for pants keywords
          console.log(`Pants keyword match: ${pantsKeywordMatch}`);
        }
        
        // Extra boost if shape suggests pants
        if (metadata.estimatedShape === 'very_wide' || metadata.estimatedShape === 'wide') {
          score += 15;
          console.log(`Shape suggests pants: ${metadata.estimatedShape}`);
        }
      }
      
      return {
        category: pattern.category,
        score,
        styles: pattern.styles,
        matchedKeyword: keywordMatch || null
      };
    });
    
    // Sort by score
    scores.sort((a, b) => b.score - a.score);
    
    const bestMatch = scores[0];
    const confidence = bestMatch.score / 100;
    
    console.log('Enhanced classification results:', scores);
    console.log('Best match:', bestMatch);
    
    // Special handling: if pants has high score but not highest, still prefer pants for certain conditions
    const pantsScore = scores.find(s => s.category === 'PANTS')?.score || 0;
    if (pantsScore > 70 && bestMatch.score - pantsScore < 20) {
      console.log('Pants score is competitive, preferring pants');
      const pantsMatch = scores.find(s => s.category === 'PANTS')!;
      return {
        category: 'PANTS',
        styles: pantsMatch.styles,
        confidence: pantsScore / 100,
        method: 'enhanced-pattern-matching',
        allScores: scores,
        reasoning: 'Pants had competitive score with shape/keyword evidence'
      };
    }
    
    return {
      category: bestMatch.category,
      styles: bestMatch.styles,
      confidence,
      method: 'enhanced-pattern-matching',
      allScores: scores
    };
  }
}

// Singleton instance
export const clothingClassifier = new ClothingClassifier();
