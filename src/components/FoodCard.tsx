import React, { useState } from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import { FoodItem, Language } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, formatPrice } from '../utils/formatters';

interface FoodCardProps {
  food: FoodItem;
  lang: Language;
  onSelect: (food: FoodItem) => void;
  onAddToCart: (food: FoodItem) => void;
  onUpdateQuantity?: (foodId: string, quantity: number) => void;
  cartQuantity: number;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  lang,
  onSelect,
  onAddToCart,
  onUpdateQuantity,
  cartQuantity,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const t = translations[lang] || translations.qr;

  const isAvailable = food.isAvailable !== false;
  const title = getFoodTitle(food, lang);

  return (
    <div
      className={`group bg-white rounded-2xl sm:rounded-3xl border border-[#F0E7DD] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_4px_16px_rgba(46,30,23,0.04)] hover:shadow-[0_8px_24px_rgba(46,30,23,0.08)] ${
        !isAvailable ? 'opacity-80' : ''
      }`}
    >
      {/* Top Image Container */}
      <div
        className="relative aspect-square w-full p-2 sm:p-2.5 overflow-hidden cursor-pointer"
        onClick={() => onSelect(food)}
      >
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F7F2EB]">
          {/* Out of Stock Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-[#2E1E17]/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-2 text-center">
              <span className="bg-[#C0684C] text-white font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-full shadow-sm">
                {lang === 'qr' ? 'Tawsılǵan (Joq)' : 'Tugagan (Qolmagan)'}
              </span>
            </div>
          )}

          {/* Image skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-[#EFE7DE] animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#C0684C]/30 border-t-[#C0684C] rounded-full animate-spin"></div>
            </div>
          )}

          {/* Image Fallback */}
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#F7F2EB]">
              <span className="text-3xl mb-1">🍰</span>
              <span className="text-[11px] font-semibold text-[#8D6B58] line-clamp-1">
                {title}
              </span>
            </div>
          ) : (
            <img
              src={food.imageUrl}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                !imageLoaded ? 'opacity-0' : 'opacity-100'
              } ${!isAvailable ? 'grayscale opacity-60' : ''}`}
            />
          )}

          {/* Rating tag in top-right */}
          {food.rating > 0 && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-[#2E1E17] border border-[#EAE0D4] flex items-center gap-1 shadow-2xs">
              <Star className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" aria-hidden="true" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Info & Bottom Action */}
      <div className="p-3 sm:p-4 pt-1 flex flex-col justify-between flex-1">
        <div className="mb-2">
          <h3
            onClick={() => onSelect(food)}
            className="font-sans font-bold text-sm sm:text-base text-[#2E1E17] group-hover:text-[#C0684C] transition-colors line-clamp-2 cursor-pointer leading-tight"
          >
            {title}
          </h3>
        </div>

        {/* Price & Terracotta Circle Add Button */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F5EFE8]">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#2E1E17]">
              {formatPrice(food.price)}
            </span>
          </div>

          {/* If already in cart, show quantity controls; otherwise round '+' button */}
          {cartQuantity > 0 && onUpdateQuantity ? (
            <div className="flex items-center gap-1 bg-[#F1EAE0] rounded-full p-0.5 border border-[#E6DDD2]">
              <button
                type="button"
                onClick={() => onUpdateQuantity(food.id, cartQuantity - 1)}
                aria-label="Kamaytirish"
                className="w-7 h-7 rounded-full bg-white text-[#2E1E17] flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-[#FAF5EF] active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-xs font-black text-[#2E1E17]">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(food.id, cartQuantity + 1)}
                aria-label="Oshirish"
                className="w-7 h-7 rounded-full bg-[#C0684C] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-[#B05B3F] active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onAddToCart(food)}
              aria-label={`${title} savatga qo'shish`}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-sm ${
                isAvailable
                  ? 'bg-[#C0684C] hover:bg-[#B05B3F] cursor-pointer'
                  : 'bg-zinc-300 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
