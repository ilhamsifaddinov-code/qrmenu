import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Search, Flame, RotateCcw, ShoppingBag, ArrowRight } from 'lucide-react';
import {
  CategoryId,
  FoodItem,
  CartItem,
  Language,
  Order,
  Review,
  WaiterCall,
  AppSettings,
} from './types';
import { initialFoodItems } from './data/mockData';
import { translations } from './i18n/translations';
import { getFoodTitle, getFoodIngredients, formatPrice } from './utils/formatters';
import { Header } from './components/Header';
import { FoodCard } from './components/FoodCard';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';

// Code-split heavy modals and Admin Panel to minimize mobile initial JS bundle
const FoodDetailModal = React.lazy(() =>
  import('./components/FoodDetailModal').then((m) => ({ default: m.FoodDetailModal }))
);
const ReceiptModal = React.lazy(() =>
  import('./components/ReceiptModal').then((m) => ({ default: m.ReceiptModal }))
);
const CustomerReceiptsModal = React.lazy(() =>
  import('./components/CustomerReceiptsModal').then((m) => ({ default: m.CustomerReceiptsModal }))
);
const QRCodeModal = React.lazy(() =>
  import('./components/QRCodeModal').then((m) => ({ default: m.QRCodeModal }))
);
const AdminAuthModal = React.lazy(() =>
  import('./components/AdminAuthModal').then((m) => ({ default: m.AdminAuthModal }))
);
const AdminPanel = React.lazy(() =>
  import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);

