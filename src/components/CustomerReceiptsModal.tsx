import React, { useState } from 'react';
import { X, FileText, Trash2, ChevronRight, Clock } from 'lucide-react';
import { Order, Language } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, formatPrice } from '../utils/formatters';

interface CustomerReceiptsModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSelectReceipt: (order: Order) => void;
}

export const CustomerReceiptsModal: React.FC<CustomerReceiptsModalProps> = ({
  isOpen,
  lang,
  onClose,
  onSelectReceipt,
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.qr;
  const [receipts, setReceipts] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('cafe_customer_receipts');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const handleDeleteReceipt = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = receipts.filter((r) => r.id !== orderId);
    setReceipts(updated);
    try {
      localStorage.setItem('cafe_customer_receipts', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        lang === 'qr'
          ? 'Barlıq saqlanǵan sheklerdi óshiresiz be?'
          : "Barcha saqlangan cheklarni o'chirishni xohlaysizmi?"
      )
    ) {
      setReceipts([]);
      localStorage.removeItem('cafe_customer_receipts');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E1E17]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF5EF] text-[#2E1E17] rounded-3xl border border-[#EAE0D4] shadow-[0_10px_40px_rgba(46,30,23,0.25)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-[#EAE0D4] flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C0684C]" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2E1E17]">
              {t.myReceipts || 'Mening cheklarim'}
            </h3>
            <span className="bg-[#C0684C] text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {receipts.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {receipts.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-[#C0684C] hover:text-[#A9563C] px-2 py-1 rounded-lg border border-[#C0684C]/30 hover:bg-[#FAF5EF] transition cursor-pointer"
              >
                {t.clearAll || (lang === 'qr' ? 'Tazalaw' : 'Tozalash')}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close || 'Yopish'}
              className="p-1.5 rounded-full bg-[#F1EAE0] text-[#2E1E17] hover:bg-[#EAE0D4] transition"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {receipts.length === 0 ? (
            <div className="py-12 text-center text-[#8D6B58] space-y-3">
              <div className="w-16 h-16 rounded-full bg-white border border-[#EAE0D4] mx-auto flex items-center justify-center text-3xl shadow-xs">
                🧾
              </div>
              <p className="font-serif font-bold text-sm text-[#2E1E17]">
                {t.noSavedReceipts || 'Hozircha saqlangan cheklar mavjud emas.'}
              </p>
              <p className="text-xs text-[#8D6B58] max-w-xs mx-auto">
                {t.noSavedReceiptsSub ||
                  (lang === 'qr'
                    ? 'Buyırtpa berip tastıyıqlaǵanıńızdan keyin, barlıq sheklerińiz usı jerde avtomat saqlanıp baradı.'
                    : 'Buyurtma tasdiqlangandan so\'ng, barcha cheklaringiz avtomatik tarzda shu yerda saqlanadi.')}
              </p>
            </div>
          ) : (
            receipts.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectReceipt(rec)}
                className="bg-white hover:bg-[#FAF5EF] p-4 rounded-2xl border border-[#EAE0D4] hover:border-[#C0684C]/40 shadow-xs cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#2E1E17] text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {t.tableNumber || (lang === 'qr' ? 'Ústel №' : 'Stol №')} {rec.tableNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#C0684C]">
                      {rec.id}
                    </span>
                    <span className="text-[10px] text-[#8D6B58] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.createdAt || (lang === 'qr' ? 'Waqıt belgilengen' : 'Vaqt belgilanmagan')}
                    </span>
                  </div>

                  <p className="text-xs text-[#6C5343] truncate">
                    {(rec.items || [])
                      .map((i) => `${getFoodTitle(i?.food, lang)} x${i?.quantity || 1}`)
                      .join(', ')}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-extrabold text-[#2E1E17]">
                      {formatPrice(rec.totalAmount)}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {lang === 'qr' ? '✓ Qabıllandı' : '✓ Qabul qilindi'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteReceipt(rec.id, e)}
                    className="p-2 rounded-xl text-[#8D6B58] hover:text-[#C0684C] hover:bg-[#FAF5EF] transition cursor-pointer"
                    title={lang === 'qr' ? 'Óshiriw' : 'O\'chirish'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-xl bg-[#FAF5EF] text-[#C0684C] group-hover:bg-[#C0684C] group-hover:text-white transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
