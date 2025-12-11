"use client";

import { motion } from "framer-motion";
import { Instagram, Mail, Music, Send } from "lucide-react";

export function Contact() {
  const socialLinks = [
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Music, label: "TikTok", href: "#" },
    { icon: Mail, label: "Email", href: "#" },
    { icon: Send, label: "Contact", href: "#" },
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-8">Contact Us</h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Ready to transform your wardrobe experience? Get in touch with our team 
              and start your AI-powered styling journey today.
            </p>

            {/* Social Links */}
            <div className="flex justify-center space-x-6 mb-12">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-md mx-auto"
            >
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Get Early Access
                </button>
              </div>
            </motion.div>

            {/* Copyright */}
            <div className="mt-16 pt-8 border-t border-gray-800">
              <p className="text-gray-400">
                © 2024 ReStyled. All rights reserved. Transform your wardrobe with AI.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
