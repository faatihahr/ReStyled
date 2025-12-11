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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check your permissions.');
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
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg mb-4"
              />
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
