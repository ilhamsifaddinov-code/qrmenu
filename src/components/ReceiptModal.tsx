import React, { useState } from 'react';
import { X, CheckCircle, Printer, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  if (!isOpen || !order) return null;

  const t = translations[lang] || translations.qr;

  const handleSaveReceipt = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#18181b] text-zinc-100 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-zinc-900 text-zinc-100 p-4 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif font-bold text-lg text-emerald-400">Zakaz tastıyıqlandı</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 mx-auto flex items-center justify-center text-emerald-400 border border-emerald-500/50">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-serif font-bold text-xl text-emerald-400">
                {t.paymentSuccess || 'Zakaz áwmetli qabıllandı!'}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Zakazıńız aficiant hám asxana komandasına jetkerildi!
              </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-amber-500/30 text-left text-xs space-y-2 font-mono shadow-inner text-zinc-300">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold">{t.receiptTitle || 'ÇEK:'}</span>
                <span className="text-amber-400 font-extrabold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.tableNumber || 'Stol nomeri'}:</span>
                <span className="font-bold text-zinc-100">Stol №{order.tableNumber}</span>
              </div>
              
              <div className="border-t border-zinc-800 pt-2 space-y-1">
                {(order.items || []).map((i, idx) => (
                  <div key={i?.food?.id || idx} className="flex justify-between text-zinc-400">
                    <span>{getFoodTitle(i?.food, lang)} x{i?.quantity || 1}</span>
                    <span>{formatPrice((i?.food?.price || 0) * (i?.quantity || 1))}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-sm text-zinc-100">
                <span>{t.total || 'Jámi'}:</span>
                <span className="text-amber-400 font-extrabold">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveReceipt}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-zinc-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Saqlandı!</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Çek saqlaw</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2.5 rounded-xl font-bold text-xs shadow transition"
              >
                Jabıw
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
