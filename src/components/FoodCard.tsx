import React, { useState } from 'react';
import { Star, Clock, Flame, Plus, Check, Info } from 'lucide-react';
import { FoodItem, Language } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, getFoodDescription, formatPrice } from '../utils/formatters';

interface FoodCardProps {
  food: FoodItem;
  lang: Language;
  onSelect: (food: FoodItem) => void;
  onAddToCart: (food: FoodItem) => void;
  cartQuantity: number;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  lang,
  onSelect,
  onAddToCart,
  cartQuantity,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const t = translations[lang] || translations.qr;

  const title = getFoodTitle(food, lang);
  const description = getFoodDescription(food, lang);

  return (
    <div className="group relative bg-[#18181b] rounded-2xl border border-amber-500/25 hover:border-amber-400/70 shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Top Badges overlay */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-950 cursor-pointer" onClick={() => onSelect(food)}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={food.imageUrl}
          alt={title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-black/40" />

        {/* National Special Badge */}
        {food.isNationalSpecial && (
          <span className="absolute top-2.5 left-2.5 bg-amber-500 text-zinc-950 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1">
            ✨ Milliy Lezzet
          </span>
        )}

        {/* Calorie Tag */}
        <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/30">
          🔥 {food.calories} {t.kcal}
        </span>

        {/* Price Tag Overlay on Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
          <div className="bg-zinc-950/90 backdrop-blur-md border border-amber-500/40 px-3 py-1 rounded-xl shadow-[0_0_12px_rgba(0,0,0,0.8)]">
            <span className="text-base sm:text-lg font-extrabold text-amber-400">
              {food.price.toLocaleString('uz-UZ')} UZS
            </span>
          </div>

          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{food.rating.toFixed(1)}</span>
            <span className="text-zinc-400 font-normal text-[10px]">({food.ratingCount})</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 bg-[#18181b]">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3
              onClick={() => onSelect(food)}
              className="font-serif font-bold text-base sm:text-lg text-zinc-100 group-hover:text-amber-300 transition line-clamp-1 cursor-pointer"
            >
              {title}
            </h3>
            <button
              onClick={() => onSelect(food)}
              className="text-amber-400 hover:text-amber-200 p-1"
              title="Tolıq maǵlıwmat"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Special Diet Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px] font-semibold">
            {food.isHalal && (
              <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                ✓ Xalal
              </span>
            )}
            {food.isGlutenFree && (
              <span className="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                🌾 Glütensiz
              </span>
            )}
            {food.isVegetarian && (
              <span className="bg-green-950/80 text-green-300 px-2 py-0.5 rounded border border-green-500/40">
                🌱 Vegetarian
              </span>
            )}
            {food.spicyLevel > 0 && (
              <span className="bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-500/40 flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-red-400" />
                {'🌶️'.repeat(food.spicyLevel)}
              </span>
            )}
          </div>
        </div>

        {/* Footer Bar: Prep time & Add to Cart button */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{food.prepTime} {t.prepTime}</span>
          </div>

          <button
            onClick={() => onAddToCart(food)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow transition active:scale-95 ${
              cartQuantity > 0
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/60'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:from-amber-400 hover:to-amber-500 font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.35)]'
            }`}
          >
            {cartQuantity > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Qosıldı ({cartQuantity})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
