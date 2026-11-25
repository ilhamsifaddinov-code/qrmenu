import React, { useState } from 'react';
import { Bell, FileText, ShoppingBag, Shield, CheckCircle, QrCode } from 'lucide-react';
import { Language } from '../types';
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
  const t = translations[lang] || translations.qr;

  const triggerCall = (type: 'waiter' | 'bill') => {
    onCallWaiter(type);
    const msg = type === 'waiter' ? t.waiterCalledMsg : t.billRequestedMsg;
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5EF]/95 backdrop-blur-md text-[#2E1E17] border-b border-[#EAE0D4] shadow-[0_2px_15px_rgba(46,30,23,0.04)]">
      {/* Top Bar with Brand Logo and Language Switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 border-b border-[#F0E7DD]/80">
        {/* Brand Title with Cake Line Art Icon from Image 2 & 3 */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F1EAE0] flex items-center justify-center p-1.5 border border-[#E8DDD1] shadow-sm">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              stroke="#2E1E17"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-[#2E1E17]"
              aria-hidden="true"
            >
              {/* Stand */}
              <path d="M4 31h28" strokeWidth="2.2" />
              {/* Base cake layer */}
              <rect x="6" y="20" width="24" height="11" rx="2" fill="#FFFFFF" />
              <path d="M6 25.5h24" stroke="#C0684C" strokeWidth="1.5" />
              {/* Top cake layer */}
              <rect x="10" y="12" width="16" height="8" rx="2" fill="#FFFFFF" />
              <path d="M10 16h16" stroke="#C0684C" strokeWidth="1.5" />
              {/* Cherry / Candle on top */}
              <circle cx="18" cy="8.5" r="2" fill="#C0684C" stroke="#2E1E17" strokeWidth="1.5" />
              <path d="M18 6.5c1-1.5 2.5-1.5 3.5-0.8" stroke="#2E1E17" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-xl tracking-wider text-[#2E1E17] leading-tight">
              LA PÂTISSERIE
            </h1>
            <p className="text-[10px] sm:text-xs text-[#8D6B58] font-medium tracking-wide">
              {t.subTitle || 'Dessert & Coffee Café'}
            </p>
          </div>
        </div>

        {/* Table Badge & QR Button */}
        <div className="hidden sm:flex items-center gap-2 bg-[#F1EAE0] px-3 py-1.5 rounded-xl border border-[#E6DDD2] text-xs shadow-sm">
          <span className="font-semibold text-[#8D6B58]">{t.tableNumber}</span>
          <span className="font-bold text-sm text-[#2E1E17]">{tableNumber}</span>
          <button
            type="button"
            onClick={onOpenQrCode}
            className="flex items-center gap-1 bg-white hover:bg-[#FAF5EF] text-[#8D6B58] px-2 py-0.5 rounded-lg border border-[#E0D4C7] font-semibold text-[11px] transition shadow-2xs"
            title={t.viewQrCode || 'Mening QR Kodim'}
            aria-label={t.viewQrCode || 'QR Kodni ochish'}
          >
            <QrCode className="w-3.5 h-3.5 text-[#C0684C]" aria-hidden="true" />
            <span>{t.viewQrCode || 'QR-kod'}</span>
          </button>
        </div>

        {/* Right Section: Language Switcher (matching Image 2) + Admin */}
        <div className="flex items-center gap-2">
          {/* Mobile Table Badge */}
          <div className="sm:hidden flex items-center gap-1 bg-[#F1EAE0] px-2 py-1 rounded-xl border border-[#E6DDD2] text-[11px]">
            <span className="font-bold text-[#2E1E17]">№{tableNumber}</span>
            <button
              type="button"
              onClick={onOpenQrCode}
              aria-label="QR Kod"
              className="p-0.5 text-[#C0684C]"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Selector Pill (matching Image 2: rounded pill with dark active indicator) */}
          <div
            className="flex items-center bg-[#F1EAE0] rounded-full p-0.5 border border-[#E6DDD2]"
            role="group"
            aria-label="Til tanlash"
          >
            {(['uz', 'qr', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onLanguageChange(l)}
                aria-label={`Til: ${l.toUpperCase()}`}
                className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all duration-200 ${
                  lang === l
                    ? 'bg-[#2E1E17] text-white shadow-xs'
                    : 'text-[#6C5343] hover:text-[#2E1E17]'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Admin Toggle Button */}
          <button
            type="button"
            onClick={onToggleAdminView}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border text-xs flex items-center gap-1 transition ${
              isAdminView
                ? 'bg-[#C0684C] text-white border-[#C0684C] font-bold shadow-xs'
                : 'bg-[#F1EAE0] text-[#6C5343] border-[#E6DDD2] hover:bg-[#EAE0D4]'
            }`}
            title={t.adminLogin}
            aria-label={isAdminView ? 'Admin paneldan chiqish' : t.adminLogin || 'Admin'}
          >
            <Shield className="w-4 h-4 text-[#C0684C]" aria-hidden="true" />
            <span className="hidden md:inline font-bold">Admin</span>
          </button>
        </div>
      </div>

      {/* Service Action Bar: Call Waiter, Request Bill, My Receipts, Cart */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 bg-[#FAF5EF]/90">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {/* Call Waiter */}
          <button
            type="button"
            onClick={() => triggerCall('waiter')}
            aria-label={t.callWaiter}
            className="flex items-center gap-1.5 bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] px-3 py-1.5 rounded-xl font-semibold text-xs border border-[#E6DDD2] transition active:scale-95 shadow-2xs whitespace-nowrap"
          >
            <Bell className="w-3.5 h-3.5 text-[#C0684C]" aria-hidden="true" />
            <span>{t.callWaiter}</span>
          </button>

          {/* Request Bill */}
          <button
            type="button"
            onClick={() => triggerCall('bill')}
            aria-label={t.requestBill}
            className="flex items-center gap-1.5 bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] px-3 py-1.5 rounded-xl font-semibold text-xs border border-[#E6DDD2] transition active:scale-95 shadow-2xs whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-[#C0684C]" aria-hidden="true" />
            <span>{t.requestBill}</span>
          </button>

          {/* My Receipts */}
          {onOpenReceipts && (
            <button
              type="button"
              onClick={onOpenReceipts}
              aria-label={t.myReceipts || 'Mening cheklarim'}
              className="flex items-center gap-1.5 bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] px-3 py-1.5 rounded-xl font-semibold text-xs border border-[#E6DDD2] transition active:scale-95 shadow-2xs whitespace-nowrap"
              title={t.myReceipts || 'Mening cheklarim'}
            >
              <FileText className="w-3.5 h-3.5 text-[#C0684C]" aria-hidden="true" />
              <span className="hidden sm:inline">{t.myReceipts || 'Mening cheklarim'}</span>
              <span className="sm:hidden">Cheklar</span>
              {receiptsCount > 0 && (
                <span className="bg-[#C0684C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
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
          className="relative flex items-center gap-2 bg-[#C0684C] hover:bg-[#B05B3F] text-white px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition active:scale-95 whitespace-nowrap shrink-0"
        >
          <ShoppingBag className="w-4 h-4 text-white" aria-hidden="true" />
          <span className="hidden xs:inline">{t.cartTitle}</span>
          {cartCount > 0 && (
            <span className="bg-white text-[#C0684C] text-xs font-black px-1.5 py-0.5 rounded-full shadow-xs">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Instant Notification Banner for Waiter Call */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#C0684C]/15 text-[#2E1E17] text-xs sm:text-sm font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 border-t border-[#C0684C]/30 animate-fadeIn"
        >
          <CheckCircle className="w-4 h-4 text-[#C0684C]" aria-hidden="true" />
          <span>{notification}</span>
        </div>
      )}
    </header>
  );
};
