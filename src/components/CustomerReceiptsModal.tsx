import React, { useState } from 'react';
import { X, FileText, Printer, Trash2, ChevronRight, Clock, CheckCircle } from 'lucide-react';
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
    if (window.confirm(lang === 'qr' ? 'Barlıq saqlanǵan çeklerdi óshiresiz be?' : 'Barcha saqlangan cheklarni o\'chirishni xohlaysizmi?')) {
      setReceipts([]);
      localStorage.removeItem('cafe_customer_receipts');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#18181b] text-zinc-100 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-zinc-900 text-zinc-100 p-4 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-lg text-amber-300">
              {t.myReceipts || 'Meniń çeklerim'}
            </h3>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
              {receipts.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {receipts.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/10 transition"
              >
                Tazalaw
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close || 'Jabıw'}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {receipts.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-amber-500/30 mx-auto flex items-center justify-center text-3xl">
                🧾
              </div>
              <p className="font-serif font-bold text-sm text-zinc-300">
                {t.noSavedReceipts || 'Házirshe saqlanǵan çekler joq.'}
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Taǵam buyırtpa berip tastıyıqlaǵanıńızdan keyin, barlıq çeklerińiz usı jerde avtomat saqlanıp baradı.
              </p>
            </div>
          ) : (
            receipts.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectReceipt(rec)}
                className="bg-zinc-900 hover:bg-zinc-850 p-4 rounded-2xl border border-amber-500/25 hover:border-amber-400/60 shadow-md cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-zinc-950 text-[11px] font-black px-2 py-0.5 rounded font-mono">
                      Stol №{rec.tableNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {rec.id}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.createdAt || 'Vaqt belgilanmagan'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 truncate">
                    {(rec.items || []).map((i) => `${getFoodTitle(i?.food, lang)} x${i?.quantity || 1}`).join(', ')}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-extrabold text-amber-400 font-mono">
                      {formatPrice(rec.totalAmount)}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                      ✓ {t.orderReceivedTitle || 'Buyırtpa qabıllandı'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteReceipt(rec.id, e)}
                    className="p-2 rounded-xl bg-zinc-950 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Óshiriw"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition">
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
