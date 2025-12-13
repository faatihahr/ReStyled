"use client";

import { useEffect } from 'react';

export default function CalendarPage() {
  useEffect(() => {
    window.location.href = '/dashboard/calendar';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#aace67] via-pink-100 to-[#ffa4a4] flex items-center justify-center" style={{ fontFamily: 'Merriweather, serif' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to Calendar...</p>
      </div>
    </div>
  );
}
