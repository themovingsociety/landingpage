"use client";

import { useInView } from "@/hooks/useInView";
import type { PortfolioContent } from "@/types/cms";

interface PortfolioProps {
  content: PortfolioContent;
}

export default function Portfolio({ content }: PortfolioProps) {
  const { ref, isInView } = useInView();

  // Dividir el título en líneas y luego en palabras
  const titleLines = content.title.split("\n").filter((line) => line.trim());

  const splitIntoWords = (text: string) => {
    return text.split(/\s+/).filter((word) => word.length > 0);
  };

  // Calcular el índice global de cada palabra para el delay
  let globalWordIndex = 0;

  return (
    <section id="portfolio" className="pt-56 pb-0 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Top Section - Main Title */}
        <div className="text-center mb-12" ref={ref}>
          <h2
            className="text-[30px] text-gray-900 font-antic mb-6 text-center"
            style={{ lineHeight: "50px" }}
          >
            {titleLines.map((line, lineIndex) => {
              const words = splitIntoWords(line);
              return (
                <span key={lineIndex} className="block">
                  {words.map((word, wordIndex) => {
                    const currentIndex = globalWordIndex++;
                    return (
                      <span
                        key={wordIndex}
                        className={
                          isInView
                            ? "word-fade-in inline-block"
                            : "inline-block opacity-0"
                        }
                        style={{
                          animationDelay: isInView
                            ? `${currentIndex * 0.3}s`
                            : "0s",
                        }}
                      >
                        {word}
                        {wordIndex < words.length - 1 && "\u00A0"}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </h2>
          <div className="w-24 h-px bg-[#9F8C5A] mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl text-gray-700 font-cormorant">
            {content.subtitle}
          </p>
        </div>

        {/* Image Collage Grid - 6 fotos: 3 arriba, 1 medio (ancho completo), 2 abajo */}
        <div className="px-8 md:px-12 lg:px-20 py-8 md:py-12 lg:py-14 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-8">
            {/* Fila 1: 3 imágenes arriba */}
            {content.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="md:col-span-2 relative overflow-hidden group cursor-pointer aspect-square"
              >
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-4xl">📷</div>
                  )}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              </div>
            ))}

            {/* Fila 2: 1 imagen en el medio (ancho completo) */}
            {content.items[3] && (
              <div className="md:col-span-6 relative overflow-hidden group cursor-pointer aspect-video">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  {content.items[3].image ? (
                    <img
                      src={content.items[3].image}
                      alt={content.items[3].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-4xl">📷</div>
                  )}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              </div>
            )}

            {/* Fila 3: 2 imágenes abajo */}
            {content.items.slice(4, 6).map((item) => (
              <div
                key={item.id}
                className="md:col-span-3 relative overflow-hidden group cursor-pointer aspect-square"
              >
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-4xl">📷</div>
                  )}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-xl md:text-2xl text-gray-900 font-cormorant mb-6">
              Selected. Private by nature.
            </p>
          </div>
        </div>

        {/* Bottom Section - Closing Text */}
      </div>
    </section>
  );
}
