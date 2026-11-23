import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Send, Instagram, ArrowUpRight } from 'lucide-react';
import { Language, AppSettings } from '../types';
import { translations } from '../i18n/translations';
import { NationalOrnamentHeader } from './NationalOrnament';

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
  const rawTg = settings?.telegramUsername || 'sifaddinov';
  const cleanTg = rawTg
    .replace(/^https?:\/\/(www\.)?t\.me\//i, '')
    .replace(/^https?:\/\/(www\.)?telegram\.me\//i, '')
    .replace(/^t\.me\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
    .trim() || 'sifaddinov';
  const tgUrl = `https://t.me/${cleanTg}`;

  const rawInsta = settings?.instagramUsername || 'sifaddinovv';
  const cleanInsta = rawInsta
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
    .trim() || 'sifaddinovv';
  const instaUrl = `https://instagram.com/${cleanInsta}`;

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
    <footer className="mt-12 bg-[#18181b] text-zinc-100 border-t border-amber-500/30">
      <NationalOrnamentHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-serif text-2xl font-bold border border-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              Q
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]">{t.appName}</h3>
              <p className="text-xs text-zinc-400">Nukus Cakebumer & Milliy Taǵamlar</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Aral boyı hám Qaraqalpaqstan milliy dástúrxan lezzetlerin zamonaviy 3D hám QR-kod online menyu arqalı usınamız.
          </p>
        </div>

        {/* Location & Address */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-base text-amber-300 border-b border-amber-500/20 pb-1.5">
            📍 {t.locationTitle}
          </h4>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.address}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>{t.workingHours}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>{t.phoneContact}</span>
            </div>
          </div>
        </div>

        {/* Map Location Preview & Socials */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-base text-amber-300 border-b border-amber-500/20 pb-1.5">
            🗺️ Karta hám Tarmaqlar
          </h4>

          {/* Interactive Map card */}
          <div className="relative h-28 rounded-2xl overflow-hidden border border-amber-500/30 group">
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
              className="absolute bottom-2 right-2 bg-zinc-950/90 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-500/40 flex items-center gap-1 shadow"
            >
              <span>{t.openInMaps}</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>

          {/* Social Icons with Desktop Hover Tooltip & Mobile Tap reveal */}
          <div ref={socialsRef} className="flex items-center gap-4 pt-2">
            {/* Telegram Icon Button */}
            <div className="relative group">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTelegramClick}
                onMouseEnter={() => setActiveTooltip('telegram')}
                onMouseLeave={() => setActiveTooltip(null)}
                aria-label={`Telegram: @${cleanTg}`}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 hover:from-sky-500 hover:to-sky-300 text-white flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(56,189,248,0.35)] hover:scale-110 active:scale-95 border border-sky-300/40 cursor-pointer"
              >
                <Send className="w-5 h-5 text-white" aria-hidden="true" />
              </a>

              {/* Tooltip */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 transition-all duration-300 ${
                  activeTooltip === 'telegram'
                    ? 'opacity-100 visible translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 invisible translate-y-2 scale-95 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto'
                }`}
              >
                <div className="bg-zinc-950/95 backdrop-blur-md border border-sky-400/60 shadow-[0_4px_25px_rgba(0,0,0,0.85)] rounded-xl px-3.5 py-2 whitespace-nowrap text-center">
                  <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Send className="w-3 h-3" />
                    <span>Telegram</span>
                  </div>
                  <a
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-extrabold text-zinc-100 hover:text-sky-300 flex items-center justify-center gap-1 transition mt-0.5"
                  >
                    <span>@{cleanTg}</span>
                    <ArrowUpRight className="w-3 h-3 text-sky-400" />
                  </a>
                  <div className="text-[9px] text-zinc-400 mt-0.5 sm:hidden font-sans">
                    {lang === 'qr' ? 'Kiriw ushın basıń' : 'Kirish uchun bosing'}
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-zinc-950 border-r border-b border-sky-400/60 transform rotate-45 mx-auto -mt-1.5" />
              </div>
            </div>

            {/* Instagram Icon Button */}
            <div className="relative group">
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleInstagramClick}
                onMouseEnter={() => setActiveTooltip('instagram')}
                onMouseLeave={() => setActiveTooltip(null)}
                aria-label={`Instagram: @${cleanInsta}`}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 hover:opacity-95 text-white flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.35)] hover:scale-110 active:scale-95 border border-pink-300/40 cursor-pointer"
              >
                <Instagram className="w-5 h-5 text-white" aria-hidden="true" />
              </a>

              {/* Tooltip */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 transition-all duration-300 ${
                  activeTooltip === 'instagram'
                    ? 'opacity-100 visible translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 invisible translate-y-2 scale-95 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto'
                }`}
              >
                <div className="bg-zinc-950/95 backdrop-blur-md border border-pink-400/60 shadow-[0_4px_25px_rgba(0,0,0,0.85)] rounded-xl px-3.5 py-2 whitespace-nowrap text-center">
                  <div className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Instagram className="w-3 h-3" />
                    <span>Instagram</span>
                  </div>
                  <a
                    href={instaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-extrabold text-zinc-100 hover:text-pink-300 flex items-center justify-center gap-1 transition mt-0.5"
                  >
                    <span>@{cleanInsta}</span>
                    <ArrowUpRight className="w-3 h-3 text-pink-400" />
                  </a>
                  <div className="text-[9px] text-zinc-400 mt-0.5 sm:hidden font-sans">
                    {lang === 'qr' ? 'Kiriw ushın basıń' : 'Kirish uchun bosing'}
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-zinc-950 border-r border-b border-pink-400/60 transform rotate-45 mx-auto -mt-1.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 text-center py-3.5 text-[11px] text-zinc-400 border-t border-zinc-800 font-mono">
        © 2026 Qaraqalpaq Menu & Nukus Cakebumer. Barlıq huqıqlar qorǵalǵan.
      </div>
    </footer>
  );
};
