import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { CartItem, Language } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  lang: Language;
  tableNumber: string;
  items: CartItem[];
  isSubmitting?: boolean;
  onClose: () => void;
  onUpdateQuantity: (foodId: string, quantity: number) => void;
  onRemoveItem: (foodId: string) => void;
  onProceedPayment: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  lang,
  tableNumber,
  items,
  isSubmitting = false,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedPayment,
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.qr;

  const totalAmount = (items || []).reduce(
    (sum, item) => sum + (item?.food?.price || 0) * (item?.quantity || 1),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#18181b] text-zinc-100 h-full shadow-[0_0_50px_rgba(0,0,0,0.9)] border-l border-amber-500/40 flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="bg-zinc-900 text-zinc-100 p-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-lg text-amber-300">{t.cartTitle}</h3>
            <span className="bg-amber-500/10 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
              {t.tableNumber} {tableNumber}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close || 'Savatni yopish'}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Content - Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-3xl">
                🍲
              </div>
              <p className="font-serif font-semibold text-sm leading-relaxed">
                {t.emptyCart}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const title = getFoodTitle(item?.food, lang);

              return (
                <div
                  key={item?.food?.id}
                  className="bg-zinc-900 p-3 rounded-2xl border border-amber-500/25 shadow-md flex items-center justify-between gap-3"
                >
                  <img
                    src={item?.food?.imageUrl}
                    alt={title}
                    width="56"
                    height="56"
                    className="w-14 h-14 rounded-xl object-cover border border-amber-500/30"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-zinc-100 truncate">
                      {title}
                    </h4>
                    <p className="text-xs font-extrabold text-amber-400 mt-0.5">
                      {formatPrice(item?.food?.price)}
                    </p>
                    {item?.note && (
                      <p className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded italic mt-1 truncate border border-amber-500/20">
                        📝 {item.note}
                      </p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-amber-500/30">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item?.food?.id, item.quantity - 1)
                        }
                        aria-label={`${title} miqdorini kamaytirish`}
                        className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold text-amber-300 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item?.food?.id, item.quantity + 1)
                        }
                        aria-label={`${title} miqdorini oshirish`}
                        className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center shadow"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item?.food?.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title={t.deleteItem}
                      aria-label={`${title} taomini o'chirish`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer - Total & Payment */}
        {items.length > 0 && (
          <div className="p-4 bg-zinc-900 border-t border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-base sm:text-lg font-serif font-bold text-zinc-100">
              <span>{t.total}:</span>
              <span className="text-xl font-extrabold text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                {totalAmount.toLocaleString('uz-UZ')} UZS
              </span>
            </div>

            <button
              onClick={onProceedPayment}
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 py-3 rounded-2xl font-serif font-extrabold text-base border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.45)] transition active:scale-95 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
                  <span>Zakaz jiberilmekte...</span>
                </>
              ) : (
                <>
                  <span>{t.proceedPayment}</span>
                  <ArrowRight className="w-5 h-5 text-zinc-950" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
