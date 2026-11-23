export type Language = 'qr' | 'uz' | 'ru' | 'en';

export type CategoryId = 'all' | 'fastfood' | 'national' | 'meats' | 'drinks' | 'desserts';

export interface AllergenTag {
  id: string;
  name: Record<Language, string>;
  icon?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FoodItem {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  price: number; // UZS
  category: CategoryId;
  imageUrl: string;
  calories: number; // kcal
  prepTime: number; // minutes
  spicyLevel: number; // 0 to 3
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isHalal: boolean;
  isNationalSpecial: boolean;
  isAvailable: boolean;
  ingredients: Record<Language, string[]>;
  allergens: string[]; // e.g. ['gluten', 'dairy', 'nuts']
  rating: number;
  ratingCount: number;
  reviews: Review[];
  nutrition: {
    protein: number; // g
    fat: number; // g
    carbs: number; // g
  };
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivered' | 'paid';
  createdAt: string;
  paymentMethod?: 'cash' | 'click' | 'payme';
  customerName?: string;
  customerPhone?: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: string;
  timestamp: string;
  type: 'waiter' | 'bill' | 'water';
  status: 'active' | 'resolved';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  isTelegramUser?: boolean;
  role: 'user' | 'admin';
}

export interface AppSettings {
  telegramUsername: string;
  instagramUsername: string;
}
