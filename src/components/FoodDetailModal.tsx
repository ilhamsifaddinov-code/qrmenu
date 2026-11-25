import React, { useState } from 'react';
import { X, Star, Clock, ShieldAlert, Send, Check } from 'lucide-react';
import { FoodItem, Language, Review } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, getFoodDescription, getFoodIngredients, formatPrice } from '../utils/formatters';

interface FoodDetailModalProps {
  food: FoodItem | null;
  lang: Language;
  onClose: () => void;
  onAddToCart: (food: FoodItem, quantity: number, note?: string) => void;
  onAddReview: (foodId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  lang,
  onClose,
  onAddToCart,
  onAddReview,
}) => {
  if (!food) return null;

  const t = translations[lang] || translations.qr;
  const [quantity, setQuantity] = useState(1);
  const [orderNote, setOrderNote] = useState('');
  
  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const title = getFoodTitle(food, lang);
  const description = getFoodDescription(food, lang);
  const ingredients = getFoodIngredients(food, lang);
  const isAvailable = food.isAvailable !== false;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !newComment.trim()) return;

    onAddReview(food.id, {
      userName: reviewerName.trim(),
      rating: newRating,
      comment: newComment.trim(),
    });

    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewerName('');
      setNewComment('');
      setReviewSubmitted(false);
    }, 2500);
  };

  const handleAdd = () => {
    onAddToCart(food, quantity, orderNote.trim());
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#2E1E17]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF5EF] text-[#2E1E17] rounded-3xl border border-[#EAE0D4] shadow-[0_10px_40px_rgba(46,30,23,0.25)] overflow-hidden my-auto max-h-[90vh] flex flex-col cursor-default"
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close || 'Yopish'}
          className="absolute top-3.5 right-3.5 z-30 bg-white/90 hover:bg-white text-[#2E1E17] p-2 rounded-full border border-[#EAE0D4] transition shadow-md cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Header Image */}
        <div className="relative h-56 sm:h-72 w-full shrink-0 bg-[#F7F2EB]">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-[#EFE7DE] animate-pulse flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#C0684C]/30 border-t-[#C0684C] rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F7F2EB]">
              <span className="text-5xl mb-2">🍰</span>
              <span className="text-sm font-bold text-[#8D6B58]">{title}</span>
            </div>
          ) : (
            <img
              src={food.imageUrl}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`w-full h-full object-cover transition-opacity duration-500 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E1E17]/85 via-black/20 to-transparent" />

          {!isAvailable && (
            <div className="absolute inset-0 bg-[#2E1E17]/75 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
              <span className="bg-[#C0684C] text-white font-bold text-sm sm:text-base px-4 py-2 rounded-full shadow-md">
                ✕ {lang === 'qr' ? 'Házirshe bul taǵam tawsılǵan (Joq)' : 'Hozircha bu taom tugagan (Qolmagan)'}
              </span>
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="font-serif font-bold text-xl sm:text-3xl text-white drop-shadow-sm leading-tight">
              {title}
            </h2>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-[#2E1E17]">
          {/* Price & Rating Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EAE0D4] shadow-2xs">
            <div>
              <span className="text-xs text-[#8D6B58] font-medium block">Narxi (1 {t.portion})</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#2E1E17]">
                {formatPrice(food.price)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF5EF] px-3 py-1.5 rounded-xl border border-[#EAE0D4]">
              <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
              <span className="font-bold text-sm text-[#2E1E17]">{food.rating.toFixed(1)}</span>
              <span className="text-xs text-[#8D6B58]">({food.ratingCount})</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm sm:text-base text-[#6C5343] leading-relaxed font-sans">
              {description}
            </p>
          </div>

          {/* Ingredients List */}
          {ingredients.length > 0 && (
            <div>
              <h4 className="font-serif font-bold text-sm text-[#2E1E17] mb-2">
                🧁 {t.ingredients}:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-[#2E1E17] text-xs font-semibold px-3 py-1 rounded-xl border border-[#EAE0D4] shadow-2xs"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nutrition */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#EAE0D4] shadow-2xs">
              <h5 className="font-serif font-bold text-xs text-[#8D6B58] uppercase tracking-wider mb-2">
                📊 {t.nutrition}
              </h5>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#FAF5EF] p-2 rounded-xl border border-[#EAE0D4]">
                  <span className="block text-[11px] text-[#8D6B58]">{t.protein}</span>
                  <span className="font-bold text-[#2E1E17]">{food.nutrition?.protein || 0}g</span>
                </div>
                <div className="bg-[#FAF5EF] p-2 rounded-xl border border-[#EAE0D4]">
                  <span className="block text-[11px] text-[#8D6B58]">{t.fat}</span>
                  <span className="font-bold text-[#2E1E17]">{food.nutrition?.fat || 0}g</span>
                </div>
                <div className="bg-[#FAF5EF] p-2 rounded-xl border border-[#EAE0D4]">
                  <span className="block text-[11px] text-[#8D6B58]">{t.carbs}</span>
                  <span className="font-bold text-[#2E1E17]">{food.nutrition?.carbs || 0}g</span>
                </div>
              </div>
            </div>

            {/* Allergens */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#EAE0D4] shadow-2xs">
              <h5 className="font-serif font-bold text-xs text-[#8D6B58] uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C0684C]" />
                {t.allergens}
              </h5>
              {food.allergens && food.allergens.length > 0 ? (
                <div className="flex flex-wrap gap-1 text-xs">
                  {food.allergens.map((alg) => (
                    <span key={alg} className="bg-[#FAF5EF] text-[#C0684C] font-bold px-2 py-0.5 rounded-lg border border-[#EAE0D4]">
                      {alg.toUpperCase()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-semibold">
                  ✓ Allergenlar mavjud emas
                </p>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="border-t border-[#EAE0D4] pt-4 space-y-3">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#2E1E17]">
              💬 {t.ratingAndReviews} ({food.reviews ? food.reviews.length : 0})
            </h4>

            {food.reviews && food.reviews.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {food.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-3 rounded-xl border border-[#EAE0D4] text-xs shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#2E1E17]">{rev.userName}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#F5A623] font-bold">{'★'.repeat(rev.rating)}</span>
                        <span className="text-[10px] text-[#8D6B58]">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-[#6C5343] italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-white p-3.5 rounded-2xl border border-[#EAE0D4] space-y-2 shadow-2xs">
              <h5 className="font-serif font-bold text-xs text-[#2E1E17]">{t.addReview}</h5>

              {reviewSubmitted ? (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Fikringiz uchun rahmat!</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder={t.firstName}
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 rounded-xl border border-[#EAE0D4] bg-[#FAF5EF] text-xs text-[#2E1E17]"
                      required
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="text-base transition"
                        >
                          <Star className={`w-4 h-4 ${star <= newRating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-zinc-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={t.yourComment}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-[#EAE0D4] bg-[#FAF5EF] text-xs text-[#2E1E17]"
                      required
                    />
                    <button
                      type="submit"
                      aria-label="Fikr yuborish"
                      className="bg-[#C0684C] hover:bg-[#B05B3F] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Special Order Notes */}
          <div>
            <label htmlFor="food-order-note" className="block text-xs font-bold text-[#8D6B58] mb-1">
              📝 {t.orderNote}:
            </label>
            <input
              id="food-order-note"
              type="text"
              placeholder="Masalan: shakar kamroq bo'lsin..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#EAE0D4] bg-white text-xs text-[#2E1E17] outline-none focus:ring-1 focus:ring-[#C0684C]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-[#EAE0D4] flex items-center justify-between gap-3 shrink-0 shadow-sm">
          {!isAvailable ? (
            <div className="w-full flex items-center justify-between gap-3">
              <span className="text-xs text-[#C0684C] font-bold">Tugagan</span>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#F1EAE0] text-[#2E1E17] px-4 py-2 rounded-xl text-xs font-bold"
              >
                Yopish
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 w-full">
              {/* Quantity */}
              <div className="flex items-center gap-2 bg-[#FAF5EF] px-2 py-1 rounded-full border border-[#EAE0D4]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full bg-white text-[#2E1E17] font-bold text-xs shadow-2xs hover:bg-[#F1EAE0]"
                >
                  -
                </button>
                <span className="font-bold text-sm text-[#2E1E17] w-5 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-full bg-[#C0684C] text-white font-bold text-xs shadow-2xs hover:bg-[#B05B3F]"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 bg-[#C0684C] hover:bg-[#B05B3F] text-white py-2.5 px-4 rounded-2xl font-sans font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-between cursor-pointer"
              >
                <span>{t.addToCart}</span>
                <span>{formatPrice(food.price * quantity)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
