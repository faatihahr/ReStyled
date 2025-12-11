// Fashion-MNIST Dataset Integration
// 10 classes: T-shirt/top, Trouser, Pullover, Dress, Coat, Sandal, Shirt, Sneaker, Bag, Ankle boot
// Extended wardrobe categories: tops, bottoms, dresses, outerwear, shoes, accessories

export interface FashionMNISTItem {
  id: string;
  label: number; // 0-9
  className: string;
  category: string;
  subcategory: string;
  patterns: string[];
  styles: string[];
  description: string;
}

// Enhanced wardrobe category mapping
export const FASHION_MNIST_CLASSES: FashionMNISTItem[] = [
  {
    id: 'fmnist_0',
    label: 0,
    className: 'T-shirt/top',
    category: 'TOPS',
    subcategory: 'T-shirts',
    patterns: ['crew-neck', 'short-sleeve', 'cotton', 'casual', 'everyday'],
    styles: ['Casual', 'Classic', 'Streetwear'],
    description: 'T-shirt or top garment - versatile everyday wear'
  },
  {
    id: 'fmnist_1',
    label: 1,
    className: 'Trouser',
    category: 'BOTTOMS',
    subcategory: 'Trousers',
    patterns: ['long', 'two-legged', 'waist-high', 'casual', 'formal'],
    styles: ['Casual', 'Business', 'Classic'],
    description: 'Trousers or pants - essential bottom wear'
  },
  {
    id: 'fmnist_2',
    label: 2,
    className: 'Pullover',
    category: 'TOPS',
    subcategory: 'Sweaters',
    patterns: ['long-sleeve', 'warm', 'knitted', 'casual', 'cozy'],
    styles: ['Casual', 'Cozy', 'Winter'],
    description: 'Pullover or sweater - warm top layer'
  },
  {
    id: 'fmnist_3',
    label: 3,
    className: 'Dress',
    category: 'DRESSES',
    subcategory: 'Casual Dresses',
    patterns: ['one-piece', 'flowing', 'feminine', 'versatile', 'elegant'],
    styles: ['Casual', 'Chic', 'Elegant'],
    description: 'Dress or one-piece garment - complete outfit'
  },
  {
    id: 'fmnist_4',
    label: 4,
    className: 'Coat',
    category: 'OUTERWEAR',
    subcategory: 'Coats',
    patterns: ['outerwear', 'warm', 'layered', 'formal', 'protective'],
    styles: ['Formal', 'Classic', 'Winter'],
    description: 'Coat or outer jacket - weather protection layer'
  },
  {
    id: 'fmnist_5',
    label: 5,
    className: 'Sandal',
    category: 'SHOES',
    subcategory: 'Sandals',
    patterns: ['open-toe', 'casual', 'summer', 'comfortable', 'breathable'],
    styles: ['Casual', 'Summer', 'Beach'],
    description: 'Sandal footwear - warm weather shoes'
  },
  {
    id: 'fmnist_6',
    label: 6,
    className: 'Shirt',
    category: 'TOPS',
    subcategory: 'Button-up Shirts',
    patterns: ['button-front', 'collar', 'formal', 'versatile', 'structured'],
    styles: ['Formal', 'Business', 'Classic'],
    description: 'Button-up shirt - formal or casual top'
  },
  {
    id: 'fmnist_7',
    label: 7,
    className: 'Sneaker',
    category: 'SHOES',
    subcategory: 'Sneakers',
    patterns: ['athletic', 'rubber-sole', 'casual', 'sporty', 'comfortable'],
    styles: ['Athletic', 'Casual', 'Streetwear'],
    description: 'Sneaker or athletic shoe - versatile footwear'
  },
  {
    id: 'fmnist_8',
    label: 8,
    className: 'Bag',
    category: 'ACCESSORIES',
    subcategory: 'Bags',
    patterns: ['carry-all', 'functional', 'versatile', 'essential', 'portable'],
    styles: ['Casual', 'Functional', 'Fashion'],
    description: 'Handbag or accessory bag - essential accessory'
  },
  {
    id: 'fmnist_9',
    label: 9,
    className: 'Ankle boot',
    category: 'SHOES',
    subcategory: 'Boots',
    patterns: ['ankle-high', 'closed-toe', 'weatherproof', 'stylish', 'durable'],
    styles: ['Casual', 'Streetwear', 'Winter'],
    description: 'Ankle-length boot - stylish protective footwear'
  }
];

