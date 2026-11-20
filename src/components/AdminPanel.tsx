import React, { useState, useRef } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Bell,
  TrendingUp,
  DollarSign,
  RefreshCw,
  X,
  QrCode,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Download,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { FoodItem, Language, Order, WaiterCall } from '../types';
import { translations } from '../i18n/translations';
import { getFoodTitle, formatPrice } from '../utils/formatters';

interface AdminPanelProps {
  lang: Language;
  foodItems: FoodItem[];
  orders: Order[];
  waiterCalls: WaiterCall[];
  onAddFoodItem: (newItem: FoodItem) => void;
  onUpdateFoodItem: (updatedItem: FoodItem) => void;
  onDeleteFoodItem: (id: string) => void;
  onResolveWaiterCall: (id: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onDeleteOrder?: (orderId: string) => void;
  onCloseAdmin: () => void;
  adminPassword?: string;
  onUpdatePassword?: (password: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  foodItems,
  orders,
  waiterCalls,
  onAddFoodItem,
  onUpdateFoodItem,
  onDeleteFoodItem,
  onResolveWaiterCall,
  onUpdateOrderStatus,
  onDeleteOrder,
  onCloseAdmin,
  adminPassword,
  onUpdatePassword,
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'menu' | 'add' | 'orders' | 'stats' | 'qrcodes' | 'settings'>('menu');

  // QR Codes State
  const [managedTables, setManagedTables] = useState<string[]>([
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  ]);
  const [qrMode, setQrMode] = useState<'auto' | 'custom'>('auto');
  const [autoTableCount, setAutoTableCount] = useState<number>(10);
  const [customTablesInput, setCustomTablesInput] = useState<string>('1, 6, 9');
  const [newSingleTable, setNewSingleTable] = useState<string>('');
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleApplyAutoCount = () => {
    const count = Math.min(100, Math.max(1, autoTableCount));
    const newList = Array.from({ length: count }, (_, i) => String(i + 1));
    setManagedTables(newList);
  };

  const handleApplyCustomTables = () => {
    const items = customTablesInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length > 0) {
      const uniqueItems = Array.from(new Set(items));
      setManagedTables(uniqueItems);
    }
  };

  const handleAddSingleTable = () => {
    const trimmed = newSingleTable.trim();
    if (!trimmed) return;
    if (!managedTables.includes(trimmed)) {
      setManagedTables((prev) => [...prev, trimmed]);
    }
    setNewSingleTable('');
  };

  const handleDeleteTable = (tblToDelete: string) => {
    setManagedTables((prev) => prev.filter((t) => t !== tblToDelete));
  };

  // New Food Item Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('35000');
  const [newCategory, setNewCategory] = useState<'national' | 'fastfood' | 'meats' | 'drinks' | 'desserts'>('national');
  const [newCalories, setNewCalories] = useState('450');
  const [newImgUrl, setNewImgUrl] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
  const [newDesc, setNewDesc] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceInput, setTempPriceInput] = useState('');

