/**
 * Fashion-MNIST Training Script
 * Train CNN model using Fashion-MNIST dataset
 * Run with: npm run train-cnn
 */

import * as tf from '@tensorflow/tfjs-node';
import { createClient } from '@supabase/supabase-js';

// Fashion-MNIST Labels
const CLASS_NAMES = [
  'T-shirt/top',
  'Trouser', 
  'Pullover',
  'Dress',
  'Coat',
  'Sandal',
  'Shirt',
  'Sneaker',
  'Bag',
  'Ankle boot'
];

async function loadFashionMNISTData() {
  console.log('Loading Fashion-MNIST dataset...');
  
  try {
    // Load Fashion-MNIST from TensorFlow datasets
    const fashionMnist = await tf.data.generator(async () => {
      // In a real implementation, you would download the actual dataset
      // For now, we'll create dummy data for demonstration
      const numSamples = 1000;
      const data = {
        images: tf.randomUniform([numSamples, 28, 28, 1]),
        labels: tf.randomUniform([numSamples], 0, 10, 'int32')
      };
      return data;
    });

    console.log('Dataset loaded successfully');
    return fashionMnist;
  } catch (error) {
    console.error('Error loading dataset:', error);
    throw error;
  }
}

function createCNNModel() {
  const model = tf.sequential({
    layers: [
      // Input layer
      tf.layers.inputLayer({ inputShape: [28, 28, 1] }),
      
      // First convolutional block
      tf.layers.conv2d({
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }),
      tf.layers.maxPooling2d({ poolSize: 2 }),
      tf.layers.dropout({ rate: 0.25 }),
      
      // Second convolutional block
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }),
      tf.layers.maxPooling2d({ poolSize: 2 }),
      tf.layers.dropout({ rate: 0.25 }),
      
      // Third convolutional block
      tf.layers.conv2d({
        filters: 128,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }),
      tf.layers.dropout({ rate: 0.4 }),
      
      // Flatten and dense layers
      tf.layers.flatten(),
      tf.layers.dense({ units: 128, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.5 }),
      tf.layers.dense({ units: 10, activation: 'softmax' })
    ]
  });

  model.compile({
    optimizer: 'adam',
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

async function trainModel(epochs = 20, batchSize = 128) {
  console.log('Starting CNN training...');
  
  // Create model
  const model = createCNNModel();
  model.summary();
  
  // Load data
  const { images, labels } = await loadFashionMNISTData();
  
  // Split data
  const trainSize = Math.floor(images.shape[0] * 0.8);
  const trainImages = images.slice([0, 0, 0, 0], [trainSize, 28, 28, 1]);
  const trainLabels = labels.slice([0], [trainSize]);
  const testImages = images.slice([trainSize, 0, 0, 0], [images.shape[0] - trainSize, 28, 28, 1]);
  const testLabels = labels.slice([trainSize], [images.shape[0] - trainSize]);
  
  console.log(`Training samples: ${trainSize}`);
  console.log(`Test samples: ${images.shape[0] - trainSize}`);
  
  // Callbacks
  const callbacks = [
    tf.callbacks.earlyStopping({
      monitor: 'val_accuracy',
      patience: 5,
      restoreBestWeights: true
    })
  ];
  
  // Train model
  const history = await model.fit(trainImages, trainLabels, {
    epochs,
    batchSize,
    validationData: [testImages, testLabels],
    callbacks,
    verbose: 1
  });
  
  // Evaluate model
  const evalResult = model.evaluate(testImages, testLabels);
  console.log(`Test accuracy: ${evalResult[1]}`);
  console.log(`Test loss: ${evalResult[0]}`);
  
  // Save model
  await model.save('file://./fashion-mnist-classifier');
  console.log('Model saved to ./fashion-mnist-classifier');
  
  // Clean up
  images.dispose();
  labels.dispose();
  trainImages.dispose();
  trainLabels.dispose();
  testImages.dispose();
  testLabels.dispose();
  
  return model;
}

// Main execution
if (require.main === module) {
  trainModel(epochs = 20)
    .then(() => {
      console.log('Training completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Training failed:', error);
      process.exit(1);
    });
}

export { trainModel, createCNNModel };
