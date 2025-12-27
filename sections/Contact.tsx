"use client";

import { useState } from "react";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";
import type { ContactContent } from "@/types/cms";
import { contactFormSchema, type ContactFormData } from "@/lib/contact-schema";

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
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    country: "",
    sports: "",
    hobbiesAndInterests: "",
    business: "",
    lastTrips: "",
    comments: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar el error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof ContactFormData]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
    // Limpiar el estado de envío cuando el usuario modifique el formulario
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitStatus({ type: null, message: "" });

    // Validar con Zod
    const validationResult = contactFormSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      for (const err of validationResult.error.issues) {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Web3Forms access key - debe estar en .env.local como NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

      if (!accessKey) {
        throw new Error(
          "Web3Forms is not configured. Please contact the administrator."
        );
      }

      // Preparar los datos para Web3Forms
      const web3FormData = new FormData();
      web3FormData.append("access_key", accessKey);
      web3FormData.append("subject", `Request Access - ${formData.name}`);
      web3FormData.append("from_name", formData.name);
      web3FormData.append("email", formData.email);
      web3FormData.append("name", formData.name);
      web3FormData.append("country", formData.country);
      web3FormData.append("sports", formData.sports);
      web3FormData.append(
        "hobbies_and_interests",
        formData.hobbiesAndInterests
      );
      web3FormData.append("business", formData.business);
      web3FormData.append("last_trips", formData.lastTrips);
      web3FormData.append("comments", formData.comments);

      // Enviar directamente a Web3Forms desde el cliente
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3FormData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send email");
      }

      setSubmitStatus({
        type: "success",
        message: "Your request has been sent successfully!",
      });

      // Limpiar el formulario
      setFormData({
        name: "",
        email: "",
        country: "",
        sports: "",
        hobbiesAndInterests: "",
        business: "",
        lastTrips: "",
        comments: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.name
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors font-antic`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.email
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors font-antic`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.country
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors font-antic`}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.country}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="sports"
              placeholder="Sports"
              value={formData.sports}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.sports
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors font-antic`}
            />
            {errors.sports && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.sports}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="hobbiesAndInterests"
              placeholder="Hobbies and interests"
              value={formData.hobbiesAndInterests}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.hobbiesAndInterests
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors font-antic`}
            />
            {errors.hobbiesAndInterests && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.hobbiesAndInterests}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="business"
              placeholder="Business"
              value={formData.business}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.business
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors font-antic`}
            />
            {errors.business && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.business}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="lastTrips"
              placeholder="Last trips"
              value={formData.lastTrips}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.lastTrips
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors font-antic`}
            />
            {errors.lastTrips && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.lastTrips}
              </p>
            )}
          </div>

          <div>
            <textarea
              name="comments"
              placeholder="Your comments"
              value={formData.comments}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 bg-white border ${
                errors.comments
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-gray-900"
              } text-gray-900 placeholder-gray-500 focus:outline-none transition-colors resize-none font-antic`}
            />
            {errors.comments && (
              <p className="mt-1 text-sm text-red-500 font-antic">
                {errors.comments}
              </p>
            )}
          </div>

          {submitStatus.type && (
            <div
              className={`p-3 text-center font-antic ${
                submitStatus.type === "success"
                  ? "text-green-700 bg-green-50 border border-green-200"
                  : "text-red-700 bg-red-50 border border-red-200"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-white border border-[#000000] text-gray-900 hover:bg-[#9F8C5A] hover:text-white transition-all duration-200 font-antic disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send"}
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
