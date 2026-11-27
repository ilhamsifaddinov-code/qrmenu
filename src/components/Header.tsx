import React, { useState, useEffect } from 'react';
import { Bell, FileText, ShoppingBag, Shield, CheckCircle, QrCode, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { formatPrice } from '../utils/formatters';

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
  activeOrdersCount?: number;
  totalActiveAmount?: number;
  waiterCooldown?: number;
  onStartWaiterCooldown?: (sec: number) => void;
  waiterOnTheWayMessage?: string | null;
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
  activeOrdersCount = 0,
  totalActiveAmount = 0,
  waiterCooldown: externalWaiterCooldown,
  onStartWaiterCooldown,
  waiterOnTheWayMessage,
}) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [isConfirmWaiterOpen, setIsConfirmWaiterOpen] = useState(false);
  const [isConfirmBillOpen, setIsConfirmBillOpen] = useState(false);
  const [isNoOrdersAlertOpen, setIsNoOrdersAlertOpen] = useState(false);
  const [localWaiterCooldown, setLocalWaiterCooldown] = useState(0);
  const [billCooldown, setBillCooldown] = useState(0);

  const t = translations[lang] || translations.uz;

  const currentWaiterCooldown =
    externalWaiterCooldown !== undefined ? externalWaiterCooldown : localWaiterCooldown;

  // Local Countdown timer for waiter call (if not controlled externally)
  useEffect(() => {
    if (externalWaiterCooldown !== undefined) return;
    if (localWaiterCooldown <= 0) return;
    const interval = setInterval(() => {
      setLocalWaiterCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [localWaiterCooldown, externalWaiterCooldown]);

  // Countdown timer for bill request
  useEffect(() => {
    if (billCooldown <= 0) return;
    const interval = setInterval(() => {
      setBillCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [billCooldown]);

  const handleWaiterBtnClick = () => {
    if (currentWaiterCooldown > 0) {
      const formatted = `0:${currentWaiterCooldown < 10 ? '0' + currentWaiterCooldown : currentWaiterCooldown}`;
      setNotification(`${t.callSentCooldown || 'Chaqiruv yuborildi'} (${formatted})`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsConfirmWaiterOpen(true);
  };

  const handleConfirmWaiter = () => {
    setIsConfirmWaiterOpen(false);
    onCallWaiter('waiter');
    if (onStartWaiterCooldown) {
      onStartWaiterCooldown(45);
    } else {
      setLocalWaiterCooldown(45);
    }
    setNotification(t.waiterCalledMsg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBillBtnClick = () => {
    if (billCooldown > 0) {
      setNotification(`${t.cooldownWait} ${billCooldown}s`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (activeOrdersCount === 0) {
      setIsNoOrdersAlertOpen(true);
      return;
    }
    setIsConfirmBillOpen(true);
  };

  const handleConfirmBill = () => {
    setIsConfirmBillOpen(false);
    onCallWaiter('bill');
    setBillCooldown(45);
    setNotification(t.billRequestedMsg);
    setTimeout(() => setNotification(null), 4000);
  };

  const formattedWaiterTimer = `0:${
    currentWaiterCooldown < 10 ? '0' + currentWaiterCooldown : currentWaiterCooldown
  }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5EF]/95 backdrop-blur-md text-[#2E1E17] border-b border-[#EAE0D4] shadow-[0_2px_15px_rgba(46,30,23,0.04)]">
      {/* Top Bar with Brand Logo and Language Switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 border-b border-[#F0E7DD]/80">
        {/* Brand Title with Official Cake Bumer Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-[#FAF5EF] border border-[#EAE0D4] shadow-xs shrink-0 flex items-center justify-center p-0.5">
            <img
              src="/logo.png"
              alt="Cake Bumer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <h1 className="font-sans font-black text-base sm:text-xl tracking-wider text-[#2E1E17] leading-tight">
              CAKE BUMER
            </h1>
            <p className="text-[10px] sm:text-xs text-[#C0684C] font-bold tracking-wider uppercase">
              {t.subTitle || 'Dessert Café'}
            </p>
          </div>
        </div>

        {/* Table Badge & QR Button */}
        <div className="hidden sm:flex items-center gap-2 bg-[#F1EAE0] px-3 py-1.5 rounded-xl border border-[#E6DDD2] text-xs shadow-sm">
          <span className="font-semibold text-[#8D6B58]">{t.tableNumber || 'Stol №'}</span>
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

        {/* Right Section: Language Switcher + Admin */}
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

          {/* Language Selector Pill */}
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
                className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full transition-all duration-200 ${
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
          {/* Call Waiter with Protection, Cooldown & Real-time Live Timer */}
          <button
            type="button"
            onClick={handleWaiterBtnClick}
            aria-label={t.callWaiter}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold text-xs border transition active:scale-95 shadow-2xs whitespace-nowrap shrink-0 ${
              currentWaiterCooldown > 0
                ? 'bg-[#EAE0D4] text-[#8D6B58] border-[#D8C7B5] cursor-not-allowed opacity-90'
                : 'bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] border-[#E6DDD2]'
            }`}
          >
            <Bell
              className={`w-3.5 h-3.5 shrink-0 ${
                currentWaiterCooldown > 0 ? 'text-[#8D6B58] animate-pulse' : 'text-[#C0684C]'
              }`}
              aria-hidden="true"
            />
            <span>
              {currentWaiterCooldown > 0 ? (
                <span>
                  <span className="hidden sm:inline">{t.callSentCooldown || 'Chaqiruv yuborildi'} </span>
                  <span>({formattedWaiterTimer})</span>
                </span>
              ) : (
                <>
                  <span className="sm:hidden">{t.callWaiterShort || 'Ofitsiant'}</span>
                  <span className="hidden sm:inline">{t.callWaiter}</span>
                </>
              )}
            </span>
          </button>

          {/* Request Bill with Protection & Cooldown */}
          <button
            type="button"
            onClick={handleBillBtnClick}
            aria-label={t.requestBill}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold text-xs border transition active:scale-95 shadow-2xs whitespace-nowrap shrink-0 ${
              billCooldown > 0
                ? 'bg-[#EAE0D4] text-[#8D6B58] border-[#D8C7B5] cursor-not-allowed opacity-80'
                : 'bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] border-[#E6DDD2]'
            }`}
          >
            <FileText
              className={`w-3.5 h-3.5 shrink-0 ${billCooldown > 0 ? 'text-[#8D6B58]' : 'text-[#C0684C]'}`}
              aria-hidden="true"
            />
            <span>
              <span className="sm:hidden">{billCooldown > 0 ? `${billCooldown}s` : (t.requestBillShort || 'Hisob')}</span>
              <span className="hidden sm:inline">
                {t.requestBill}
                {billCooldown > 0 && (
                  <span className="ml-1 text-[10px] font-bold text-[#C0684C]">({billCooldown}s)</span>
                )}
              </span>
            </span>
          </button>

          {/* My Receipts */}
          {onOpenReceipts && (
            <button
              type="button"
              onClick={onOpenReceipts}
              aria-label={t.myReceipts || 'Mening cheklarim'}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold text-xs border border-[#E6DDD2] transition active:scale-95 shadow-2xs whitespace-nowrap shrink-0"
              title={t.myReceipts || 'Mening cheklarim'}
            >
              <FileText className="w-3.5 h-3.5 text-[#C0684C] shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                {t.myReceipts || (lang === 'qr' ? 'Meniń sheklerim' : 'Mening cheklarim')}
              </span>
              <span className="sm:hidden">{t.myReceiptsShort || (lang === 'qr' ? 'Shekler' : 'Cheklar')}</span>
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

      {/* Prominent Live "Ofitsiant yo'lda!" Notification Banner from Admin */}
      {waiterOnTheWayMessage && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald-600 text-white text-xs sm:text-sm font-black px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md animate-fadeIn"
        >
          <CheckCircle className="w-5 h-5 text-white animate-bounce" />
          <span>{waiterOnTheWayMessage}</span>
        </div>
      )}

      {/* Instant Notification Banner */}
      {notification && !waiterOnTheWayMessage && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#C0684C]/15 text-[#2E1E17] text-xs sm:text-sm font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 border-t border-[#C0684C]/30 animate-fadeIn"
        >
          <CheckCircle className="w-4 h-4 text-[#C0684C]" aria-hidden="true" />
          <span>{notification}</span>
        </div>
      )}

      {/* Confirmation Modal: Waiter Call */}
      {isConfirmWaiterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF5EF] border border-[#EAE0D4] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#C0684C]/10 flex items-center justify-center text-[#C0684C]">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#2E1E17]">{t.confirmCallWaiterTitle}</h3>
              <p className="text-xs sm:text-sm text-[#8D6B58] mt-1 leading-relaxed">
                {t.confirmCallWaiterDesc}
              </p>
            </div>
            <div className="bg-[#F1EAE0] py-2 px-4 rounded-xl font-bold text-[#2E1E17] text-xs sm:text-sm border border-[#E6DDD2]">
              {t.tableNumber || 'Stol №'}:{' '}
              <span className="text-[#C0684C] font-extrabold">{tableNumber}</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmWaiterOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-2xl border border-[#EAE0D4] text-[#8D6B58] hover:bg-[#F1EAE0] font-bold text-xs transition cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleConfirmWaiter}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#C0684C] hover:bg-[#B05B3F] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                {t.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Request Bill */}
      {isConfirmBillOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF5EF] border border-[#EAE0D4] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#C0684C]/10 flex items-center justify-center text-[#C0684C]">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#2E1E17]">{t.confirmRequestBillTitle}</h3>
              <p className="text-xs sm:text-sm text-[#8D6B58] mt-1 leading-relaxed">
                {t.confirmRequestBillDesc}
              </p>
            </div>
            <div className="bg-[#F1EAE0] py-2.5 px-4 rounded-xl border border-[#E6DDD2] text-center space-y-0.5">
              <div className="text-[11px] text-[#8D6B58] font-semibold">{t.total}:</div>
              <div className="text-base font-black text-[#C0684C]">
                {formatPrice(totalActiveAmount)} UZS
              </div>
              <div className="text-[11px] text-[#8D6B58]">
                {t.tableNumber || 'Stol №'}:{' '}
                <span className="font-bold text-[#2E1E17]">{tableNumber}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmBillOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-2xl border border-[#EAE0D4] text-[#8D6B58] hover:bg-[#F1EAE0] font-bold text-xs transition cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleConfirmBill}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#C0684C] hover:bg-[#B05B3F] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                {t.confirmYesBill}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal: No Active Orders for Bill */}
      {isNoOrdersAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF5EF] border border-[#EAE0D4] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#2E1E17]">{t.confirmRequestBillTitle}</h3>
              <p className="text-xs sm:text-sm text-[#8D6B58] mt-2 leading-relaxed">
                {t.noActiveOrdersForBill}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsNoOrdersAlertOpen(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#C0684C] hover:bg-[#B05B3F] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                {t.close || 'Yopish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
