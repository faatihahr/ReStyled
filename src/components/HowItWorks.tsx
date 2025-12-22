"use client";

import { motion } from "framer-motion";
import { Camera, Brain, TrendingUp, Recycle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: "Snap photos of your clothes",
      description: "Build your digital closet by photographing your clothing items. Our AI automatically categorizes and analyzes each piece.",
    },
    {
      icon: Brain,
      title: "Get Smart Suggestions",
      description: "Our AI-powered mix & match features create outfit combinations you never thought of, tailored to your style preferences.",
    },
    {
      icon: TrendingUp,
      title: "Track Your Wear",
      description: "See which items you wear most and which are forgotten. Get insights to make the most of your wardrobe.",
    },
    {
      icon: Recycle,
      title: "Reduce Fashion Waste",
      description: "Wear what you own! Make conscious fashion choices by maximizing your existing wardrobe.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-rockia">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-merriweather-sans">
            Get started in minutes and transform your wardrobe experience
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <step.icon className="text-green-500" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-600 font-merriweather-sans">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl transform rotate-2"></div>
              <div className="relative bg-white rounded-2xl p-4 shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-400 text-lg">App Demo Here</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
