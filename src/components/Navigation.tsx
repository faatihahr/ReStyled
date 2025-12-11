"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("how-it-works");

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "how-it-works", name: "how-it-works" },
        { id: "about", name: "about" }, 
        { id: "contact", name: "contact" }
      ];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.name);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-white z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-center items-center h-24 relative">
          {/* Logo - Centered on mobile, left-centered on desktop */}
          <div className="flex items-center space-x-12 px-4">
            <div className="flex-shrink-0 h-24">
              <Image
                src="/images/ReStyled-removebg-preview.svg"
                alt="ReStyled Logo"
                width={200}
                height={100}
                className="object-contain w-48 h-24"
                loading="eager"
              />
            </div>

            {/* Desktop Navigation - Next to logo */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("how-it-works");
                }}
                href="#how-it-works" 
                className={`relative text-lg font-bold transition-colors pb-1 cursor-pointer font-bavex ${
                  activeSection === "how-it-works" ? "text-green-500" : "text-gray-700 hover:text-green-500"
                }`}
              >
                How it Works
                {activeSection === "how-it-works" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
                )}
              </a>
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("about");
                }}
                href="#about" 
                className={`relative text-lg font-bold transition-colors pb-1 cursor-pointer font-bavex ${
                  activeSection === "about" ? "text-green-500" : "text-gray-700 hover:text-green-500"
                }`}
              >
                About Us
                {activeSection === "about" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
                )}
              </a>
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("contact");
                }}
                href="#contact" 
                className={`relative text-lg font-bold transition-colors pb-1 cursor-pointer font-bavex ${
                  activeSection === "contact" ? "text-green-500" : "text-gray-700 hover:text-green-500"
                }`}
              >
                Contact Us
                {activeSection === "contact" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
                )}
              </a>
            </div>
          </div>

          {/* Mobile menu button - Absolute positioned on the right */}
          <div className="md:hidden absolute right-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-500 p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <a
              href="#how-it-works"
              className={`block px-3 py-2 rounded-md text-base font-bold transition-colors font-bavex ${
                activeSection === "how-it-works" 
                  ? "text-green-500 bg-green-50" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-green-500"
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("how-it-works");
              }}
            >
              How it Works
            </a>
            <a
              href="#about"
              className={`block px-3 py-2 rounded-md text-base font-bold transition-colors font-bavex ${
                activeSection === "about" 
                  ? "text-green-500 bg-green-50" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-green-500"
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("about");
              }}
            >
              About Us
            </a>
            <a
              href="#contact"
              className={`block px-3 py-2 rounded-md text-base font-bold transition-colors font-bavex ${
                activeSection === "contact" 
                  ? "text-green-500 bg-green-50" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-green-500"
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("contact");
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}