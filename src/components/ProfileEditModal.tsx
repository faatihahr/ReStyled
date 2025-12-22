'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedProfile: any) => void;
}

export default function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState(user?.profile_picture || user?.user_metadata?.profile_picture || '');
  const [headerImage, setHeaderImage] = useState(user?.header_image || user?.user_metadata?.header_image || '');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update states when user data changes, but don't overwrite local file previews
  // Keep dependency array stable (only `user`) to avoid HMR/react-refresh warnings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) {
      setName(user?.name || '');
      setUsername(user?.username || '');

      // Only set profile/header images from user if the user hasn't selected a new file locally
      if (!profileImageFile) {
        setProfileImage(user?.profile_picture || user?.user_metadata?.profile_picture || '');
      }
      if (!headerImageFile) {
        setHeaderImage(user?.header_image || user?.user_metadata?.header_image || '');
      }
    }
  }, [user]);

  // Debug: Log the user data to see what fields are available
  console.log('ProfileEditModal user data:', user);
  console.log('Header image from user:', user?.header_image, user?.user_metadata?.header_image);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use object URL for immediate preview and keep the File for upload
      const objectUrl = URL.createObjectURL(file);
      setProfileImage(objectUrl);
      setProfileImageFile(file);
    }
  };

  const handleHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setHeaderImage(objectUrl);
      setHeaderImageFile(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Upload images if new File objects were selected
      let profileImageUrl = profileImage;
      let headerImageUrl = headerImage;

      if (profileImageFile) {
        try {
          const profileFormData = new FormData();
          profileFormData.append('file', profileImageFile);

          const profileResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${await authService.getToken()}`,
            },
            body: profileFormData,
            signal: AbortSignal.timeout(30000),
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            profileImageUrl = profileData.url;
          } else {
            console.error('Profile image upload failed');
          }
        } catch (uploadError) {
          console.error('Profile image upload error:', uploadError);
        }
      }

      if (headerImageFile) {
        try {
          const headerFormData = new FormData();
          headerFormData.append('file', headerImageFile);

          const headerResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${await authService.getToken()}`,
            },
            body: headerFormData,
            signal: AbortSignal.timeout(30000),
          });

          if (headerResponse.ok) {
            const headerData = await headerResponse.json();
            headerImageUrl = headerData.url;
          } else {
            console.error('Header image upload failed');
          }
        } catch (uploadError) {
          console.error('Header image upload error:', uploadError);
        }
      }

      const updatedProfile = {
        name,
        username,
        profile_picture: profileImageUrl,
        header_image: headerImageUrl
      };
      
      onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert data URL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto font-merriweather">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          
          {/* Profile Preview */}
          <div className="mb-6">
          <div className="bg-gradient-to-r from-green-200 to-blue-200 h-24 rounded-lg relative mb-4">
            {headerImage && (
              <img 
                src={headerImage} 
                alt="Header" 
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageChange}
                  className="hidden"
                />
                <span className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  Change Header
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </label>
            </div>
            <div>
              <h3 className="font-semibold">{name || 'Your Name'}</h3>
              <p className="text-gray-500 text-sm">@{username || 'username'}</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your username"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
