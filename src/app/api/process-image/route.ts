import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { clarifaiClassifier } from '../../../lib/clarifaiClassifier';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the current user from session
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user session
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to buffer for processing
    const buffer = Buffer.from(await image.arrayBuffer());

    // Process image with local classifier and dataset
    const classification = await classifyClothing(buffer, image.name);

    // Process image with remove.bg for background removal
    const processedImage = await removeBackground(buffer);

    // Save processed image to Supabase Storage
    try {
      const filename = `processed-${Date.now()}-${user.id}.png`;
      
      console.log('Uploading to Supabase storage:', filename);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clothing-images')
        .upload(filename, processedImage, {
          contentType: 'image/png'
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        
        // If bucket doesn't exist, return a mock URL for now
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          console.log('Uploads bucket not found, using mock URL');
          return NextResponse.json({
            result: {
              processedImage: 'mock-processed-image.png',
              classification: {
                category: classification.category,
                styles: classification.styles,
                confidence: classification.confidence
              },
              imageUrl: '/api/placeholder-image.png'
            }
          });
        }
        
        return NextResponse.json({ 
          error: 'Failed to upload processed image', 
          details: uploadError.message 
        }, { status: 500 });
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(filename);

      console.log('Public URL:', publicUrl);

      return NextResponse.json({
        result: {
          processedImage: filename,
          classification: {
            category: classification.category,
            styles: classification.styles,
            confidence: classification.confidence
          },
          imageUrl: publicUrl
        }
      });

    } catch (storageError) {
      console.error('Storage operation error:', storageError);
      return NextResponse.json({ 
        error: 'Storage operation failed', 
        details: storageError instanceof Error ? storageError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}

async function classifyClothing(imageBuffer: Buffer, fileName?: string) {
  try {
    console.log('Starting Clarifai classification...');
    
    // Check if Clarifai classifier is ready
    if (!clarifaiClassifier.isReady()) {
      console.log('Clarifai classifier not ready, waiting...');
      // Wait a bit for classifier to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Use Clarifai classifier for AI-powered classification
    const analysis = await clarifaiClassifier.getClothingAnalysis(imageBuffer);
    
    console.log('Clarifai classification result:', analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('Clarifai classification error:', error);
    
    // Fallback to basic classification
    console.log('Using basic fallback classification');
    return {
      category: 'TOPS',
      styles: ['Casual'],
      confidence: 0.5,
      description: 'Clarifai classification failed, using default TOPS',
      colors: ['Unknown'],
      reasoning: 'Clarifai failed, using fallback classification'
    };
  }
}

async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log('Starting background removal...');
    
    // Convert buffer to Uint8Array for Blob creation
    const uint8Array = new Uint8Array(imageBuffer);
    const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('image_file', blob, 'image.jpg');
    formData.append('size', 'auto');

    console.log('Calling remove.bg API...');

    const response = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      formData,
      {
        headers: {
          'X-Api-Key': process.env.REMOVEBG_API_KEY!,
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'arraybuffer',
        timeout: 15000
      }
    );

    console.log('Background removal successful');

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Background removal error:', error);
    console.log('Background removal failed, using original image');
    return imageBuffer;
  }
}