export default function App() {
  // 1. Initial Loading Screen state
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 2. Language & Table Number State
  const [lang, setLang] = useState<Language>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam === 'uz' || langParam === 'qr' || langParam === 'ru' || langParam === 'en') {
        return langParam as Language;
      }
    } catch {}
    return 'uz';
  });
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

  // Telegram WebApp Native Ready & Expand
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#FAF5EF');
        tg.setBackgroundColor('#FAF5EF');
      } catch (e) {
        console.warn('Telegram WebApp init warning:', e);
      }

      // If lang not specified in URL query, use Telegram user language
      try {
        const params = new URLSearchParams(window.location.search);
        if (!params.get('lang') && tg.initDataUnsafe?.user?.language_code) {
          const lc = tg.initDataUnsafe.user.language_code.toLowerCase();
          if (lc.startsWith('ru')) setLang('ru');
          else if (lc.startsWith('en')) setLang('en');
          else if (lc.startsWith('uz')) setLang('uz');
        }
      } catch {}
    }
  }, []);

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

  // 3. Data State
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    try {
      const stored = localStorage.getItem('cafe_foods');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialFoodItems;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // User's active confirmed order IDs (persisted until user dismisses them)
  const [userActiveOrderIds, setUserActiveOrderIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cafe_user_active_order_ids');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('cafe_settings');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      telegramUsername: 'sifaddinov',
      instagramUsername: 'sifaddinovv',
    };
  });

  const [tables, setTables] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cafe_tables');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  });

  // 4. UI Views & Modals
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

  // 5. Filtering State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxCalories, setMaxCalories] = useState<number>(1000);
  const [isSpicyOnly, setIsSpicyOnly] = useState(false);
  const [isVegetarianOnly, setIsVegetarianOnly] = useState(false);
  const [isGlutenFreeOnly, setIsGlutenFreeOnly] = useState(false);

  // 6. Orders & Waiter Calls (Synchronized with Backend Server)
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
          localStorage.setItem('cafe_foods', JSON.stringify(data.foods));
        }
        if (data.settings) {
          setSettings((prev) => {
            if (
              prev &&
              prev.telegramUsername === data.settings.telegramUsername &&
              prev.instagramUsername === data.settings.instagramUsername
            ) {
              return prev;
            }
            try {
              localStorage.setItem('cafe_settings', JSON.stringify(data.settings));
            } catch {}
            return data.settings;
          });
        }
        if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
          setTables((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(data.tables)) return prev;
            try {
              localStorage.setItem('cafe_tables', JSON.stringify(data.tables));
            } catch {}
            return data.tables;
          });
        }
      }
    } catch (err) {
      // Fallback silently if offline or server booting
    }
  };

  // Initial load of foods, settings, and tables
  useEffect(() => {
    fetch('/api/foods')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFoodItems(data);
          localStorage.setItem('cafe_foods', JSON.stringify(data));
        }
      })
      .catch((e) => console.warn('Could not fetch initial foods:', e));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && (typeof data.telegramUsername === 'string' || typeof data.instagramUsername === 'string')) {
          setSettings(data);
          try {
            localStorage.setItem('cafe_settings', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});

    fetch('/api/tables')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTables(data);
          try {
            localStorage.setItem('cafe_tables', JSON.stringify(data));
          } catch {}
        }
      })
      .catch((e) => console.warn('Could not fetch initial tables:', e));

    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);
    return () => clearInterval(interval);
  }, []);

  // Quick, smooth dismiss of initial loading screen once ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 220);
    return () => clearTimeout(timer);
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
      if (e.key === 'cafe_user_active_order_ids' && e.newValue) {
        setUserActiveOrderIds(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = translations[lang] || translations.uz;

  // Waiter Call protection, countdown cooldown and live sync
  const [waiterCooldown, setWaiterCooldown] = useState<number>(() => {
    try {
      const savedTime = localStorage.getItem('cafe_user_waiter_call_time');
      if (savedTime) {
        const elapsed = Math.floor((Date.now() - Number(savedTime)) / 1000);
        if (elapsed < 45) return 45 - elapsed;
      }
    } catch {}
    return 0;
  });

  const [userHasActiveWaiterCall, setUserHasActiveWaiterCall] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cafe_user_waiter_call_active') === 'true';
    } catch {
      return false;
    }
  });

  const [waiterOnTheWayMessage, setWaiterOnTheWayMessage] = useState<string | null>(null);

  // Countdown timer for 45-second cooldown
  useEffect(() => {
    if (waiterCooldown <= 0) return;
    const interval = setInterval(() => {
      setWaiterCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [waiterCooldown]);

  // Watch for Admin answering/resolving waiter calls for this table
  useEffect(() => {
    if (!userHasActiveWaiterCall) return;
    const activeCalls = (waiterCalls || []).filter(
      (c) =>
        String(c.tableNumber) === String(tableNumber) &&
        (c.type === 'waiter' || (c as any).type === 'call_waiter') &&
        (c.status === 'active' || (c as any).status === 'pending')
    );
    // When all active waiter calls for this table are resolved by admin
    if (activeCalls.length === 0) {
      setUserHasActiveWaiterCall(false);
      try {
        localStorage.removeItem('cafe_user_waiter_call_active');
        localStorage.removeItem('cafe_user_waiter_call_time');
      } catch {}
      setWaiterCooldown(0);
      setWaiterOnTheWayMessage(t.waiterOnTheWay || "Ofitsiant yo'lda!");
      const timer = setTimeout(() => {
        setWaiterOnTheWayMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [waiterCalls, userHasActiveWaiterCall, tableNumber, t.waiterOnTheWay]);

  // Active confirmed orders belonging to this user
  const activeUserOrders = useMemo(() => {
    return orders.filter((o) => userActiveOrderIds.includes(o.id));
  }, [orders, userActiveOrderIds]);

  const totalActiveBillAmount = useMemo(() => {
    return activeUserOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [activeUserOrders]);

  const handleDismissActiveOrder = (orderId: string) => {
    setUserActiveOrderIds((prev) => {
      const updated = prev.filter((id) => id !== orderId);
      localStorage.setItem('cafe_user_active_order_ids', JSON.stringify(updated));
      return updated;
    });
  };

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

    if (type === 'waiter') {
      setWaiterCooldown(45);
      setUserHasActiveWaiterCall(true);
      try {
        localStorage.setItem('cafe_user_waiter_call_active', 'true');
        localStorage.setItem('cafe_user_waiter_call_time', String(Date.now()));
      } catch {}
    }

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

  // Batch resolve all active/pending waiter calls for a specific table
  const handleResolveWaiterCallsByTable = async (tblNum: string, type: string = 'waiter') => {
    setWaiterCalls((prev) =>
      (prev || []).map((c) => {
        if (
          String(c.tableNumber) === String(tblNum) &&
          (c.type === type || (type === 'waiter' && (c as any).type === 'call_waiter')) &&
          (c.status === 'active' || (c as any).status === 'pending')
        ) {
          return { ...c, status: 'resolved' };
        }
        return c;
      })
    );
    try {
      await fetch(
        `/api/waiter-calls/table/${encodeURIComponent(tblNum)}/resolve?type=${encodeURIComponent(type)}`,
        { method: 'PATCH' }
      );
      syncWithServer();
    } catch (e) {
      console.error('Failed to batch resolve waiter calls:', e);
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

    // Keep active order in user's active orders
    setUserActiveOrderIds((prev) => {
      const updated = [newOrder.id, ...prev];
      localStorage.setItem('cafe_user_active_order_ids', JSON.stringify(updated));
      return updated;
    });

    setCartItems([]);

    // Show receipt modal
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

  // Admin handlers
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
    setFoodItems((prev) => {
      const updated = prev.map((i) => (i.id === updatedItem.id ? updatedItem : i));
      try {
        localStorage.setItem('cafe_foods', JSON.stringify(updated));
      } catch {}
      return updated;
    });
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

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('cafe_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        localStorage.setItem('cafe_settings', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to update settings:', e);
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

  const handleAddTable = async (tableNum: string) => {
    const trimmed = tableNum.trim();
    if (!trimmed) return;
    setTables((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem('cafe_tables', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: trimmed }),
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to save table to server:', e);
    }
  };

  const handleDeleteTable = async (tableNum: string) => {
    const trimmed = tableNum.trim();
    setTables((prev) => {
      const updated = prev.filter((t) => t !== trimmed);
      try {
        localStorage.setItem('cafe_tables', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await fetch(`/api/tables/${encodeURIComponent(trimmed)}`, {
        method: 'DELETE',
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to delete table from server:', e);
    }
  };

  const handleSetTablesBatch = async (newTablesList: string[]) => {
    const cleaned = Array.from(new Set(newTablesList.map((t) => String(t).trim()).filter(Boolean)));
    if (cleaned.length === 0) return;
    setTables(cleaned);
    try {
      localStorage.setItem('cafe_tables', JSON.stringify(cleaned));
    } catch {}
    try {
      await fetch('/api/tables/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: cleaned }),
      });
      syncWithServer();
    } catch (e) {
      console.error('Failed to save tables batch to server:', e);
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
  const pendingCartTotal = (cartItems || []).reduce(
    (sum, item) => sum + (item?.food?.price || 0) * (item?.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen bg-[#FAF5EF] font-sans text-[#2E1E17] flex flex-col justify-between selection:bg-[#C0684C] selection:text-white">
      {/* 1. Animated Loading Screen matching Image 3 */}
      <LoadingScreen
        isLoading={isInitialLoading}
        lang={lang}
        onFinish={() => setIsInitialLoading(false)}
      />

      {/* 2. Top Header matching Image 2 */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        tableNumber={tableNumber}
        onTableChange={(newT) => {
          setTableNumber(newT);
          window.history.pushState({}, '', '?table=' + newT);
        }}
        cartCount={totalCartCount + activeUserOrders.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQrCode={() => setIsQrModalOpen(true)}
        onOpenReceipts={() => setIsCustomerReceiptsOpen(true)}
        receiptsCount={savedReceiptsCount}
        isAdminView={isAdminView}
        onToggleAdminView={handleToggleAdminView}
        onCallWaiter={handleCallWaiter}
        activeOrdersCount={activeUserOrders.length}
        totalActiveAmount={totalActiveBillAmount}
        waiterCooldown={waiterCooldown}
        onStartWaiterCooldown={(sec) => setWaiterCooldown(sec)}
        waiterOnTheWayMessage={waiterOnTheWayMessage}
      />

      {/* 3. Main Body */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 w-full flex-1 space-y-5">
        {/* Admin Panel Toggle View */}
        {isAdminView ? (
          <Suspense
            fallback={
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#C0684C]/30 border-t-[#C0684C] rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-[#8D6B58]">
                  {lang === 'qr' ? 'Admin panel júklenbekte...' : 'Admin panel yuklanmoqda...'}
                </p>
              </div>
            }
          >
            <AdminPanel
              lang={lang}
              foodItems={foodItems}
              orders={orders}
              waiterCalls={waiterCalls}
              settings={settings}
              tables={tables}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
              onSetTablesBatch={handleSetTablesBatch}
              adminPassword={adminPassword}
              onUpdatePassword={setAdminPassword}
              onUpdateSettings={handleUpdateSettings}
              onAddFoodItem={handleAddFoodItem}
              onUpdateFoodItem={handleUpdateFoodItem}
              onDeleteFoodItem={handleDeleteFoodItem}
              onResolveWaiterCall={handleResolveWaiterCall}
              onResolveWaiterCallsByTable={handleResolveWaiterCallsByTable}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onCloseAdmin={() => setIsAdminView(false)}
            />
          </Suspense>
        ) : (
          <>
            {/* Search Bar matching Image 2 */}
            <div className="relative w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder || 'Qidirish...'}
                aria-label={t.searchPlaceholder || 'Qidirish'}
                className="w-full pl-4 pr-11 py-2.5 sm:py-3 rounded-2xl bg-[#F1EAE0] border border-[#E6DDD2] text-xs sm:text-sm text-[#2E1E17] placeholder-[#8D6B58] outline-none focus:ring-1 focus:ring-[#C0684C] shadow-2xs"
              />
              <Search
                className="w-4 h-4 text-[#C0684C] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Categories Selector Tabs matching Image 2 */}
            <nav
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x -mx-3 px-3 sm:mx-0 sm:px-0"
              aria-label="Kategoriyalar"
            >
              {[
                { id: 'all', label: t.catAll || 'Barchasi' },
                { id: 'cakes', label: t.catCakes || 'Tortlar' },
                { id: 'pastries', label: t.catPastries || 'Pirojniylar' },
                { id: 'bakery', label: t.catBakery || 'Pishiriqlar' },
                { id: 'coffee', label: t.catCoffee || 'Qahva' },
                { id: 'desserts', label: t.catDesserts || 'Shirinliklar' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as CategoryId)}
                  aria-pressed={selectedCategory === cat.id}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-xs ${
                    selectedCategory === cat.id
                      ? 'bg-[#C0684C] text-white shadow-sm'
                      : 'bg-[#F1EAE0] text-[#2E1E17] hover:bg-[#EAE0D4]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>

            {/* Sub-Filters: Calorie slider & Tags */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#EAE0D4] shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                {/* Calorie Filter */}
                <div className="w-full sm:w-72 flex items-center justify-between gap-2 text-xs">
                  <label htmlFor="calorie-slider" className="font-semibold text-[#8D6B58] shrink-0 text-[11px] sm:text-xs">
                    {t.filterByCalorie || 'Max Kaloriya'}:
                  </label>
                  <input
                    id="calorie-slider"
                    type="range"
                    min={150}
                    max={1000}
                    step={50}
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(parseInt(e.target.value))}
                    className="accent-[#C0684C] flex-1 cursor-pointer h-1.5"
                  />
                  <span className="font-bold text-[#C0684C] text-[11px] sm:text-xs shrink-0 w-14 text-right">
                    {maxCalories} kcal
                  </span>
                </div>

                {/* Dietary Tags & Reset */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsVegetarianOnly((p) => !p)}
                      aria-pressed={isVegetarianOnly}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-semibold text-[11px] sm:text-xs border transition ${
                        isVegetarianOnly
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-[#FAF5EF] text-[#6C5343] border-[#EAE0D4]'
                      }`}
                    >
                      🌱 {t.filterVegetarian}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsGlutenFreeOnly((p) => !p)}
                      aria-pressed={isGlutenFreeOnly}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-semibold text-[11px] sm:text-xs border transition ${
                        isGlutenFreeOnly
                          ? 'bg-[#C0684C]/15 text-[#C0684C] border-[#C0684C]/40'
                          : 'bg-[#FAF5EF] text-[#6C5343] border-[#EAE0D4]'
                      }`}
                    >
                      🌾 {t.filterGlutenFree}
                    </button>
                  </div>

                  {(searchQuery || maxCalories < 1000 || isVegetarianOnly || isGlutenFreeOnly) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setMaxCalories(1000);
                        setIsVegetarianOnly(false);
                        setIsGlutenFreeOnly(false);
                      }}
                      className="text-[#C0684C] hover:text-[#A9563C] font-semibold text-[11px] sm:text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t.resetFilters}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Food Grid: 2 columns on mobile, 3-4 on larger screens (Image 2) */}
            <div className="space-y-3 pb-24 sm:pb-28">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#2E1E17]">
                  {selectedCategory === 'all'
                    ? t.catAll || 'Barchasi'
                    : selectedCategory === 'cakes'
                    ? t.catCakes || 'Tortlar'
                    : selectedCategory === 'pastries'
                    ? t.catPastries || 'Pirojniylar'
                    : selectedCategory === 'bakery'
                    ? t.catBakery || 'Pishiriqlar'
                    : selectedCategory === 'coffee'
                    ? t.catCoffee || 'Qahva'
                    : t.catDesserts || 'Shirinliklar'}{' '}
                  <span className="text-[#8D6B58] font-sans font-normal text-xs sm:text-sm">
                    ({filteredFoodItems.length})
                  </span>
                </h2>
              </div>

              {filteredFoodItems.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-[#EAE0D4] text-center space-y-2 my-6">
                  <div className="text-4xl">🍰</div>
                  <h3 className="font-serif font-bold text-base text-[#2E1E17]">
                    {t.noFoodsFound || 'Shiyrinlikler tabılmadı'}
                  </h3>
                  <p className="text-xs text-[#8D6B58]">
                    {t.noFoodsFoundSub || 'Iltimas, filtrlerdi yamasa izlew sózin ózgertip kóriń.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  {filteredFoodItems.map((food, index) => {
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
                        isPriority={index < 2}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 4. Floating Bottom Cart Bar (Image 2) */}
      {!isAdminView && (totalCartCount > 0 || activeUserOrders.length > 0) && (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-slideUp">
          <div
            onClick={() => setIsCartOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIsCartOpen(true);
            }}
            className="w-full bg-[#C0684C] hover:bg-[#B05B3F] text-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-[0_8px_25px_rgba(192,104,76,0.4)] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-white/90 font-medium">
                  {t.cartFloating || t.cartTitle} ({totalCartCount + activeUserOrders.length})
                </span>
                <span className="font-extrabold text-sm sm:text-base text-white">
                  {formatPrice(
                    pendingCartTotal +
                      activeUserOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-bold text-xs sm:text-sm bg-white/20 px-3 py-1.5 rounded-xl">
              <span>{t.cartTitle || 'Savat'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* 5. Modals & Drawers */}
      <Suspense fallback={null}>
        {selectedFood && (
          <FoodDetailModal
            food={selectedFood}
            lang={lang}
            onClose={() => setSelectedFood(null)}
            onAddToCart={handleAddToCart}
            onAddReview={handleAddReview}
          />
        )}
      </Suspense>

      <CartDrawer
        isOpen={isCartOpen}
        lang={lang}
        tableNumber={tableNumber}
        items={cartItems}
        activeOrders={activeUserOrders}
        onDismissOrder={handleDismissActiveOrder}
        isSubmitting={isSubmittingOrder}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedPayment={handleConfirmOrder}
      />

      <Suspense fallback={null}>
        {isReceiptOpen && (
          <ReceiptModal
            isOpen={isReceiptOpen}
            lang={lang}
            order={receiptOrder}
            onClose={() => setIsReceiptOpen(false)}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {isCustomerReceiptsOpen && (
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
        )}
      </Suspense>

      <Suspense fallback={null}>
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
      </Suspense>

      <Suspense fallback={null}>
        {isQrModalOpen && (
          <QRCodeModal
            isOpen={isQrModalOpen}
            lang={lang}
            tableNumber={tableNumber}
            onClose={() => setIsQrModalOpen(false)}
          />
        )}
      </Suspense>

      {/* 6. Footer */}
      <Footer lang={lang} settings={settings} />
    </div>
  );
}
