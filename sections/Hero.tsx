import type { HeroContent } from "@/types/cms";

interface HeroProps {
  content: HeroContent;
}

export default function Hero({ content }: HeroProps) {
  const titleLines = content.title.split("\n").filter((line) => line.trim());

  const splitIntoWords = (text: string) => {
    return text.split(/\s+/).filter((word) => word.length > 0);
  };

  // Calcular el índice global de cada palabra para el delay
  let globalWordIndex = 0;

  return (
    <section className="min-h-screen flex flex-col md:flex-row pt-16 md:pt-20">
      {/* Left Section - Text Content */}
      <div className="w-full md:w-1/3 bg-white flex items-center justify-center px-8 md:px-12 py-16 md:py-0">
        <div className="max-w-md w-full md:-mt-16">
          <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl text-gray-900 text-center mb-8 leading-tight md:leading-[70px]">
            {titleLines.map((line, lineIndex) => {
              const words = splitIntoWords(line);
              return (
                <span
                  key={lineIndex}
                  className={
                    lineIndex === titleLines.length - 1 ? "block" : "block"
                  }
                >
                  {words.map((word, wordIndex) => {
                    const currentIndex = globalWordIndex++;
                    return (
                      <span
                        key={wordIndex}
                        className="word-fade-in inline-block"
                        style={{
                          animationDelay: `${currentIndex * 0.3}s`,
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
          </h1>
          {content.subtitle && (
            <p className="text-lg md:text-xl text-gray-600 mb-8 font-cormorant">
              {content.subtitle}
            </p>
          )}
          <div className="flex justify-center">
            <a
              href={content.ctaLink}
              className="inline-flex items-center gap-3 px-6 py-3 border border-[#000000] text-[#000000] font-antic hover:bg-[#9F8C5A] hover:text-white transition-all duration-200 group"
            >
              <span>{content.ctaText}</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Right Section - Videos */}
      <div className="w-full md:w-2/3 flex flex-row">
        {content.images && content.images.length > 0 ? (
          content.images.map((videoSrc, index) => {
            return (
              <div
                key={index}
                className="relative overflow-hidden flex-1 h-screen"
              >
                <video
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })
        ) : (
          // Placeholder cuando no hay imágenes
          <div className="flex-1 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                className="w-24 h-24 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Imagen del Hero</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
