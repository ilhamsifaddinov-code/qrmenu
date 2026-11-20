import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Printer, Check, Download, BookmarkCheck } from 'lucide-react';
import { Order, Language } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, formatPrice } from '../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  lang: Language;
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  lang,
  order,
  onClose,
}) => {
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Auto-save order into customer receipts history
  useEffect(() => {
    if (isOpen && order) {
      try {
        const stored = localStorage.getItem('cafe_customer_receipts');
        const list: Order[] = stored ? JSON.parse(stored) : [];
        if (!list.some((r) => r.id === order.id)) {
          const updated = [order, ...list];
          localStorage.setItem('cafe_customer_receipts', JSON.stringify(updated));
        }
        setIsSaved(true);
      } catch (err) {
        console.warn('Could not auto-save receipt:', err);
      }
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const t = translations[lang] || translations.qr;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveReceipt = () => {
    // Copy plain text receipt to clipboard
    const itemsText = (order.items || [])
      .map((i) => `${getFoodTitle(i?.food, lang)} x${i?.quantity || 1} - ${formatPrice((i?.food?.price || 0) * (i?.quantity || 1))}`)
      .join('\n');

    const receiptText = `================================\n` +
      `   CAKEBUMER & QARAQALPAQ MENU   \n` +
      `================================\n` +
      `ÇEK: ${order.id}\n` +
      `STOL: №${order.tableNumber}\n` +
      `VAQT: ${order.createdAt || new Date().toLocaleTimeString()}\n` +
      `--------------------------------\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `JAMI: ${formatPrice(order.totalAmount)}\n` +
      `HOLATI: QABULLAP ALINDI\n` +
      `================================\n` +
      `Raxmet! Xosh kelipsiz!\n`;

    try {
      navigator.clipboard.writeText(receiptText);
    } catch (e) {
      console.warn(e);
    }

    setSavedNotification(lang === 'qr' ? 'Çek nusxalandı hám "Meniń çeklerim" bólimine saqlandı!' : 'Chek nusxalandi va "Mening cheklarim" bo\'limiga saqlandi!');
    setTimeout(() => setSavedNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#18181b] text-zinc-100 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-zinc-900 text-zinc-100 p-4 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif font-bold text-lg text-emerald-400">
              {lang === 'qr' ? 'Buyırtpa tastıyıqlandı' : t.paymentSuccess || 'Buyurtma tasdiqlandi'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Jabıw"
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/90 mx-auto flex items-center justify-center text-emerald-400 border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-8 h-8" aria-hidden="true" />
            </div>

            {/* Prominent Order Received Heading as requested */}
            <div>
              <h4 className="font-serif font-bold text-xl sm:text-2xl text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                {t.orderReceivedTitle || 'Buyırtpa qabıllap alındı!'}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-md mx-auto leading-relaxed">
                {t.orderReceivedSub || 'Buyırtpańız tastıyıqlanıp, qabıllap alındı! Asxana hám aficiant komandasına jetkerildi.'}
              </p>
            </div>

            {/* Notification when saved */}
            {savedNotification && (
              <div className="bg-emerald-500/20 text-emerald-300 text-xs font-bold p-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 animate-fadeIn">
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <span>{savedNotification}</span>
              </div>
            )}

            {/* Printable Receipt Card */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-amber-500/30 text-left text-xs space-y-2.5 font-mono shadow-inner text-zinc-300">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="font-bold text-zinc-200">{t.receiptTitle || 'TÓLEM ÇEKI'}</span>
                <span className="text-amber-400 font-extrabold text-sm">{order.id}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>{t.tableNumber || 'Stol nomeri'}:</span>
                <span className="font-bold text-zinc-100 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Stol №{order.tableNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                <span>Vaqt:</span>
                <span>{order.createdAt || new Date().toLocaleTimeString()}</span>
              </div>
              
              <div className="border-t border-zinc-800 pt-2 space-y-1.5">
                {(order.items || []).map((i, idx) => (
                  <div key={i?.food?.id || idx} className="flex justify-between text-zinc-300">
                    <span className="truncate pr-2">
                      {getFoodTitle(i?.food, lang)} <span className="text-amber-400 font-bold">x{i?.quantity || 1}</span>
                    </span>
                    <span className="font-bold text-zinc-200 shrink-0">
                      {formatPrice((i?.food?.price || 0) * (i?.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-zinc-800 pt-2 flex justify-between font-bold text-sm text-zinc-100">
                <span className="text-amber-300 font-serif">{t.total || 'Jámi'}:</span>
                <span className="text-amber-400 font-extrabold text-base">{formatPrice(order.totalAmount)}</span>
              </div>

              <div className="pt-1 text-center text-[10px] text-zinc-500 italic">
                Nukus Cakebumer & Qaraqalpaq Menu. Raxmet!
              </div>
            </div>

            {/* Info notice about finding receipt later */}
            <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              💡 Ushbu chek avtomatik tarzda <b>"Meniń çeklerim"</b> bo'limida saqlandi. Istalgan vaqtda tepada menyudan qayta ochishingiz mumkin!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition shadow"
              >
                <Printer className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>{t.printReceipt || 'Çekti baspadan shıǵarıw'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveReceipt}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition"
              >
                <BookmarkCheck className="w-4 h-4 text-zinc-950" aria-hidden="true" />
                <span>Nusxalaw & Saqlaw</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 py-2 rounded-xl font-bold text-xs transition border border-zinc-800"
            >
              {t.close || 'Jabıw'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
