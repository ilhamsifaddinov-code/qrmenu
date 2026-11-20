import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Send, Instagram } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { NationalOrnamentHeader } from './NationalOrnament';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang] || translations.qr;

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

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href="https://t.me/sifaddinov"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram orqali bog'lanish: @sifaddinov"
              className="bg-sky-600/90 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold transition border border-sky-400/40 shadow hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4 text-white" aria-hidden="true" />
              <span>@sifaddinov</span>
            </a>

            <a
              href="https://instagram.com/sifaddinovv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram orqali bog'lanish: sifaddinovv"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold transition border border-pink-400/40 shadow hover:scale-105 active:scale-95"
            >
              <Instagram className="w-4 h-4 text-white" aria-hidden="true" />
              <span>sifaddinovv</span>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 text-center py-3.5 text-[11px] text-zinc-400 border-t border-zinc-800 font-mono">
        © 2026 Qaraqalpaq Menu & Nukus Cakebumer. Barlıq huqıqlar qorǵalǵan.
      </div>
    </footer>
  );
};
