import React, { useState } from 'react';
import { X, Star, Clock, Flame, ShieldAlert, Heart, Send, Check } from 'lucide-react';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#18181b] text-zinc-100 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header Bar with Close Button */}
        <div className="relative h-60 sm:h-72 w-full shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-5xl mb-2">🍽️</span>
              <span className="text-sm font-serif font-bold text-amber-400">{title}</span>
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-black/60" />

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close || 'Jabıw'}
            className="absolute top-3 right-3 bg-black/70 hover:bg-black text-amber-300 p-2 rounded-full border border-amber-500/30 transition shadow-md"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Title & Category overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500 text-zinc-950 text-xs font-extrabold px-2.5 py-0.5 rounded-lg border border-amber-200 shadow">
                {food.isNationalSpecial ? '✨ Milliy Qaraqalpaq Lezzeti' : 'Nukus Menu'}
              </span>
              <span className="bg-black/70 backdrop-blur-md text-amber-300 text-xs px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                🔥 {food.calories} {t.kcal}
              </span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              {title}
            </h2>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-zinc-200">
          {/* Price & Rating Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-3.5 rounded-2xl border border-amber-500/30">
            <div>
              <span className="text-xs text-zinc-400 font-medium block">Baha (1 {t.portion})</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
                {food.price.toLocaleString('uz-UZ')} UZS
              </span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-sm">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-base text-zinc-100">{food.rating.toFixed(1)}</span>
              <span className="text-xs text-zinc-400 font-medium">({food.ratingCount} {t.ratingAndReviews})</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
              {description}
            </p>
          </div>

          {/* Ingredients List */}
          <div>
            <h4 className="font-serif font-bold text-base text-amber-300 mb-2 flex items-center gap-2">
              <span>🍲</span> {t.ingredients}:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-900 text-amber-300 text-xs font-semibold px-3 py-1 rounded-xl border border-amber-500/30"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Nutritional Value & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nutrition */}
            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-amber-500/30">
              <h5 className="font-serif font-bold text-xs text-amber-400 uppercase tracking-wider mb-2">
                📊 {t.nutrition}
              </h5>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="block text-zinc-400">{t.protein}</span>
                  <span className="font-bold text-amber-300">{food.nutrition.protein}g</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="block text-zinc-400">{t.fat}</span>
                  <span className="font-bold text-amber-300">{food.nutrition.fat}g</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="block text-zinc-400">{t.carbs}</span>
                  <span className="font-bold text-amber-300">{food.nutrition.carbs}g</span>
                </div>
              </div>
            </div>

            {/* Allergens */}
            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-red-500/30">
              <h5 className="font-serif font-bold text-xs text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                {t.allergens}
              </h5>
              {food.allergens.length > 0 ? (
                <div className="flex flex-wrap gap-1 text-xs">
                  {food.allergens.map((alg) => (
                    <span key={alg} className="bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded border border-red-500/40">
                      ⚠️ {alg.toUpperCase()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-semibold">
                  ✓ Qáwipsiz (Allergenler joq)
                </p>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <h4 className="font-serif font-bold text-lg text-amber-300 flex items-center gap-2">
              <span>💬</span> {t.ratingAndReviews} ({food.reviews.length})
            </h4>

            {/* Existing Reviews */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {food.reviews.map((rev) => (
                <div key={rev.id} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-100">{rev.userName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 font-bold">{'★'.repeat(rev.rating)}</span>
                      <span className="text-[10px] text-zinc-500">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-zinc-900 p-3.5 rounded-2xl border border-amber-500/30 space-y-2 mt-2">
              <h5 className="font-serif font-bold text-xs text-amber-300">{t.addReview}</h5>

              {reviewSubmitted ? (
                <div className="bg-amber-500/20 text-amber-300 p-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1 border border-amber-500/40">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Pikirińiz ushın raxmet! Pikir dizimge qosıldı.</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder={t.firstName}
                      aria-label={t.firstName || "Ismińiz"}
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500"
                      required
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          aria-label={`${star} juldız`}
                          onClick={() => setNewRating(star)}
                          className="text-lg transition"
                        >
                          <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={t.yourComment}
                      aria-label={t.yourComment || "Pikirińiz"}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500"
                      required
                    />
                    <button
                      type="submit"
                      aria-label="Pikir jiberiw"
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Special Order Notes */}
          <div>
            <label htmlFor="food-order-note" className="block text-xs font-serif font-bold text-zinc-300 mb-1">
              📝 {t.orderNote}:
            </label>
            <input
              id="food-order-note"
              type="text"
              placeholder="Mısalı: ashshı bolmasın, sarımsaq azraq bolsın..."
              aria-label={t.orderNote || "Buyırtpa ushın qosımsha eskertpe"}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-zinc-900 border-t border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-2xl border border-amber-500/30 shadow-sm">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="1 dana kemeytiw"
              className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-lg flex items-center justify-center transition"
            >
              -
            </button>
            <span className="font-extrabold text-base text-amber-300 w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="1 dana qosıw"
              className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 font-bold text-lg flex items-center justify-center transition shadow"
            >
              +
            </button>
          </div>

          {/* Add Button with calculated total */}
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`${title} ${t.addToCart}`}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 py-3 px-4 rounded-2xl font-serif font-extrabold text-sm sm:text-base border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.45)] transition active:scale-95 flex items-center justify-between"
          >
            <span>{t.addToCart}</span>
            <span className="text-zinc-950 font-sans font-extrabold">
              {(food.price * quantity).toLocaleString('uz-UZ')} UZS
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
