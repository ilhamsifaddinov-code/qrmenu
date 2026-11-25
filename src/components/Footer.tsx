import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Send, Instagram, ArrowUpRight } from 'lucide-react';
import { Language, AppSettings } from '../types';
import { translations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
  settings?: AppSettings;
}

export const Footer: React.FC<FooterProps> = ({ lang, settings }) => {
  const t = translations[lang] || translations.qr;

  // Active tooltip state for mobile touch support
  const [activeTooltip, setActiveTooltip] = useState<'telegram' | 'instagram' | null>(null);
  const socialsRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (socialsRef.current && !socialsRef.current.contains(e.target as Node)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Format and clean usernames and URLs robustly
  const rawTg =
    settings && typeof settings.telegramUsername === 'string'
      ? settings.telegramUsername
      : 'sifaddinov';
  const cleanTg = (rawTg || '')
    .replace(/^https?:\/\/(www\.)?t\.me\//i, '')
    .replace(/^https?:\/\/(www\.)?telegram\.me\//i, '')
    .replace(/^t\.me\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
    .trim();
  const hasTg = cleanTg.length > 0;
  const tgUrl = hasTg ? `https://t.me/${cleanTg}` : '';

  const rawInsta =
    settings && typeof settings.instagramUsername === 'string'
      ? settings.instagramUsername
      : 'sifaddinovv';
  const cleanInsta = (rawInsta || '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
    .trim();
  const hasInsta = cleanInsta.length > 0;
  const instaUrl = hasInsta ? `https://instagram.com/${cleanInsta}` : '';

  const handleTelegramClick = (e: React.MouseEvent) => {
    const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
    if (isTouch && activeTooltip !== 'telegram') {
      e.preventDefault();
      setActiveTooltip('telegram');
    }
  };

  const handleInstagramClick = (e: React.MouseEvent) => {
    const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
    if (isTouch && activeTooltip !== 'instagram') {
      e.preventDefault();
      setActiveTooltip('instagram');
    }
  };

  return (
    <footer className="mt-12 bg-white text-[#2E1E17] border-t border-[#EAE0D4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EF] text-[#2E1E17] flex items-center justify-center font-serif text-xl font-bold border border-[#EAE0D4] shadow-2xs">
              🍰
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2E1E17]">
                LA PÂTISSERIE
              </h3>
              <p className="text-xs text-[#8D6B58]">
                {t.subTitle || 'Cakebumer Dessert & Coffee Café'}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#6C5343] leading-relaxed font-sans">
            Nukus shahridagi shirinliklar, tortlar va premium qahvalar kafesi. Smart QR-menyu orqali qulay va tezkor buyurtma bering.
          </p>
        </div>

        {/* Location & Address */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#2E1E17] border-b border-[#EAE0D4] pb-1.5 uppercase tracking-wide">
            📍 {t.locationTitle || 'Manzil va Ish vaqti'}
          </h4>

          <div className="space-y-2 text-xs text-[#6C5343]">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C0684C] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.address || 'Nukus shahri, Gárezsizlik kóshesi, 45-jay'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C0684C] shrink-0" aria-hidden="true" />
              <span>{t.workingHours || '08:00 - 23:00 (Har kuni)'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C0684C] shrink-0" aria-hidden="true" />
              <span>{t.phoneContact || '+998 (61) 222 77 88'}</span>
            </div>
          </div>
        </div>

        {/* Map Preview & Socials */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#2E1E17] border-b border-[#EAE0D4] pb-1.5 uppercase tracking-wide">
            🗺️ Xarita va Ijtimoiy tarmoqlar
          </h4>

          {/* Interactive Map Card */}
          <div className="relative h-28 rounded-2xl overflow-hidden border border-[#EAE0D4] group shadow-2xs">
            <iframe
              title="Nukus Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d94828.18844898144!2d59.56388481358988!3d42.46026880000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x41dd9a28db98502d%3A0x868b4efcbe3f0c3a!2sNukus%2C%20Karakalpakstan!5e0!3m2!1sen!2s!4v1700000000000"
              className="w-full h-full border-0 grayscale group-hover:grayscale-0 transition duration-300"
              loading="lazy"
            />
            <a
              href="https://maps.google.com/?q=Nukus+Cakebumer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.openInMaps || "Google Xaritada ko'rish"}
              className="absolute bottom-2 right-2 bg-white/95 text-[#2E1E17] text-[10px] font-bold px-2 py-1 rounded-lg border border-[#EAE0D4] flex items-center gap-1 shadow-xs"
            >
              <span>{t.openInMaps || 'Xaritada'}</span>
              <ExternalLink className="w-3 h-3 text-[#C0684C]" aria-hidden="true" />
            </a>
          </div>

          {/* Social Icons */}
          {(hasTg || hasInsta) && (
            <div ref={socialsRef} className="flex items-center gap-3 pt-1">
              {/* Telegram Icon Button */}
              {hasTg && (
                <div className="relative group">
                  <a
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTelegramClick}
                    onMouseEnter={() => setActiveTooltip('telegram')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    aria-label={`Telegram: @${cleanTg}`}
                    className="w-10 h-10 rounded-xl bg-[#2AABEE] text-white flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-white" aria-hidden="true" />
                  </a>

                  {/* Tooltip */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 transition-all duration-200 ${
                      activeTooltip === 'telegram'
                        ? 'opacity-100 visible translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 invisible translate-y-1 scale-95 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto'
                    }`}
                  >
                    <div className="bg-[#2E1E17] text-white shadow-md rounded-xl px-3 py-1.5 whitespace-nowrap text-center">
                      <div className="text-[10px] text-sky-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                        <Send className="w-3 h-3" />
                        <span>Telegram</span>
                      </div>
                      <a
                        href={tgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-white hover:text-sky-300 flex items-center justify-center gap-1 transition mt-0.5"
                      >
                        <span>@{cleanTg}</span>
                        <ArrowUpRight className="w-3 h-3 text-sky-300" />
                      </a>
                    </div>
                    <div className="w-2 h-2 bg-[#2E1E17] transform rotate-45 mx-auto -mt-1" />
                  </div>
                </div>
              )}

              {/* Instagram Icon Button */}
              {hasInsta && (
                <div className="relative group">
                  <a
                    href={instaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleInstagramClick}
                    onMouseEnter={() => setActiveTooltip('instagram')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    aria-label={`Instagram: @${cleanInsta}`}
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] text-white flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Instagram className="w-4 h-4 text-white" aria-hidden="true" />
                  </a>

                  {/* Tooltip */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 transition-all duration-200 ${
                      activeTooltip === 'instagram'
                        ? 'opacity-100 visible translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 invisible translate-y-1 scale-95 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto'
                    }`}
                  >
                    <div className="bg-[#2E1E17] text-white shadow-md rounded-xl px-3 py-1.5 whitespace-nowrap text-center">
                      <div className="text-[10px] text-pink-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                        <Instagram className="w-3 h-3" />
                        <span>Instagram</span>
                      </div>
                      <a
                        href={instaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-white hover:text-pink-300 flex items-center justify-center gap-1 transition mt-0.5"
                      >
                        <span>@{cleanInsta}</span>
                        <ArrowUpRight className="w-3 h-3 text-pink-300" />
                      </a>
                    </div>
                    <div className="w-2 h-2 bg-[#2E1E17] transform rotate-45 mx-auto -mt-1" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FAF5EF] text-center py-3.5 text-[11px] text-[#8D6B58] border-t border-[#EAE0D4] font-sans">
        © 2026 La Pâtisserie & Nukus Cakebumer. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
};
