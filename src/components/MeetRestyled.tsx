"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function MeetRestyled() {
  return (
    <section id="about" className="py-4 bg-gradient-to-br from-pink-50 to-purple-50 pb-20">
      <div className="mx-auto">
        {/* Pattern Background */}
        <div className="mb-2 overflow-hidden w-full">
          <motion.div 
            className="flex space-x-8 whitespace-nowrap w-[3000px]"
            animate={{ x: [0, -2000] }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {[...Array(10)].map((_, i) => (
              <Image
                key={i}
                src="/images/ReStyled-removebg-preview.png"
                alt="ReStyled Logo"
                width={200}
                height={50}
                className="object-contain inline-block"
              />
            ))}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-rockia">
              Meet ReStyled
            </h2>
            <div className="space-y-4 text-lg text-gray-600 font-merriweather-sans">
              <p>
                ReStyled is your personal AI fashion stylist that revolutionizes how you interact with your wardrobe. 
                Say goodbye to outfit dilemmas and hello to endless styling possibilities.
              </p>
              <p>
                Our intelligent algorithm learns your style preferences, analyzes your clothing items, and creates 
                personalized outfit combinations that match your taste, occasion, and lifestyle.
              </p>
              <p>
                Whether you're getting ready for work, a special event, or just want to refresh your daily look, 
                ReStyled ensures you always step out in style.
              </p>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl transform -rotate-2"></div>
              <div className="relative bg-white rounded-2xl p-4 shadow-xl">
                <div className="aspect-video rounded-xl overflow-hidden relative">
                  <Image
                    src="/images/1e3655e496998529b1b9b35f284c3891.jpg"
                    alt="ReStyled team showing fashion app"
                    fill
                    className="object-cover"
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
