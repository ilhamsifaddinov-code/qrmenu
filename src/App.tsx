import React, { useEffect, useState, useMemo } from 'react';
import { Search, Flame, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  CategoryId,
  FoodItem,
  CartItem,
  Language,
  Order,
  Review,
  User,
  WaiterCall,
} from './types';
import { initialFoodItems } from './data/mockData';
import { translations } from './i18n/translations';
import { getFoodTitle, getFoodDescription, getFoodIngredients } from './utils/formatters';
import { Header } from './components/Header';
import { FoodCard } from './components/FoodCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { ReceiptModal } from './components/ReceiptModal';
import { CustomerReceiptsModal } from './components/CustomerReceiptsModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { NationalOrnamentHeader } from './components/NationalOrnament';

export default function App() {
  // 1. Language & Table Number State
  const [lang, setLang] = useState<Language>('qr');
  const [tableNumber, setTableNumber] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam) return tableParam;
    } catch (e) {
      console.error(e);
    }
    return '1';
  });

  // Keep table param synced if URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam && tableParam !== tableNumber) {
        setTableNumber(tableParam);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [tableNumber]);

  // 2. Data State
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialFoodItems);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 3. UI Views & Modals
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isCustomerReceiptsOpen, setIsCustomerReceiptsOpen] = useState(false);
  const [savedReceiptsCount, setSavedReceiptsCount] = useState<number>(0);

  // Sync saved receipts count
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cafe_customer_receipts');
      if (stored) {
        const list = JSON.parse(stored);
        setSavedReceiptsCount(Array.isArray(list) ? list.length : 0);
      } else {
        setSavedReceiptsCount(0);
      }
    } catch {
      setSavedReceiptsCount(0);
    }
  }, [isReceiptOpen, isCustomerReceiptsOpen]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('cafe_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('123456');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Check URL params for admin view on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isAdminParam = params.get('admin') === 'true' || window.location.pathname === '/admin';
      if (isAdminParam) {
        if (sessionStorage.getItem('cafe_admin_auth') === 'true') {
          setIsAdminAuthenticated(true);
          setIsAdminView(true);
        } else {
          setIsAdminAuthModalOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleAdminView = () => {
    if (isAdminView) {
      setIsAdminView(false);
    } else {
      if (isAdminAuthenticated) {
         setIsAdminView(true);
      } else {
         setIsAdminAuthModalOpen(true);
      }
    }
  };

  // 4. Filtering State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxCalories, setMaxCalories] = useState<number>(1000);
  const [isSpicyOnly, setIsSpicyOnly] = useState(false);
  const [isVegetarianOnly, setIsVegetarianOnly] = useState(false);
  const [isGlutenFreeOnly, setIsGlutenFreeOnly] = useState(false);

  // 5. Orders & Waiter Calls (Synchronized with Backend Server)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('cafe_orders');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>(() => {
    try {
      const stored = localStorage.getItem('cafe_waiterCalls');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Sync with Server Function (Polls every 2s for multi-device live sync)
  const syncWithServer = async () => {
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
          localStorage.setItem('cafe_orders', JSON.stringify(data.orders));
        }
        if (data.waiterCalls) {
          setWaiterCalls(data.waiterCalls);
          localStorage.setItem('cafe_waiterCalls', JSON.stringify(data.waiterCalls));
        }
        if (data.foods && Array.isArray(data.foods) && data.foods.length > 0) {
          setFoodItems(data.foods);
        }
      }
    } catch (err) {
      // Fallback silently if offline or server booting
    }
  };

  // Initial load of foods and sync
  useEffect(() => {
    fetch('/api/foods')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFoodItems(data);
        }
      })
      .catch((e) => console.warn('Could not fetch initial foods:', e));

    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('cafe_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cafe_waiterCalls', JSON.stringify(waiterCalls));
  }, [waiterCalls]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cafe_orders' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
      if (e.key === 'cafe_waiterCalls' && e.newValue) {
        setWaiterCalls(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = translations[lang] || translations.qr;

  // Cart operations
  const handleAddToCart = (food: FoodItem, quantity: number = 1, note?: string) => {
    if (!food) return;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i?.food?.id === food.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (note) updated[existingIndex].note = note;
        return updated;
      }
      return [...prev, { food, quantity, note }];
    });
  };

  const handleUpdateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(foodId);
      return;
    }
    setCartItems((prev) =>
      (prev || []).map((item) =>
        item?.food?.id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (foodId: string) => {
    setCartItems((prev) => (prev || []).filter((i) => i?.food?.id !== foodId));
  };

  // Add Review
  const handleAddReview = (foodId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    setFoodItems((prev) =>
      (prev || []).map((item) => {
        if (item.id === foodId) {
          const revObj: Review = {
            ...newReview,
            id: `rev-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
          };
          const updatedReviews = [revObj, ...(item.reviews || [])];
          const avgRating =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            (updatedReviews.length || 1);

          return {
            ...item,
            reviews: updatedReviews,
            rating: avgRating,
            ratingCount: (item.ratingCount || 0) + 1,
          };
        }
        return item;
      })
    );
  };

  // Waiter & Bill Call
  const handleCallWaiter = async (type: 'waiter' | 'bill') => {
    const call: WaiterCall = {
      id: `call-${Date.now()}`,
      tableNumber: tableNumber || '1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      status: 'active',
    };
    setWaiterCalls((prev) => [call, ...(prev || [])]);

    try {
      await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(call),
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to post waiter call:', e);
    }
  };

  const handleResolveWaiterCall = async (id: string) => {
    setWaiterCalls((prev) =>
      (prev || []).map((c) => (c.id === id ? { ...c, status: 'resolved' } : c))
    );
    try {
      await fetch(`/api/waiter-calls/${id}/resolve`, { method: 'PATCH' });
      syncWithServer();
    } catch (e) {
      console.error('Failed to resolve waiter call:', e);
    }
  };

  // Order completion
  const handleConfirmOrder = async () => {
    if (isSubmittingOrder) return;
    if (!cartItems || cartItems.length === 0) return;
    
    const validItems = cartItems
      .filter((i) => i && i.food)
      .map((i) => ({
        food: i.food,
        quantity: i.quantity || 1,
        note: i.note,
      }));

    if (validItems.length === 0) return;

    setIsSubmittingOrder(true);

    const totalCalculated = validItems.reduce(
      (sum, i) => sum + (i.food.price || 0) * (i.quantity || 1),
      0
    );

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      tableNumber: tableNumber || '1',
      items: validItems,
      totalAmount: totalCalculated,
      status: 'preparing',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'cash',
    };

    setOrders((prev) => [newOrder, ...(prev || [])]);
    setCartItems([]);
    
    // Show receipt
    setReceiptOrder(newOrder);
    setIsCartOpen(false);
    setIsReceiptOpen(true);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      await syncWithServer();
    } catch (e) {
      console.error('Failed to post order:', e);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Update order status (Admin)
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  // Delete order (Admin)
  const handleDeleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to delete order:', e);
    }
  };

  // Admin handlers - Connected globally via Server REST API
  const handleAddFoodItem = async (newItem: FoodItem) => {
    setFoodItems((prev) => [newItem, ...prev]);
    try {
      await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to save food to server:', e);
    }
  };

  const handleUpdateFoodItem = async (updatedItem: FoodItem) => {
    setFoodItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
    try {
      await fetch(`/api/foods/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to update food on server:', e);
    }
  };

  const handleDeleteFoodItem = async (id: string) => {
    setFoodItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/foods/${id}`, {
        method: 'DELETE',
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to delete food from server:', e);
    }
  };

  // Filtered Food Items logic
  const filteredFoodItems = useMemo(() => {
    return foodItems.filter((food) => {
      // Category filter
      if (selectedCategory !== 'all' && food.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = getFoodTitle(food, lang).toLowerCase().includes(query);
        const ingredients = getFoodIngredients(food, lang);
        const ingMatch = ingredients.some((i) =>
          typeof i === 'string' && i.toLowerCase().includes(query)
        );
        if (!titleMatch && !ingMatch) return false;
      }

      // Calorie slider
      if (food.calories > maxCalories) return false;

      // Dietary tags
      if (isSpicyOnly && food.spicyLevel === 0) return false;
      if (isVegetarianOnly && !food.isVegetarian) return false;
      if (isGlutenFreeOnly && !food.isGlutenFree) return false;

      return true;
    });
  }, [
    foodItems,
    selectedCategory,
    searchQuery,
    maxCalories,
    isSpicyOnly,
    isVegetarianOnly,
    isGlutenFreeOnly,
    lang,
  ]);

  const totalCartCount = (cartItems || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-[#121212] font-sans text-zinc-100 selection:bg-amber-500 selection:text-zinc-950 flex flex-col justify-between">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        tableNumber={tableNumber}
        onTableChange={(newT) => {
          setTableNumber(newT);
          window.history.pushState({}, '', '?table=' + newT);
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQrCode={() => setIsQrModalOpen(true)}
        onOpenReceipts={() => setIsCustomerReceiptsOpen(true)}
        receiptsCount={savedReceiptsCount}
        isAdminView={isAdminView}
        onToggleAdminView={handleToggleAdminView}
        onCallWaiter={handleCallWaiter}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 w-full flex-1 space-y-6">
        {/* Admin Panel Toggle View */}
        {isAdminView ? (
          <AdminPanel
            lang={lang}
            foodItems={foodItems}
            orders={orders}
            waiterCalls={waiterCalls}
            adminPassword={adminPassword}
            onUpdatePassword={setAdminPassword}
            onAddFoodItem={handleAddFoodItem}
            onUpdateFoodItem={handleUpdateFoodItem}
            onDeleteFoodItem={handleDeleteFoodItem}
            onResolveWaiterCall={handleResolveWaiterCall}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onCloseAdmin={() => setIsAdminView(false)}
          />
        ) : (
          <>
            <NationalOrnamentHeader />

            {/* Categories Selector Tabs */}
            <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" aria-label="Taǵam kategoriyaları">
              {[
                { id: 'all', label: t.catAll },
                { id: 'fastfood', label: t.catFastfood },
                { id: 'national', label: t.catNational },
                { id: 'meats', label: t.catMeats },
                { id: 'drinks', label: t.catDrinks },
                { id: 'desserts', label: t.catDesserts },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as CategoryId)}
                  aria-pressed={selectedCategory === cat.id}
                  className={`px-4 py-2.5 rounded-2xl font-serif font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-md ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 border-2 border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-[#18181b] text-zinc-300 hover:bg-zinc-800 border border-amber-500/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>

            {/* Search & Filter Bar */}
            <search className="bg-[#18181b]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder || "Taǵam izlew"}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950/80 border border-amber-500/30 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>

                {/* Calorie Filter Slider */}
                <div className="w-full sm:w-64 bg-zinc-950/80 p-2 px-3 rounded-xl border border-amber-500/30 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-[11px] font-bold text-zinc-300 mb-1">
                    <label htmlFor="calorie-range-slider">{t.filterByCalorie}:</label>
                    <span className="text-amber-400 font-extrabold">{maxCalories} kcal</span>
                  </div>
                  <input
                    id="calorie-range-slider"
                    type="range"
                    min={200}
                    max={1000}
                    step={50}
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(parseInt(e.target.value))}
                    aria-label={t.filterByCalorie || "Maksimal kaloriya"}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Tag Filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSpicyOnly((p) => !p)}
                    aria-pressed={isSpicyOnly}
                    className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 border transition ${
                      isSpicyOnly
                        ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.filterSpicy}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVegetarianOnly((p) => !p)}
                    aria-pressed={isVegetarianOnly}
                    className={`px-3 py-1 rounded-xl font-bold border transition ${
                      isVegetarianOnly
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    🌱 {t.filterVegetarian}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsGlutenFreeOnly((p) => !p)}
                    aria-pressed={isGlutenFreeOnly}
                    className={`px-3 py-1 rounded-xl font-bold border transition ${
                      isGlutenFreeOnly
                        ? 'bg-amber-600 text-white border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    🌾 {t.filterGlutenFree}
                  </button>
                </div>

                {/* Reset Filters */}
                {(searchQuery ||
                  maxCalories < 1000 ||
                  isSpicyOnly ||
                  isVegetarianOnly ||
                  isGlutenFreeOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setMaxCalories(1000);
                      setIsSpicyOnly(false);
                      setIsVegetarianOnly(false);
                      setIsGlutenFreeOnly(false);
                    }}
                    className="text-amber-400 hover:text-amber-200 font-bold text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.resetFilters}</span>
                  </button>
                )}
              </div>
            </search>

            {/* Food Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-xl text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                  {selectedCategory === 'all'
                    ? t.catAll
                    : selectedCategory === 'national'
                    ? t.catNational
                    : selectedCategory === 'meats'
                    ? t.catMeats
                    : selectedCategory === 'drinks'
                    ? t.catDrinks
                    : t.catDesserts}{' '}
                  ({filteredFoodItems.length})
                </h2>
              </div>

              {filteredFoodItems.length === 0 ? (
                <div className="bg-[#18181b] p-8 rounded-3xl border-2 border-dashed border-amber-500/30 text-center space-y-3 my-6">
                  <div className="text-4xl">🍲</div>
                  <h3 className="font-serif font-bold text-base text-zinc-200">
                    Soraǵıńızǵa muwawıq taǵamlar tabılmadı
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Iltimas, filtrlerdi yamasa izlew sózin ózgertip kórıń.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredFoodItems.map((food) => {
                    const cartQty =
                      (cartItems || []).find((i) => i?.food?.id === food?.id)?.quantity || 0;

                    return (
                      <FoodCard
                        key={food.id}
                        food={food}
                        lang={lang}
                        onSelect={setSelectedFood}
                        onAddToCart={(f) => handleAddToCart(f, 1)}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        cartQuantity={cartQty}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals & Drawers */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          lang={lang}
          onClose={() => setSelectedFood(null)}
          onAddToCart={handleAddToCart}
          onAddReview={handleAddReview}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        lang={lang}
        tableNumber={tableNumber}
        items={cartItems}
        isSubmitting={isSubmittingOrder}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedPayment={handleConfirmOrder}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        lang={lang}
        order={receiptOrder}
        onClose={() => setIsReceiptOpen(false)}
      />

      <CustomerReceiptsModal
        isOpen={isCustomerReceiptsOpen}
        lang={lang}
        onClose={() => setIsCustomerReceiptsOpen(false)}
        onSelectReceipt={(rec) => {
          setReceiptOrder(rec);
          setIsCustomerReceiptsOpen(false);
          setIsReceiptOpen(true);
        }}
      />

      {isAdminAuthModalOpen && (
        <AdminAuthModal
          isOpen={isAdminAuthModalOpen}
          lang={lang}
          adminPassword={adminPassword}
          onClose={() => setIsAdminAuthModalOpen(false)}
          onSuccess={() => {
            try {
              sessionStorage.setItem('cafe_admin_auth', 'true');
            } catch (e) {
              console.error(e);
            }
            setIsAdminAuthenticated(true);
            setIsAdminAuthModalOpen(false);
            setIsAdminView(true);
          }}
        />
      )}

      {isQrModalOpen && (
        <QRCodeModal
          isOpen={isQrModalOpen}
          lang={lang}
          tableNumber={tableNumber}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}