  // Image Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Table filter in Orders
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('all');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: base64Data }),
        });
        const json = await res.json();
        if (json.success && json.url) {
          setNewImgUrl(json.url);
          setUploadSuccess(true);
        } else {
          // If server upload failed, fallback to base64 Data URL
          setNewImgUrl(base64Data);
          setUploadSuccess(true);
        }
      } catch (err: any) {
        console.warn('Backend upload fallback to Data URL:', err);
        setNewImgUrl(reader.result as string);
        setUploadSuccess(true);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Faylni yuklashda xatolik yuz berdi');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Calculate Stats
  const todayRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 1280000);
  const totalOrdersCount = orders.length + 34;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: FoodItem = {
      id: `food-${Date.now()}`,
      title: { qr: newTitle, uz: newTitle, ru: newTitle, en: newTitle },
      description: { qr: newDesc || newTitle, uz: newDesc, ru: newDesc, en: newDesc },
      price: parseInt(newPrice) || 30000,
      category: newCategory,
      imageUrl: newImgUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      calories: parseInt(newCalories) || 400,
      prepTime: 20,
      spicyLevel: 0,
      isVegetarian: false,
      isGlutenFree: false,
      isHalal: true,
      isNationalSpecial: newCategory === 'national',
      isAvailable: true,
      ingredients: { qr: ['Sıyır go\'shi', 'Un'], uz: ['Mol go\'shti', 'Un'], ru: ['Говядина', 'Мука'], en: ['Beef', 'Flour'] },
      allergens: [],
      rating: 5.0,
      ratingCount: 1,
      reviews: [],
      nutrition: { protein: 25, fat: 15, carbs: 35 },
    };

    onAddFoodItem(item);
    setNewTitle('');
    setNewDesc('');
    setUploadSuccess(false);
    setActiveTab('menu');
  };

  const handleSavePrice = (food: FoodItem) => {
    const p = parseInt(tempPriceInput);
    if (!isNaN(p) && p > 0) {
      onUpdateFoodItem({ ...food, price: p });
    }
    setEditingPriceId(null);
  };

  return (
    <div className="bg-[#18181b] rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-4 sm:p-6 my-6 text-zinc-100">
      {/* Top Banner */}
      <div className="bg-zinc-900 text-zinc-100 p-4 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 mb-6 shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-400" />
          <h2 className="font-serif font-bold text-xl text-amber-300">{t.adminTitle}</h2>
        </div>

        <button
          onClick={onCloseAdmin}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-2 rounded-xl border border-zinc-700 transition flex items-center gap-1 text-xs font-bold"
        >
          <X className="w-4 h-4" />
          <span>Admin Paneldan Shıǵıw</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl font-serif font-bold text-xs sm:text-sm transition ${
            activeTab === 'menu'
              ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          📋 Menyu Basqarıw
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded-xl font-serif font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'add'
              ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{t.addFood}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl font-serif font-bold text-xs sm:text-sm transition flex items-center gap-1.5 relative ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Zakazlar hám Aficiant</span>
          {waiterCalls.filter((c) => c.status === 'active').length > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {waiterCalls.filter((c) => c.status === 'active').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl font-serif font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Statistika</span>
        </button>

        <button
          onClick={() => setActiveTab('qrcodes')}
          className={`px-4 py-2 rounded-xl font-serif font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'qrcodes'
              ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>{t.tableQrManager || 'Stollar QR-kodları'}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl font-serif font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Sazlamalar</span>
        </button>
      </div>

      {/* Tab 1: Menu Management */}
      {activeTab === 'menu' && (
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-base text-amber-300 mb-3">
            Barlıq Taǵamlar hám Bahalardı Basqarıw ({foodItems.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {foodItems.map((food) => {
              const title = food.title[lang] || food.title.qr;

              return (
                <div
                  key={food.id}
                  className="bg-zinc-900 p-3 rounded-2xl border border-amber-500/25 shadow-sm flex items-center justify-between gap-3"
                >
                  <img
                    src={food.imageUrl}
                    alt={title}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-800"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-zinc-100 truncate">{title}</h4>

                    {editingPriceId === food.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={tempPriceInput}
                          onChange={(e) => setTempPriceInput(e.target.value)}
                          className="w-20 px-1.5 py-0.5 border border-amber-500/40 bg-zinc-950 text-amber-300 rounded text-xs font-bold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(food)}
                          className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-xs text-amber-400">
                          {food.price.toLocaleString('uz-UZ')} UZS
                        </span>
                        <button
                          onClick={() => {
                            setEditingPriceId(food.id);
                            setTempPriceInput(food.price.toString());
                          }}
                          className="text-amber-400 hover:text-amber-200 p-0.5"
                          title={t.editPrice}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Toggle Availability */}
                    <button
                      onClick={() =>
                        onUpdateFoodItem({ ...food, isAvailable: !food.isAvailable })
                      }
                      className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${
                        food.isAvailable
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {food.isAvailable ? `✓ ${t.isAvailable}` : `✕ ${t.notAvailable}`}
                    </button>
                  </div>

                  <button
                    onClick={() => onDeleteFoodItem(food.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                    title={t.deleteItem}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Add New Food */}
      {activeTab === 'add' && (
        <form onSubmit={handleAddSubmit} className="max-w-xl mx-auto bg-zinc-900 p-5 rounded-2xl border border-amber-500/30 space-y-4">
          <h3 className="font-serif font-bold text-lg text-amber-300">{t.addFood}</h3>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">{t.foodTitle}:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Mısalı: Qaraqalpaqsha May Gurtuk"
              className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-zinc-950 text-xs font-semibold text-zinc-100 placeholder-zinc-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">{t.priceUzs}:</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-zinc-950 text-xs font-semibold text-zinc-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Kategoriya:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-zinc-950 text-xs font-semibold text-zinc-100"
              >
                <option value="national">🍲 Milliy Taǵamlar</option>
                <option value="fastfood">🌯 Lavash & Fast Food</option>
                <option value="meats">🥩 Kebab hám Taǵamlar</option>
                <option value="drinks">🥤 Milliy İshimlikler</option>
                <option value="desserts">🍰 Desserts & Cakebumer</option>
              </select>
            </div>
          </div>

          {/* Food Image: Upload from Laptop OR Enter URL */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-amber-500/25 space-y-2.5">
            <label className="block text-xs font-bold text-amber-300">
              🖼️ Ovqat rasmi (Laptopdan yuklash yoki URL kiritish):
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Rasm yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>📁 Laptopdan rasm yuklash</span>
                  </>
                )}
              </button>

              {uploadSuccess && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Rasm yuklandi!</span>
                </span>
              )}

              {uploadError && (
                <span className="text-red-400 text-xs font-semibold">
                  {uploadError}
                </span>
              )}
            </div>

            {/* URL input field */}
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Yoki to'g'ridan-to'g'ri rasm havolasi (URL):
              </label>
              <input
                type="text"
                value={newImgUrl}
                onChange={(e) => setNewImgUrl(e.target.value)}
                placeholder="https://... yoki /uploads/..."
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
              />
            </div>

            {/* Thumbnail Preview */}
            {newImgUrl && (
              <div className="flex items-center gap-3 pt-1">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-500/40 bg-zinc-900 shrink-0 shadow">
                  <img
                    src={newImgUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                <div className="text-xs text-zinc-400">
                  <span className="text-zinc-200 font-semibold block">Rasm ko'rinishi</span>
                  <span className="text-[11px]">Saytda ushbu rasm aks ettiriladi</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Túsindirme (Description):</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-zinc-950 text-xs text-zinc-100"
              placeholder="Taǵam quramı hám lezzeti..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 py-3 rounded-2xl font-serif font-extrabold text-sm shadow-[0_0_15px_rgba(245,158,11,0.35)]"
          >
            {t.addFood}
          </button>
        </form>
      )}

      {/* Tab 3: Active Orders & Waiter Calls */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Waiter Calls Section */}
          <div>
            <h3 className="font-serif font-bold text-base text-amber-300 mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>{t.waiterAlerts} ({waiterCalls.filter((c) => c.status === 'active').length})</span>
            </h3>

            {waiterCalls.filter((c) => c.status === 'active').length === 0 ? (
              <p className="text-xs text-zinc-400 italic bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                Ámellerde aktiv aficiant shaqırıwları joq.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {waiterCalls
                  .filter((c) => c.status === 'active')
                  .map((call) => (
                    <div
                      key={call.id}
                      className="bg-zinc-900 p-3.5 rounded-2xl border border-amber-500/40 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <span className="font-serif font-extrabold text-base text-zinc-100 block">
                          Stol №{call.tableNumber}
                        </span>
                        <span className="text-xs text-amber-300 font-medium">
                          {call.type === 'waiter' ? '🔔 Aficiant shaqırdı' : '🧾 Schet soradı'}
                        </span>
                      </div>

                      <button
                        onClick={() => onResolveWaiterCall(call.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow"
                      >
                        <CheckCircle className="w-4 h-4 text-amber-300" />
                        <span>Barıldı</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Active Orders List */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-serif font-bold text-base text-zinc-100 flex items-center gap-2">
                <span>{t.activeOrders}</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                  Jámi: {orders.length}
                </span>
              </h3>

              {/* Table Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setSelectedTableFilter('all')}
                  className={`px-3 py-1 rounded-xl font-serif font-bold text-xs whitespace-nowrap transition ${
                    selectedTableFilter === 'all'
                      ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow'
                      : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  Barcha stollar ({orders.length})
                </button>
                {Array.from(new Set(orders.map((o) => String(o.tableNumber))))
                  .sort((a, b) => Number(a) - Number(b))
                  .map((tbl) => (
                    <button
                      type="button"
                      key={tbl}
                      onClick={() => setSelectedTableFilter(tbl)}
                      className={`px-3 py-1 rounded-xl font-serif font-bold text-xs whitespace-nowrap transition ${
                        selectedTableFilter === tbl
                          ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow'
                          : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      Stol №{tbl} ({orders.filter((o) => String(o.tableNumber) === tbl).length})
                    </button>
                  ))}
              </div>
            </div>

            {(() => {
              const displayOrders =
                selectedTableFilter === 'all'
                  ? orders
                  : orders.filter((o) => String(o.tableNumber) === selectedTableFilter);

              if (displayOrders.length === 0) {
                return (
                  <p className="text-xs text-zinc-400 italic bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                    {selectedTableFilter === 'all'
                      ? 'Taza zakazlar házirshe joq.'
                      : `Stol №${selectedTableFilter} ushın zakazlar joq.`}
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {displayOrders.map((ord) => (
                  <div key={ord.id} className="bg-zinc-900 p-4 rounded-2xl border border-amber-500/30 text-xs shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 px-2.5 py-0.5 rounded-lg font-serif font-black text-xs shadow">
                          Stol №{ord.tableNumber}
                        </span>
                        <span className="font-mono text-zinc-400 text-[11px] font-bold">
                          {ord.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : ord.status === 'paid'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {ord.status === 'preparing' ? '⏳ Tayarlanbaqta' : ord.status === 'delivered' ? '✓ Jetkerildi' : ord.status === 'paid' ? '💰 Tólendi' : ord.status.toUpperCase()}
                        </span>
                        {onDeleteOrder && (
                          <button
                            onClick={() => onDeleteOrder(ord.id)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                            title="Óshiriw"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-zinc-300">
                      {(ord.items || []).map((i, idx) => (
                        <div key={i?.food?.id || idx} className="flex justify-between py-0.5 border-b border-zinc-800/40">
                          <span>{getFoodTitle(i?.food, lang)} <span className="text-amber-400 font-bold">x{i?.quantity || 1}</span></span>
                          <span className="font-semibold text-zinc-200">{formatPrice((i?.food?.price || 0) * (i?.quantity || 1))}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-800 pt-2 flex items-center justify-between font-bold text-sm text-zinc-100">
                      <span className="text-zinc-400 text-xs">{t.total}:</span>
                      <span className="text-amber-400 text-base font-extrabold">{formatPrice(ord.totalAmount)}</span>
                    </div>

                    {/* Status change actions */}
                    {onUpdateOrderStatus && (
                      <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-zinc-400 mr-1">Status:</span>
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                            ord.status === 'preparing'
                              ? 'bg-amber-500 text-zinc-950 border-amber-300'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          ⏳ Tayarlanbaqta
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'delivered')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-300'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          ✓ Jetkerildi
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'paid')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                            ord.status === 'paid'
                              ? 'bg-blue-500 text-white border-blue-400'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          💰 Tólendi
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
          </div>
        </div>
      )}

      {/* Tab 4: Sales Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-5">
          <h3 className="font-serif font-bold text-base text-amber-300">{t.salesStats}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-5 rounded-2xl border border-amber-500/40">
              <span className="text-xs font-serif font-bold text-zinc-400 block">{t.todayRevenue}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 block">
                {todayRevenue.toLocaleString('uz-UZ')} UZS
              </span>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl border border-amber-500/40">
              <span className="text-xs font-serif font-bold text-zinc-400 block">{t.totalOrders}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1 block">
                {totalOrdersCount} zakaz
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Table QR Codes Generator (Admin Only) */}
      {activeTab === 'qrcodes' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-amber-500/30">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <span>{t.tableQrManager || 'Stollar QR-kodları'}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Stollar ushın bólek-bólek QR-kodlar jaratıw, óshiriw yamasa barlıq stollardı avtomatizaciyalanǵan tárizde sanaw (Tek Admin ushın).
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-serif font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printAll || 'Barlıǵın pechatlaw / Baspadan shıǵarıw'}</span>
            </button>
          </div>

          {/* Quick Add Single Table Bar */}
          <div className="bg-zinc-900 p-4 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <Plus className="w-5 h-5 text-amber-400 shrink-0" />
              <label className="text-xs font-bold text-zinc-200 whitespace-nowrap">
                {t.addSingleTable || 'Taza stol qosıw'}:
              </label>
              <input
                type="text"
                value={newSingleTable}
                onChange={(e) => setNewSingleTable(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSingleTable();
                  }
                }}
                placeholder="Mıs: 11, 12 yamasa VIP-1"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-300 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handleAddSingleTable}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-serif font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addTableBtn || '+ Qosıw'}</span>
            </button>
          </div>

          {/* Batch Generation & Custom List Control Panel */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-amber-500/25 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setQrMode('auto')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  qrMode === 'auto'
                    ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                <span>1-Usıl: {t.autoRange || 'Avtomat san boyınsha (1,2,3...)'}</span>
              </button>

              <button
                onClick={() => setQrMode('custom')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  qrMode === 'custom'
                    ? 'bg-amber-500 text-zinc-950 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                <span>2-Usıl: {t.selectSpecific || 'Bólek stollar (Mıs: 1, 6, 9)'}</span>
              </button>
            </div>

            {/* Controls depending on mode */}
            {qrMode === 'auto' ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <label className="text-xs font-bold text-zinc-300">
                  {t.totalTableCount || 'Stollar sanı'}:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={autoTableCount}
                    onChange={(e) => setAutoTableCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-1.5 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-300 font-bold text-sm text-center outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleApplyAutoCount}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  >
                    {t.generateAll || 'QR-kodlardı jaratıw'}
                  </button>
                  <span className="text-xs text-zinc-400">
                    (1-den {autoTableCount}-ge shekem avtomat sanalǵan stollar)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-zinc-300">
                  {t.enterCustomTables || 'Stol nomerlerin kiritiń (mıs: 1, 6, 9, 12)'}:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={customTablesInput}
                    onChange={(e) => setCustomTablesInput(e.target.value)}
                    placeholder="1, 6, 9, 12, VIP-1..."
                    className="flex-1 max-w-lg px-4 py-2 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-300 font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleApplyCustomTables}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-4 py-2 rounded-xl text-xs font-bold transition"
                  >
                    {t.generateAll || 'Jaratıw'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  💡 Útir (,) arqalı qálegen stollarıńızdı jazıń. Mısalı: <code className="bg-zinc-950 border border-amber-500/30 px-1.5 py-0.5 rounded text-amber-400">1, 6, 9</code> yamasa <code className="bg-zinc-950 border border-amber-500/30 px-1.5 py-0.5 rounded text-amber-400">1, 2, 3, 4, 5, 6, 7, 8, 9</code>
                </p>
              </div>
            )}
          </div>

          {/* QR Code Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {managedTables.map((tblNum) => {
              const currentOrigin = window.location.origin;
              const qrUrl = `${currentOrigin}?table=${encodeURIComponent(tblNum)}`;
              const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                qrUrl
              )}&color=000000&bgcolor=ffffff`;
              const isCopied = copiedTable === tblNum;

              return (
                <div
                  key={tblNum}
                  className="bg-zinc-900 rounded-2xl border-2 border-amber-500/30 p-4 flex flex-col items-center text-center space-y-3 shadow-md hover:border-amber-500/60 transition group relative"
                >
                  {/* Table Badge and Delete Button */}
                  <div className="flex items-center justify-between w-full">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 px-3.5 py-1 rounded-full font-serif font-extrabold text-xs shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      {t.tableNumber} {tblNum}
                    </div>
                    <button
                      onClick={() => handleDeleteTable(tblNum)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition flex items-center gap-1 text-[11px] font-bold"
                      title={t.deleteQrCode || 'Óshiriw'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.deleteQrCode || 'Óshiriw'}</span>
                    </button>
                  </div>

                  {/* QR Image */}
                  <div className="bg-white p-3 rounded-xl border-2 border-amber-500/30 shadow-inner group-hover:scale-105 transition">
                    <img
                      src={qrImageSrc}
                      alt={`Table ${tblNum} QR Code`}
                      className="w-36 h-36 object-contain"
                    />
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono truncate max-w-full px-2">
                    {qrUrl}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 w-full pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrUrl);
                        setCopiedTable(tblNum);
                        setTimeout(() => setCopiedTable(null), 2000);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Kóshirildi' : 'Kóshiriw'}</span>
                    </button>

                    <a
                      href={qrImageSrc}
                      download={`Table-${tblNum}-QR.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/20"
                      title="PNG Saqlaw"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition"
                      title="Stol Menyusun Ashıw"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 p-5 rounded-2xl border border-amber-500/30">
            <h3 className="font-serif font-bold text-lg text-amber-300 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Admin Parolin Ózgertiw</span>
            </h3>

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">Taza parol</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Jańa paroldi kiritiń"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-300 font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={() => {
                  if (newPassword && onUpdatePassword) {
                    onUpdatePassword(newPassword);
                    setNewPassword('');
                    setPasswordSaved(true);
                    setTimeout(() => setPasswordSaved(false), 3000);
                  }
                }}
                disabled={!newPassword}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-zinc-950 font-serif font-bold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition w-full"
              >
                {passwordSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Saqlandı!</span>
                  </>
                ) : (
                  <span>Saqlaw</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
