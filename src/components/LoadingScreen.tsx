import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.random() * 25 + 10;
        return Math.min(100, prev + step);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && progress >= 100) {
      const timer = setTimeout(() => {
        setShouldRender(false);
        if (onFinish) onFinish();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress, onFinish]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF5EF] text-[#2E1E17] transition-opacity duration-700 select-none ${
        !isLoading && progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Center Branding Content */}
      <div className="flex flex-col items-center text-center px-6 max-w-sm w-full animate-fadeIn">
        {/* Line-art Logo: Cake slice & Coffee Cup matching Image 3 */}
        <div className="mb-6 relative w-28 h-24 flex items-center justify-center">
          <svg
            viewBox="0 0 120 100"
            fill="none"
            stroke="#8D5B44"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-[#8D5B44]"
          >
            {/* Coffee Saucer */}
            <ellipse cx="80" cy="74" rx="28" ry="7" stroke="#C0684C" strokeWidth="2" opacity="0.6" />
            {/* Coffee Cup */}
            <path d="M64 48 H96 V66 C96 73 90 77 80 77 C70 77 64 73 64 66 Z" fill="#F4ECE1" />
            {/* Cup Handle */}
            <path d="M96 52 C104 52 105 64 95 64" />
            {/* Coffee steam lines */}
            <path d="M74 41 C74 37 77 35 77 31" stroke="#C0684C" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M83 41 C83 37 86 35 86 31" stroke="#C0684C" strokeWidth="1.5" strokeDasharray="2 2" />

            {/* Cake Slice */}
            <path d="M16 66 L54 36 L68 52 L16 80 Z" fill="#FFFFFF" />
            {/* Cake back / side */}
            <path d="M54 36 L16 66 V80 L68 52 V38" />
            {/* Cake layer line */}
            <path d="M16 73 L68 45" stroke="#C0684C" strokeWidth="2" />
            {/* Cream dollop on top */}
            <path
              d="M54 34 C52 28 58 24 57 20 C59 23 62 27 59 34"
              fill="#C0684C"
              stroke="#8D5B44"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-[0.25em] text-[#2E1E17] uppercase mb-1">
          LA PÂTISSERIE
        </h1>
        <p className="text-xs sm:text-sm font-sans font-medium tracking-[0.22em] text-[#8D6B58] uppercase mb-10">
          DESSERT & COFFEE CAFÉ
        </p>

        {/* Loading status & Subtitle */}
        <div className="w-full flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#8D6B58] uppercase mb-1">
            LOADING...
          </span>
          <span className="text-xs text-[#A88B77] mb-4 font-sans">
            Preparing your menu...
          </span>

          {/* Smooth Terracotta Progress Bar matching Image 3 */}
          <div className="w-56 sm:w-64 h-1.5 bg-[#EAE0D4] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#B95C3C] to-[#C0684C] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
