import { NextRequest, NextResponse } from 'next/server';
import { cnnClassifier } from '@/lib/cnnClassifier';

export async function POST(request: NextRequest) {
  try {
    const { epochs = 10 } = await request.json();
    
    console.log(`Starting CNN training with ${epochs} epochs...`);
    
    // Start training
    await cnnClassifier.trainModel(epochs);
    
    return NextResponse.json({ 
      success: true, 
      message: `Model training completed with ${epochs} epochs` 
    });
  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json(
      { success: false, error: 'Training failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'CNN Classifier training endpoint',
    usage: 'POST with { epochs: number } to start training'
  });
}
