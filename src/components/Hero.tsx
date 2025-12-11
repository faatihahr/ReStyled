"use client";

import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-0 relative">
      <div className="grid lg:grid-cols-2 gap-0">
          <div className="relative">
            <Image
              src="/images/33b1bd8be5edab56a55a73e0091d66ae.jpg"
              alt="Fashion models with colorful outfits"
              width={960}
              height={1200}
              className="w-full h-auto object-cover"
              loading="eager"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="relative">
            <Image
              src="/images/1e3655e496998529b1b9b35f284c3891.jpg"
              alt="Women with denim outfits"
              width={960}
              height={1200}
              className="w-full h-auto object-cover"
              loading="eager"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
        
        {/* Overlay Button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Link href="/login">
            <button className="bg-green-500 text-white px-12 py-6 rounded-full text-xl font-semibold hover:bg-green-600 transition-colors shadow-2xl">
              Get Started
            </button>
          </Link>
        </div>
    </section>
  );
}
