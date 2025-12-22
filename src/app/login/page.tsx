'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, LoginCredentials, AuthResponse } from '@/services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeIndex, setActiveIndex] = useState(1); // Start with middle circle active
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const images = [
    { src: '/images/loginPage/download (8).jpg', alt: 'Outfit 1' },
    { src: '/images/loginPage/download (9).jpg', alt: 'Outfit 2' },
    { src: '/images/loginPage/download (10).jpg', alt: 'Outfit 3' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    if (message) setSuccessMessage(message);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const credentials: LoginCredentials = { email, password };
      const response: AuthResponse = await authService.login(credentials);
      
      // Redirect to dashboard/home
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#aace67] via-pink-100 to-[#ffa4a4] flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-full gap-12 px-8">
        
        {/* Left side - Outfit images */}
        <div className="hidden lg:flex items-center justify-center space-x-12 w-4/6">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            const scale = isActive ? 1.3 : 0.8;
            const zIndex = isActive ? 10 : 1;
            
            return (
              <div
                key={index}
                className="w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-xl transition-all duration-1000 ease-in-out"
                style={{
                  transform: `scale(${scale})`,
                  zIndex: zIndex,
                  opacity: isActive ? 1 : 0.6
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={256}
                  height={256}
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>

        {/* Right side - Login form */}
        <div className="bg-[#d8d8d8] rounded-2xl p-10 w-full lg:w-2/6 shadow-2xl font-merriweather">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-rockia">
              Let's ReStyled Your Outfit!
            </h1>
            <p className="text-gray-600">
              Sign in to access your digital wardrobe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email/Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent transition duration-200 cursor-text"
                placeholder="Enter your email or username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent transition duration-200 cursor-text"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#aace67] hover:bg-[#9bc55f] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:ring-offset-2 focus:ring-offset-[#d8d8d8] disabled:transform-none"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-700">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-[#aace67] hover:text-[#9bc55f] font-medium transition duration-200"
              >
                Create Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
