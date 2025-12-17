'use client';

import React, { useRef, useState } from 'react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCapture: (file: File) => void;
  onFileUpload: (file: File) => void;
}

export default function UploadModal({ isOpen, onClose, onPhotoCapture, onFileUpload }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
      onClose();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera API not supported in this browser. Please use Chrome, Firefox, or Safari.');
        return;
      }

      // Set camera active first to render the video element
      setIsCameraActive(true);
      
      // Wait for the ref to be available with multiple attempts
      let attempts = 0;
      while (!videoRef.current && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }

      // Check if video ref exists first
      if (!videoRef.current) {
        console.error('Video ref is null after waiting, attempts:', attempts);
        setIsCameraActive(false);
        alert('Camera component not ready. Please refresh and try again.');
        return;
      }

      // Try different camera configurations
      let stream = null;
      const constraints = [
        { video: { facingMode: 'environment' } },
        { video: { facingMode: 'user' } },
        { video: true }
      ];

      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (err) {
          console.log('Trying next constraint...', err);
        }
      }

      if (!stream) {
        throw new Error('No camera available');
      }

      streamRef.current = stream;
      
      // Now videoRef.current should exist
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Video stream set:', stream);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play().then(() => {
            console.log('Video playing successfully');
            setIsCameraActive(true);
          }).catch(err => {
            console.error('Video play failed:', err);
            setIsCameraActive(true); // Still show video even if play fails
          });
        };

        // Fallback timeout
        setTimeout(() => {
          if (!isCameraActive) {
            console.log('Forcing camera active state');
            setIsCameraActive(true);
          }
        }, 2000);
      } else {
        console.error('Video ref is null after getting stream');
        alert('Camera component error. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // More specific error messages
      if (error.name === 'NotAllowedError') {
        alert('Camera access denied. Please allow camera permissions in your browser settings and refresh the page.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera found. Please connect a camera and try again.');
      } else if (error.name === 'NotSupportedError') {
        alert('Camera not supported. Please use a secure connection (https://) or localhost.');
      } else {
        alert(`Camera error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            onPhotoCapture(file);
            stopCamera();
            onClose();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (isCameraActive) {
        stopCamera();
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => {
            if (isCameraActive) {
              stopCamera();
            }
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {!isCameraActive ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Got a new clothes?</h2>
              <p className="text-gray-600">Choose how you want to add it to your wardrobe</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
              >
                Take a Photo
              </button>

              <div className="text-center text-gray-500 font-medium">
                or
              </div>

              <button
                onClick={handleUploadClick}
                className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
              >
                Upload
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        ) : (
          <>
            {/* Camera View */}
            <div className="relative">
              <div className="w-full h-64 bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg"
                  style={{ display: isCameraActive ? 'block' : 'none' }}
                />
                {!isCameraActive && (
                  <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Starting camera...</p>
                  </div>
                )}
              </div>
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>

            {/* Camera Controls */}
            <div className="flex gap-4">
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 bg-green-400 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
              >
                Capture
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
