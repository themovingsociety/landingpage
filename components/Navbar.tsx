"use client";

import { useState } from "react";

interface NavbarProps {
  logo?: string;
  links?: Array<{ label: string; href: string }>;
}

export default function Navbar({
  logo = "The MOVING Society.",
  links = [],
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const defaultLinks = [
    { label: "Portfolio", href: "#portfolio" },
    { label: "Contact", href: "#contact" },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 relative">
          {/* Hamburger Menu - Left */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-700 hover:text-gray-900 z-10"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a
              href="/"
              className="sm:text-base md:text-3xl font-antic text-gray-900"
            >
              {logo.split("MOVING").map((part, index) => {
                if (index === 0) {
                  return (
                    <span key={index}>
                      {part}
                      <span className="">Moving</span>
                    </span>
                  );
                } else {
                  const parts = part.split(".");
                  return (
                    <span key={index}>
                      {parts[0]}
                      <span className="text-[#9F8C5A]">.</span>
                    </span>
                  );
                }
              })}
            </a>
          </div>

          {/* Navigation Links - Right */}
          <div className="hidden md:flex items-center space-x-8 ml-auto">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="nav-link-hover text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Spacer for mobile to center logo */}
          <div className="md:hidden w-10" />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 text-gray-700 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
