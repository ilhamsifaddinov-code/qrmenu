import { Language, FoodItem } from '../types';

export function getFoodTitle(food: any, lang: Language = 'qr'): string {
  if (!food) return 'Tamaq';
  if (typeof food === 'string') return food;
  if (typeof food.title === 'string') return food.title;
  if (food.title && typeof food.title === 'object') {
    return food.title[lang] || food.title.qr || food.title.uz || food.title.ru || food.title.en || 'Tamaq';
  }
  return food.name || 'Tamaq';
}

export function getFoodDescription(food: any, lang: Language = 'qr'): string {
  if (!food) return '';
  if (typeof food.description === 'string') return food.description;
  if (food.description && typeof food.description === 'object') {
    return food.description[lang] || food.description.qr || food.description.uz || food.description.ru || food.description.en || '';
  }
  return '';
}

export function getFoodIngredients(food: any, lang: Language = 'qr'): string[] {
  if (!food || !food.ingredients) return [];
  if (Array.isArray(food.ingredients)) return food.ingredients;
  if (typeof food.ingredients === 'object') {
    const list = food.ingredients[lang] || food.ingredients.qr || food.ingredients.uz || food.ingredients.ru || food.ingredients.en;
    if (Array.isArray(list)) return list;
  }
  return [];
}

export function formatPrice(price: number | undefined | null): string {
  if (typeof price !== 'number' || isNaN(price)) return '0 UZS';
  return `${price.toLocaleString('uz-UZ')} UZS`;
}
