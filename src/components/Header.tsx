import React, { useState } from 'react';
import { Bell, FileText, ShoppingBag, User, Globe, Shield, CheckCircle, QrCode } from 'lucide-react';
import { Language, User as UserType } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  tableNumber: string;
  onTableChange?: (newTable: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenQrCode: () => void;
  onOpenReceipts?: () => void;
  receiptsCount?: number;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  onCallWaiter: (type: 'waiter' | 'bill') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  tableNumber,
  cartCount,
  onOpenCart,
  onOpenQrCode,
  onOpenReceipts,
  receiptsCount = 0,
  isAdminView,
  onToggleAdminView,
  onCallWaiter,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const t = translations[lang];

  const triggerCall = (type: 'waiter' | 'bill') => {
    onCallWaiter(type);
    const msg = type === 'waiter' ? t.waiterCalledMsg : t.billRequestedMsg;
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#18181b]/95 backdrop-blur-md text-zinc-100 border-b-2 border-amber-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      {/* Top Bar with National Palette and Language Selector */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-serif text-2xl font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] border-2 border-amber-200">
            Q
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg sm:text-2xl text-amber-300 tracking-wide leading-tight drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              {t.appName}
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-medium">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Table Badge & Fixed QR Code Button */}
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs sm:text-sm shadow-inner">
          <span className="font-semibold text-amber-400">{t.tableNumber}</span>
          <span className="font-bold text-base text-zinc-100">{tableNumber}</span>
          <button
            type="button"
            onClick={onOpenQrCode}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/40 font-bold text-xs transition active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            title={t.viewQrCode || 'Mening QR Kodım'}
            aria-label={t.viewQrCode || 'QR Kodni ochish'}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span className="hidden sm:inline">{t.viewQrCode || 'QR Kodım'}</span>
          </button>
        </div>

        {/* Right Utility Buttons (Lang, User, Admin) */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-zinc-950/80 rounded-xl p-1 border border-amber-500/20 shadow-inner backdrop-blur-sm" role="group" aria-label="Til tanlash">
            {(['qr', 'uz', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onLanguageChange(l)}
                aria-label={`Tilni o'zgartirish: ${l.toUpperCase()}`}
                className={`px-2.5 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all duration-300 flex items-center justify-center min-w-[32px] ${
                  lang === l
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-[0_2px_10px_rgba(245,158,11,0.4)] scale-105'
                    : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/50'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Admin toggle */}
          <button
            type="button"
            onClick={onToggleAdminView}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              isAdminView
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
            title={t.adminLogin}
            aria-label={isAdminView ? "Admin paneldan chiqish" : (t.adminLogin || "Admin panelga kirish")}
          >
            <Shield className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span className="hidden md:inline font-bold">Admin</span>
          </button>
        </div>
      </div>

      {/* Service Action Bar: Call Waiter, Request Bill, Open Cart */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 bg-[#121212]">
        <div className="flex items-center gap-2">
          {/* Call Waiter */}
          <button
            type="button"
            onClick={() => triggerCall('waiter')}
            aria-label={t.callWaiter}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300 transition active:scale-95"
          >
            <Bell className="w-4 h-4 animate-bounce text-zinc-950" aria-hidden="true" />
            <span>{t.callWaiter}</span>
          </button>

          {/* Request Bill */}
          <button
            type="button"
            onClick={() => triggerCall('bill')}
            aria-label={t.requestBill}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm border border-amber-500/30 transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>{t.requestBill}</span>
          </button>

          {/* My Receipts */}
          {onOpenReceipts && (
            <button
              type="button"
              onClick={onOpenReceipts}
              aria-label={t.myReceipts || 'Meniń çeklerim'}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm border border-amber-500/30 transition active:scale-95"
              title={t.myReceipts || 'Meniń çeklerim'}
            >
              <FileText className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span className="hidden sm:inline">{t.myReceipts || 'Meniń çeklerim'}</span>
              <span className="sm:hidden">Çekler</span>
              {receiptsCount > 0 && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-500/40">
                  {receiptsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Cart Button */}
        <button
          type="button"
          onClick={onOpenCart}
          aria-label={`${t.cartTitle}: ${cartCount} taom`}
          className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-[0_0_18px_rgba(245,158,11,0.45)] border border-amber-200 transition active:scale-95"
        >
          <ShoppingBag className="w-4 h-4 text-zinc-950" aria-hidden="true" />
          <span>{t.cartTitle}</span>
          {cartCount > 0 && (
            <span className="bg-zinc-950 text-amber-300 text-xs font-extrabold px-2 py-0.5 rounded-full border border-amber-400">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Instant Notification Banner for Waiter Call */}
      {notification && (
        <div role="status" aria-live="polite" className="bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-inner border-t border-amber-500/40 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>{notification}</span>
        </div>
      )}
    </header>
  );
};
