import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Loader2, Clock, CheckCircle2, Truck } from 'lucide-react';
import { CartItem, Language, Order } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  lang: Language;
  tableNumber: string;
  items: CartItem[];
  activeOrders?: Order[];
  onDismissOrder?: (orderId: string) => void;
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
  activeOrders = [],
  onDismissOrder,
  isSubmitting = false,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedPayment,
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.uz;

  // Total for newly added / unconfirmed items
  const newItemsTotal = (items || []).reduce(
    (sum, item) => sum + (item?.food?.price || 0) * (item?.quantity || 1),
    0
  );

  // Helper for live status badge
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.statusPaid}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.statusDelivered}</span>
          </span>
        );
      case 'preparing':
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.statusPreparing}</span>
          </span>
        );
    }
  };

  const hasContent = items.length > 0 || activeOrders.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#2E1E17]/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FAF5EF] text-[#2E1E17] h-full shadow-[0_0_40px_rgba(46,30,23,0.2)] border-l border-[#EAE0D4] flex flex-col justify-between overflow-hidden">
        {/* Drawer Header with Cake Bumer Logo */}
        <div className="bg-white p-4 border-b border-[#EAE0D4] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl overflow-hidden bg-[#FAF5EF] border border-[#EAE0D4] flex items-center justify-center p-0.5 shrink-0">
              <img src="/logo.png" alt="Cake Bumer" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-sans font-black text-base text-[#2E1E17]">
                {t.cartTitle}
              </h3>
              <p className="text-[11px] text-[#8D6B58] font-medium">
                {t.tableNumber} {tableNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-2 rounded-full bg-[#F1EAE0] text-[#2E1E17] hover:bg-[#EAE0D4] transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4">
          {!hasContent ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8D6B58] space-y-3">
              <div className="w-16 h-16 rounded-full bg-white border border-[#EAE0D4] flex items-center justify-center text-3xl shadow-xs">
                🍰
              </div>
              <p className="font-semibold text-sm leading-relaxed max-w-xs text-[#2E1E17]">
                {t.emptyCart}
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: CONFIRMED ORDERS WITH LIVE STATUSES ABOVE FOOD */}
              {activeOrders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#EAE0D4]">
                    <h4 className="font-sans font-bold text-xs sm:text-sm text-[#2E1E17] tracking-wide uppercase">
                      {t.confirmedOrdersTitle} ({activeOrders.length})
                    </h4>
                    <span className="text-[10px] text-[#8D6B58] font-medium">
                      {t.inKitchen}
                    </span>
                  </div>

                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-3 border border-[#EAE0D4] shadow-xs space-y-2.5 transition-all"
                    >
                      {/* Top Bar of Order: LIVE STATUS BADGE ABOVE FOOD & DELETE BUTTON */}
                      <div className="flex items-center justify-between gap-2 bg-[#FAF5EF] p-2 rounded-xl border border-[#EAE0D4]">
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(order.status)}
                          <span className="text-[11px] font-mono text-[#8D6B58]">
                            #{order.id.slice(-4)}
                          </span>
                        </div>

                        {onDismissOrder && (
                          <button
                            type="button"
                            onClick={() => onDismissOrder(order.id)}
                            className="text-xs text-[#C0684C] hover:text-[#A9563C] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-[#F1EAE0] transition"
                            title={t.removeFromCart}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{t.removeFromCart}</span>
                          </button>
                        )}
                      </div>

                      {/* Food items inside this confirmed order */}
                      <div className="space-y-2 divide-y divide-[#F7F2EB]">
                        {order.items.map((item, idx) => {
                          const title = getFoodTitle(item.food, lang);
                          return (
                            <div key={idx} className="pt-2 first:pt-0 flex items-center gap-3">
                              <img
                                src={item.food.imageUrl}
                                alt={title}
                                className="w-12 h-12 rounded-xl object-cover border border-[#EAE0D4] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-sans font-bold text-xs sm:text-sm text-[#2E1E17] truncate">
                                  {title}
                                </h5>
                                <div className="flex items-center gap-2 text-xs text-[#8D6B58] mt-0.5">
                                  <span>{item.quantity} {t.portion}</span>
                                  <span>•</span>
                                  <span className="font-bold text-[#2E1E17]">
                                    {formatPrice(item.food.price * item.quantity)}
                                  </span>
                                </div>
                                {item.note && (
                                  <p className="text-[10px] text-[#C0684C] italic mt-0.5 truncate">
                                    📝 {item.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Footer Summary */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5EFE8] text-[#8D6B58]">
                        <span>{order.createdAt}</span>
                        <span className="font-extrabold text-[#2E1E17]">
                          {t.total}: {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 2: NEW / UNCONFIRMED CART ITEMS */}
              {items.length > 0 && (
                <div className="space-y-3 pt-2">
                  {activeOrders.length > 0 && (
                    <div className="flex items-center justify-between pb-1 border-b border-[#EAE0D4]">
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-[#2E1E17] tracking-wide uppercase">
                        {t.newSelectedItems} ({items.length})
                      </h4>
                    </div>
                  )}

                  {items.map((item) => {
                    const title = getFoodTitle(item?.food, lang);

                    return (
                      <div
                        key={item?.food?.id}
                        className="bg-white p-3 rounded-2xl border border-[#EAE0D4] shadow-xs flex items-center justify-between gap-3"
                      >
                        <img
                          src={item?.food?.imageUrl}
                          alt={title}
                          className="w-14 h-14 rounded-xl object-cover border border-[#EAE0D4] shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-sans font-bold text-xs sm:text-sm text-[#2E1E17] truncate">
                            {title}
                          </h4>
                          <p className="text-xs font-extrabold text-[#C0684C] mt-0.5">
                            {formatPrice(item?.food?.price)}
                          </p>
                          {item?.note && (
                            <p className="text-[10px] text-[#8D6B58] bg-[#FAF5EF] px-1.5 py-0.5 rounded italic mt-1 truncate border border-[#EAE0D4]">
                              📝 {item.note}
                            </p>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1 bg-[#FAF5EF] p-0.5 rounded-full border border-[#EAE0D4]">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(item?.food?.id, item.quantity - 1)
                              }
                              aria-label={`${title} -`}
                              className="w-6 h-6 rounded-full bg-white hover:bg-[#F1EAE0] text-[#2E1E17] font-bold text-xs flex items-center justify-center shadow-2xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-[#2E1E17] w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(item?.food?.id, item.quantity + 1)
                              }
                              aria-label={`${title} +`}
                              className="w-6 h-6 rounded-full bg-[#C0684C] text-white font-bold text-xs flex items-center justify-center shadow-2xs hover:bg-[#B05B3F]"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item?.food?.id)}
                            className="text-[#8D6B58] hover:text-[#C0684C] p-1"
                            title={t.deleteItem}
                            aria-label={`${title} ${t.deleteItem}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer - Total & Payment */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-[#EAE0D4] space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-base font-bold text-[#2E1E17]">
              <span>{t.total}:</span>
              <span className="text-lg font-extrabold text-[#C0684C]">
                {formatPrice(newItemsTotal)}
              </span>
            </div>

            <button
              onClick={onProceedPayment}
              disabled={isSubmitting}
              className={`w-full bg-[#C0684C] hover:bg-[#B05B3F] text-white py-3 rounded-2xl font-sans font-bold text-base shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>{t.submittingOrder}</span>
                </>
              ) : (
                <>
                  <span>{t.proceedPayment}</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
