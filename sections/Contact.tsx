"use client";

import { useState } from "react";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";
import type { ContactContent } from "@/types/cms";

function TitleWithFade({ title }: { title: string }) {
  const { ref, isInView } = useInView();

  const splitIntoWords = (text: string) => {
    return text.split(/\s+/).filter((word) => word.length > 0);
  };

  const words = splitIntoWords(title);

  return (
    <div className="text-center mb-4" ref={ref}>
      <h2 className="text-4xl md:text-5xl text-gray-900 font-cormorant">
        {words.map((word, wordIndex) => (
          <span
            key={wordIndex}
            className={
              isInView ? "word-fade-in inline-block" : "inline-block opacity-0"
            }
            style={{
              animationDelay: isInView ? `${wordIndex * 0.3}s` : "0s",
            }}
          >
            {word}
            {wordIndex < words.length - 1 && "\u00A0"}
          </span>
        ))}
      </h2>
    </div>
  );
}

interface ContactProps {
  content: ContactContent;
}

export default function Contact({ content }: ContactProps) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    location: "",
    comments: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se manejaría el envío del formulario
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 px-8 bg-[#ffffff]">
      <div className="max-w-2xl mx-auto">
        {/* Top Divider */}
        <div className="w-full h-px bg-[#9F8C5A] mb-32"></div>

        {/* Title */}
        <TitleWithFade title={content.title} />
        <div className="w-24 h-px bg-[#9F8C5A] mx-auto mb-8"></div>

        {/* Subtitle */}
        <p className="text-center text-gray-700 mb-12 font-antic">
          {content.subtitle.split("\n").map((line, index) => (
            <span key={index}>
              {line}
              {index < content.subtitle.split("\n").length - 1 && <br />}
            </span>
          ))}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-[#D9D9D9] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors font-antic"
            required
          />
          <input
            type="text"
            name="fullName"
            placeholder="Your Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-[#D9D9D9] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors font-antic"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Where you are from"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-[#D9D9D9] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors font-antic"
            required
          />
          <textarea
            name="comments"
            placeholder="Your comments"
            value={formData.comments}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-[#D9D9D9] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition-colors resize-none font-antic"
            required
          />
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-3 bg-white border border-[#000000] text-gray-900 hover:bg-[#9F8C5A] hover:text-white transition-all duration-200 font-antic"
            >
              Send
            </button>
          </div>
        </form>

        {/* Email */}
        <div className="text-center mb-8">
          <a
            href={`mailto:${content.email}`}
            className="text-gray-900 hover:underline font-antic"
          >
            {content.email}
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-12">
          {content.instagram && (
            <a
              href={content.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:opacity-70 transition-opacity"
              aria-label="Instagram"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          <a
            href={`mailto:${content.email}`}
            className="text-gray-900 hover:opacity-70 transition-opacity"
            aria-label="Email"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>
        </div>

        {/* Bottom Divider */}
        <div className="w-full h-px bg-[#9F8C5A] mb-32"></div>

        {/* Footer */}
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="TIS Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Tagline */}
          <p className="text-gray-900 font-antic text-sm md:text-base mb-8 tracking-wide">
            IN CONSTANT MOTION
          </p>

          {/* Copyright and Links */}
          <div className="space-y-2 text-gray-900 font-cormorant text-sm">
            <p>© The Moving Society. All rights reserved.</p>
            <div className="flex justify-center items-center gap-2">
              <a href="#" className="hover:underline">
                Terms
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Privacy
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
