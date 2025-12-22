'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { preferencesService } from '@/services/preferencesService';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [formData, setFormData] = useState({
    gender: '',
    style: '',
    height: '',
    weight: '',
    skinUndertone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (!userData) {
          window.location.href = '/login';
          return;
        }
        setUser(userData);

        // Fetch user preferences
        const userPreferences = await preferencesService.getUserPreferences(userData.id);
        if (userPreferences) {
          setPreferences(userPreferences);
          const styleValue = Array.isArray(userPreferences.style)
            ? (userPreferences.style[0] || '')
            : (userPreferences.style || '');
          setFormData({
            gender: userPreferences.gender || '',
            style: styleValue,
            height: userPreferences.height || '',
            weight: userPreferences.weight || '',
            skinUndertone: userPreferences.skin_undertone || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      if (user) {
        await preferencesService.saveUserPreferences({
          user_id: user.id,
          gender: formData.gender,
          style: formData.style,
          height: formData.height,
          weight: formData.weight,
          skin_undertone: formData.skinUndertone
        });
        setMessage('Preferensi berhasil diperbarui!');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Gagal menyimpan preferensi. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#aace67] via-pink-100 to-[#ffa4a4] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#aace67] via-pink-100 to-[#ffa4a4]">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-white hover:text-gray-200 transition"
            >
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          {/* User Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Informasi Akun</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Nama:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
            </div>
          </div>

          {/* Preferences Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Preferensi Gaya</h2>
            <p className="text-gray-600 mb-6">
              Update preferensi gaya Anda untuk meningkatkan akurasi rekomendasi AI
            </p>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('berhasil') 
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              {/* Style Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Preference
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent"
                >
                  <option value="">Pilih Style</option>
                  <option value="Casual">Casual</option>
                  <option value="Classic">Classic</option>
                  <option value="Chic">Chic</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Preppy">Preppy</option>
                  <option value="Vintage Retro">Vintage Retro</option>
                  <option value="Y2K">Y2K</option>
                  <option value="Minimalist">Minimalist</option>
                </select>
              </div>

              {/* Body Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent"
                    placeholder="65"
                  />
                </div>
              </div>

              {/* Skin Undertone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Undertone
                </label>
                <select
                  value={formData.skinUndertone}
                  onChange={(e) => handleInputChange('skinUndertone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent"
                >
                  <option value="">Pilih Skin Undertone</option>
                  <option value="Cool">Cool</option>
                  <option value="Warm">Warm</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#aace67] text-white px-6 py-3 rounded-lg hover:bg-[#9bc55f] disabled:bg-gray-400 transition"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Preferensi'}
                </button>
                <Link
                  href="/dashboard"
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                >
                  Batal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
