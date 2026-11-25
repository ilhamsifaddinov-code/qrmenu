import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Printer, BookmarkCheck } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && order) {
      try {
        const stored = localStorage.getItem('cafe_customer_receipts');
        const list: Order[] = stored ? JSON.parse(stored) : [];
        if (!list.some((r) => r.id === order.id)) {
          const updated = [order, ...list];
          localStorage.setItem('cafe_customer_receipts', JSON.stringify(updated));
        }
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
    const itemsText = (order.items || [])
      .map(
        (i) =>
          `${getFoodTitle(i?.food, lang)} x${i?.quantity || 1} - ${formatPrice(
            (i?.food?.price || 0) * (i?.quantity || 1)
          )}`
      )
      .join('\n');

    const receiptText =
      `================================\n` +
      `   CAKE BUMER - DESSERT CAFÉ    \n` +
      `================================\n` +
      `CHEK: ${order.id}\n` +
      `STOL: №${order.tableNumber}\n` +
      `VAQT: ${order.createdAt || new Date().toLocaleTimeString()}\n` +
      `--------------------------------\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `JAMI: ${formatPrice(order.totalAmount)}\n` +
      `HOLATI: QABUL QILINDI\n` +
      `================================\n` +
      `Cake Bumer Dessert Café. Rahmat!\n`;

    try {
      navigator.clipboard.writeText(receiptText);
    } catch (e) {
      console.warn(e);
    }

    setSavedNotification(
      lang === 'qr'
        ? 'Çek nusxalandı hám "Meniń çeklerim" bólimine saqlandı!'
        : 'Chek nusxalandi va "Mening cheklarim" bo\'limiga saqlandi!'
    );
    setTimeout(() => setSavedNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E1E17]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FAF5EF] text-[#2E1E17] rounded-3xl border border-[#EAE0D4] shadow-[0_10px_40px_rgba(46,30,23,0.25)] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-[#EAE0D4] flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2E1E17]">
              {t.orderReceivedTitle || 'Buyurtma qabul qilindi!'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="p-1.5 rounded-full bg-[#F1EAE0] text-[#2E1E17] hover:bg-[#EAE0D4] transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-700 border border-emerald-300 shadow-2xs">
              <CheckCircle className="w-8 h-8" aria-hidden="true" />
            </div>

            <div>
              <h4 className="font-serif font-bold text-lg sm:text-xl text-[#2E1E17]">
                {t.orderReceivedTitle || 'Buyurtma qabul qilindi!'}
              </h4>
              <p className="text-xs text-[#8D6B58] mt-1 max-w-sm mx-auto leading-relaxed">
                {t.orderReceivedSub ||
                  "Buyurtmangiz tasdiqlanib, qabul qilindi! Oshxona jamoasiga yetkazildi."}
              </p>
            </div>

            {savedNotification && (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 animate-fadeIn">
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                <span>{savedNotification}</span>
              </div>
            )}

            {/* Receipt Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#EAE0D4] text-left text-xs space-y-2.5 font-mono shadow-xs text-[#2E1E17]">
              <div className="flex justify-between items-center border-b border-[#F0E7DD] pb-2">
                <div className="flex items-center gap-1.5">
                  <img src="/logo.png" alt="Cake Bumer" className="w-5 h-5 object-contain" />
                  <span className="font-bold text-[#2E1E17] font-sans">
                    {lang === 'qr' ? 'CAKE BUMER ÇEKI' : 'CAKE BUMER CHEKI'}
                  </span>
                </div>
                <span className="text-[#C0684C] font-extrabold text-sm">{order.id}</span>
              </div>
              <div className="flex justify-between items-center text-[#8D6B58]">
                <span>{t.tableNumber || (lang === 'qr' ? 'Stol nomeri' : 'Stol raqami')}:</span>
                <span className="font-bold text-[#2E1E17] bg-[#F1EAE0] px-2 py-0.5 rounded border border-[#E6DDD2]">
                  Stol №{order.tableNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#8D6B58] text-[11px]">
                <span>{lang === 'qr' ? 'Waqıt:' : 'Vaqt:'}</span>
                <span>{order.createdAt || new Date().toLocaleTimeString()}</span>
              </div>

              <div className="border-t border-[#F0E7DD] pt-2 space-y-1.5">
                {(order.items || []).map((i, idx) => (
                  <div key={i?.food?.id || idx} className="flex justify-between text-[#2E1E17]">
                    <span className="truncate pr-2">
                      {getFoodTitle(i?.food, lang)}{' '}
                      <span className="text-[#C0684C] font-bold">x{i?.quantity || 1}</span>
                    </span>
                    <span className="font-bold shrink-0">
                      {formatPrice((i?.food?.price || 0) * (i?.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#EAE0D4] pt-2 flex justify-between font-bold text-sm text-[#2E1E17]">
                <span className="font-serif">{t.total || 'Jami'}:</span>
                <span className="text-[#C0684C] font-extrabold text-base">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>

              <div className="pt-1 text-center text-[10px] text-[#8D6B58] italic font-sans">
                Cake Bumer Dessert Café. {lang === 'qr' ? 'Raxmet!' : 'Rahmat!'}
              </div>
            </div>

            <p className="text-[11px] text-[#8D6B58] bg-white p-2.5 rounded-xl border border-[#EAE0D4]">
              {t.receiptAutoSavedHint ||
                (lang === 'qr'
                  ? '💡 Bul çek avtomat túrde "Meniń çeklerim" bóliminde saqlandı.'
                  : '💡 Ushbu chek avtomatik ravishda "Mening cheklarim" bo\'limida saqlandi.')}
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 bg-white hover:bg-[#FAF5EF] text-[#2E1E17] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#EAE0D4] transition shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#8D6B58]" aria-hidden="true" />
                <span>{t.printReceipt || (lang === 'qr' ? 'Baspadan shıǵarıw' : 'Chop etish')}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveReceipt}
                className="flex-1 bg-[#C0684C] hover:bg-[#B05B3F] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4 text-white" aria-hidden="true" />
                <span>{t.copyReceipt || (lang === 'qr' ? 'Nusxalaw & Saqlaw' : 'Nusxalash & Saqlash')}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#F1EAE0] hover:bg-[#EAE0D4] text-[#2E1E17] py-2.5 rounded-xl font-bold text-xs transition border border-[#E6DDD2]"
            >
              {t.close || 'Yopish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