export class FashionMNISTClassifier {
  private classes: FashionMNISTItem[];
  
  constructor() {
    this.classes = FASHION_MNIST_CLASSES;
  }
  
  // Get class by label
  getClassByLabel(label: number): FashionMNISTItem | null {
    return this.classes.find(cls => cls.label === label) || null;
  }
  
  // Get class by category
  getClassesByCategory(category: string): FashionMNISTItem[] {
    return this.classes.filter(cls => cls.category === category);
  }
  
  // Find similar classes based on patterns
  findSimilarClasses(attributes: {
    category?: string;
    patterns?: string[];
    styles?: string[];
  }): FashionMNISTItem[] {
    return this.classes.filter(cls => {
      let score = 0;
      
      // Category matching
      if (attributes.category && cls.category === attributes.category) {
        score += 3;
      }
      
      // Pattern matching
      if (attributes.patterns) {
        const patternMatches = attributes.patterns.filter(pattern =>
          cls.patterns.some(clsPattern => 
            clsPattern.toLowerCase().includes(pattern.toLowerCase())
          )
        );
        score += patternMatches.length;
      }
      
      // Style matching
      if (attributes.styles) {
        const styleMatches = attributes.styles.filter(style =>
          cls.styles.includes(style)
        );
        score += styleMatches.length * 2;
      }
      
      return score >= 2; // Minimum threshold
    });
  }
  
  // Get all categories
  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.classes.forEach(cls => categories.add(cls.category));
    return Array.from(categories);
  }
  
  // Get styles for category
  getStylesForCategory(category: string): string[] {
    const classes = this.getClassesByCategory(category);
    const styles = new Set<string>();
    
    classes.forEach(cls => {
      cls.styles.forEach(style => styles.add(style));
    });
    
    return Array.from(styles);
  }
  
  // Enhanced classification with confidence
  classifyWithConfidence(features: {
    category?: string;
    patterns?: string[];
    styles?: string[];
    keywords?: string[];
  }): {
    class: FashionMNISTItem;
    confidence: number;
    matches: string[];
  } | null {
    const candidates = this.findSimilarClasses(features);
    
    if (candidates.length === 0) return null;
    
    // Calculate confidence based on matches
    const bestMatch = candidates[0];
    let confidence = 0.5; // Base confidence
    
    const matches: string[] = [];
    
    // Category match
    if (features.category && bestMatch.category === features.category) {
      confidence += 0.2;
      matches.push('category');
    }
    
    // Pattern matches
    if (features.patterns) {
      const patternMatches = features.patterns.filter(pattern =>
        bestMatch.patterns.some(p => p.toLowerCase().includes(pattern.toLowerCase()))
      );
      confidence += patternMatches.length * 0.1;
      matches.push(...patternMatches.map(p => `pattern:${p}`));
    }
    
    // Style matches
    if (features.styles) {
      const styleMatches = features.styles.filter(style =>
        bestMatch.styles.includes(style)
      );
      confidence += styleMatches.length * 0.15;
      matches.push(...styleMatches.map(s => `style:${s}`));
    }
    
    // Keyword matches
    if (features.keywords) {
      const keywordMatches = features.keywords.filter(keyword =>
        bestMatch.className.toLowerCase().includes(keyword.toLowerCase()) ||
        bestMatch.description.toLowerCase().includes(keyword.toLowerCase())
      );
      confidence += keywordMatches.length * 0.1;
      matches.push(...keywordMatches.map(k => `keyword:${k}`));
    }
    
    return {
      class: bestMatch,
      confidence: Math.min(confidence, 1.0),
      matches
    };
  }
}

export const fashionMNISTClassifier = new FashionMNISTClassifier();
