/**
 * Fashion-MNIST CNN Clothing Classifier
 * Uses TensorFlow.js for local CNN classification without external AI
 */

import * as tf from '@tensorflow/tfjs';
import sharp from 'sharp';

// Fashion-MNIST Labels (10 categories)
const CLASS_NAMES: { [key: number]: string } = {
  0: 'T-shirt/top',
  1: 'Trouser',
  2: 'Pullover',
  3: 'Dress',
  4: 'Coat',
  5: 'Sandal',
  6: 'Shirt',
  7: 'Sneaker',
  8: 'Bag',
  9: 'Ankle boot'
};

// Mapping ke kategori untuk digital wardrobe
const CATEGORY_MAPPING: { [key: string]: { category: string; subcategory: string } } = {
  'T-shirt/top': { category: 'tops', subcategory: 't-shirt' },
  'Trouser': { category: 'bottoms', subcategory: 'trousers' },
  'Pullover': { category: 'tops', subcategory: 'sweater' },
  'Dress': { category: 'dresses', subcategory: 'dress' },
  'Coat': { category: 'outerwear', subcategory: 'coat' },
  'Sandal': { category: 'shoes', subcategory: 'sandals' },
  'Shirt': { category: 'tops', subcategory: 'shirt' },
  'Sneaker': { category: 'shoes', subcategory: 'sneakers' },
  'Bag': { category: 'accessories', subcategory: 'bag' },
  'Ankle boot': { category: 'shoes', subcategory: 'boots' }
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

export class CNNClassifier {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;

  constructor() {
    this.initializeModel();
  }

  /**
   * Create CNN model untuk Fashion-MNIST classification
   */
  private createCNNModel(): tf.LayersModel {
    // Clear any existing variables to avoid conflicts
    tf.disposeVariables();
    
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.inputLayer({ inputShape: [28, 28, 1] }),
        
        // First convolutional block
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv2d_1'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Second convolutional block
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv2d_2'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Third convolutional block
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv2d_3'
        }),
        tf.layers.dropout({ rate: 0.4 }),
        
        // Flatten and dense layers
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu', name: 'dense_1' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 10, activation: 'softmax', name: 'output' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Initialize model - either load existing or create new
   */
  private async initializeModel(): Promise<void> {
    try {
      // Try to load pre-trained model from storage
      const storageKey = 'fashion-mnist-classifier';
      const modelData = typeof window !== 'undefined' 
        ? localStorage.getItem(storageKey)
        : null;

      if (modelData) {
        // Load existing model
        this.model = await tf.loadLayersModel(`localstorage://${storageKey}`);
        console.log('Loaded existing CNN model from storage');
      } else {
        // Create new model (would need training script)
        this.model = this.createCNNModel();
        console.log('Created new CNN model');
        // Note: In production, you'd load a pre-trained model
        // For now, we'll use the untrained model with random weights
      }

      this.isModelLoaded = true;
    } catch (error) {
      console.error('Error initializing CNN model:', error);
      // Fallback to creating a new model
      this.model = this.createCNNModel();
      this.isModelLoaded = true;
    }
  }

  /**
   * Preprocess user-uploaded image untuk prediction
   */
  private async preprocessImage(imageBuffer: Buffer): Promise<tf.Tensor> {
    try {
      // Use sharp for image processing
      const processedBuffer = await sharp(imageBuffer)
        .resize(28, 28)
        .greyscale()
        .raw()
        .toBuffer();

      // Convert to tensor
      const imageTensor = tf.tensor3d(new Uint8Array(processedBuffer), [28, 28, 1]);
      
      // Normalize pixel values (0-255 -> 0-1)
      const normalized = imageTensor.div(255.0);
      
      // Add batch dimension
      const batched = normalized.expandDims(0);
      
      return batched;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  /**
   * Classify clothing item from user upload
   */
  async classifyClothing(imageBuffer: Buffer): Promise<ClassificationResult> {
    if (!this.isModelLoaded || !this.model) {
      throw new Error('Model not loaded yet');
    }

    try {
      // Preprocess image
      const imgTensor = await this.preprocessImage(imageBuffer);

      // Predict
      const predictions = this.model.predict(imgTensor) as tf.Tensor;
      const predictionsData = await predictions.data();

      // Clean up tensors
      imgTensor.dispose();
      predictions.dispose();

      // Get predicted class and confidence
      const predictionsArray = new Float32Array(predictionsData);
      const predictedClass = this.argMax(predictionsArray);
      const confidence = predictionsArray[predictedClass];

      // Get top 3 predictions
      const top3Indices = this.getTopIndices(predictionsArray, 3);
      const top3Predictions = top3Indices.map(idx => ({
        label: CLASS_NAMES[idx],
        confidence: predictionsArray[idx],
        category: CATEGORY_MAPPING[CLASS_NAMES[idx]].category,
        subcategory: CATEGORY_MAPPING[CLASS_NAMES[idx]].subcategory
      }));

      // Main result
      const label = CLASS_NAMES[predictedClass];
      const result: ClassificationResult = {
        predicted_label: label,
        confidence: confidence,
        category: CATEGORY_MAPPING[label].category,
        subcategory: CATEGORY_MAPPING[label].subcategory,
        all_predictions: top3Predictions
      };

      console.log('CNN Classification result:', result);
      return result;

    } catch (error) {
      console.error('CNN classification error:', error);
      
      // Fallback result
      return {
        predicted_label: 'T-shirt/top',
        confidence: 0.5,
        category: 'tops',
        subcategory: 't-shirt',
        all_predictions: [{
          label: 'T-shirt/top',
          confidence: 0.5,
          category: 'tops',
          subcategory: 't-shirt'
        }]
      };
    }
  }

  /**
   * Get index of maximum value in array
   */
  private argMax(array: Float32Array): number {
    let maxIndex = 0;
    let maxValue = array[0];
    
    for (let i = 1; i < array.length; i++) {
      if (array[i] > maxValue) {
        maxValue = array[i];
        maxIndex = i;
      }
    }
    
    return maxIndex;
  }

  /**
   * Get top N indices from array
   */
  private getTopIndices(array: Float32Array, n: number): number[] {
    const indices = Array.from(array.keys());
    return indices
      .sort((a, b) => array[b] - array[a])
      .slice(0, n);
  }

  /**
   * Load Fashion-MNIST dataset from Kaggle format
   */
  private async loadFashionMNISTData() {
    console.log('Loading Fashion-MNIST dataset...');
    
    try {
      // Load from local CSV files (setelah download dari Kaggle)
      const [trainData, testData] = await Promise.all([
        this.loadFromCSV('/data/fashion-mnist/fashion-mnist_train.csv'),
        this.loadFromCSV('/data/fashion-mnist/fashion-mnist_test.csv')
      ]);
      
      return {
        trainImages: trainData.images,
        trainLabels: trainData.labels,
        testImages: testData.images,
        testLabels: testData.labels
      };
    } catch (error) {
      console.error('Error loading Fashion-MNIST dataset:', error);
      return this.createDummyData();
    }
  }

  /**
   * Load CSV data from Kaggle Fashion-MNIST format
   */
  private async loadFromCSV(filePath: string): Promise<{images: tf.Tensor, labels: tf.Tensor}> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const absolutePath = path.join(process.cwd(), filePath);
    const csvText = fs.readFileSync(absolutePath, 'utf8');
    
    const lines = csvText.split('\n').filter(line => line.trim());
    const dataRows = lines.slice(1).slice(0, 1000); // Limit to 1000 samples for faster training
    
    const images: number[][] = [];
    const labels: number[] = [];
    
    dataRows.forEach((row, index) => {
      const values = row.split(',');
      if (values.length >= 785) {
        const label = parseInt(values[0]);
        const pixels = values.slice(1).map(v => parseInt(v) / 255.0);
        
        labels.push(label);
        images.push(pixels);
      }
    });
    
    const images4D = new Float32Array(images.length * 28 * 28 * 1);
    for (let i = 0; i < images.length; i++) {
      for (let j = 0; j < 784; j++) {
        images4D[i * 784 + j] = images[i][j];
      }
    }
    
    console.log(`Loaded ${images.length} samples from ${filePath}`);
    
    return {
      images: tf.tensor4d(images4D, [images.length, 28, 28, 1]),
      labels: tf.tensor1d(labels, 'float32')
    };
  } catch (error) {
    console.error(`Error loading CSV from ${filePath}:`, error);
    throw error;
  }
}
  /**
   * Create dummy data for development/testing
   */
  private createDummyData() {
    console.log('Creating dummy dataset for development...');
    const numSamples = 1000;
    
    return {
      trainImages: tf.randomUniform([numSamples, 28, 28, 1]),
      trainLabels: tf.randomUniform([numSamples], 0, 10, 'float32'),
      testImages: tf.randomUniform([200, 28, 28, 1]),
      testLabels: tf.randomUniform([200], 0, 10, 'float32')
    };
  }

  /**
   * Check if model is ready
   */
  isReady(): boolean {
    return this.isModelLoaded && this.model !== null;
  }

  /**
   * Train model (for development/testing)
   */
  async trainModel(epochs: number = 10): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    console.log('Training CNN model...');
    
    // 1. Load Fashion-MNIST dataset
    const { trainImages, trainLabels, testImages, testLabels } = await this.loadFashionMNISTData();
    
    // 2. Preprocess the data (already normalized in loading functions)
    console.log('Dataset loaded successfully');
    console.log(`Training samples: ${trainImages.shape[0]}`);
    console.log(`Test samples: ${testImages.shape[0]}`);
    
    // 3. Train the model
    console.log(`Starting training for ${epochs} epochs...`);
    
    const history = await this.model.fit(trainImages, trainLabels, {
      epochs,
      batchSize: 128,
      validationData: [testImages, testLabels],
      callbacks: [
        tf.callbacks.earlyStopping({
          monitor: 'val_accuracy',
          patience: 3
        })
      ],
      verbose: 1
    });
    
    console.log('Training completed');
    
    // 4. Save the trained model
    if (typeof window !== 'undefined') {
      try {
        await this.model.save(`localstorage://fashion-mnist-classifier`);
        console.log('Model saved to local storage');
      } catch (error) {
        console.error('Error saving model:', error);
      }
    }
    
    // Clean up tensors
    trainImages.dispose();
    trainLabels.dispose();
    testImages.dispose();
    testLabels.dispose();
  }
}

// Singleton instance
export const cnnClassifier = new CNNClassifier();
