import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface LoadingScreenProps {
  isLoading: boolean;
  lang?: Language;
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, lang = 'uz', onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [shouldRender, setShouldRender] = useState(true);
  const t = translations[lang] || translations.uz;

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
      {/* Center Branding Content with Cake Bumer Logo */}
      <div className="flex flex-col items-center text-center px-6 max-w-sm w-full animate-fadeIn">
        {/* Official Cake Bumer Logo from User Upload */}
        <div className="mb-4 relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Cake Bumer Logo"
            className="w-full h-full object-contain drop-shadow-sm rounded-3xl"
          />
        </div>

        {/* Loading status & Subtitle - Clean localized text without mixed English */}
        <div className="w-full flex flex-col items-center mt-2">
          <span className="text-xs font-semibold tracking-wider text-[#8D6B58] mb-4 font-sans">
            {t.loadingMenu || 'Menyu yuklanmoqda...'}
          </span>

          {/* Smooth Terracotta Progress Bar */}
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
