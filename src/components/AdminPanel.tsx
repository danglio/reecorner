import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  X,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Phone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Save,
  LogOut,
  Tag
} from 'lucide-react';
import {
  Product,
  ProductRarity,
  Order,
  OrderStatus,
  AppSettings
} from '../types';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getSettings,
  saveSettings,
  resetStorage,
  formatVND,
  ORDER_STATUS_MAP,
  getRarityBadgeInfo
} from '../services/storage';

export interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onDataChanged
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<{
    name: string;
    rarity: ProductRarity;
    price: number;
    originalPrice: number;
    description: string;
    image: string;
    inStock: boolean;
  }>({
    name: '',
    rarity: 'SSR',
    price: 150000,
    originalPrice: 200000,
    description: '',
    image: '',
    inStock: true
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('pending');
  const [cancelReason, setCancelReason] = useState<string>('');

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    zaloPhone: '0901234567',
    adminPin: '1412'
  });
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [settingsMessage, setSettingsMessage] = useState<string>('');

  // File input ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data when opened
  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = () => {
    setProducts(getProducts());
    setOrders(getOrders());
    setSettings(getSettings());
  };

  // Handle PIN Authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = getSettings();
    if (pinInput.trim() === currentSettings.adminPin) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
      loadAllData();
    } else {
      setPinError('Mã số bí mật không chính xác! (Gợi ý mặc định: 1412)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
  };

  // Image upload handler (converts file to Base64)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có dung lượng nhỏ hơn 2MB để tối ưu bộ nhớ trình duyệt.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProductForm(prev => ({ ...prev, image: reader.result as string }));
      }
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (productForm.price <= 0) {
      alert('Vui lòng nhập giá bán hợp lệ.');
      return;
    }

    const imageToSave = productForm.image.trim() || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      name: productForm.name.trim(),
      rarity: productForm.rarity,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      description: productForm.description.trim(),
      image: imageToSave,
      inStock: productForm.inStock,
      rating: editingProduct?.rating ?? 5.0
    };

    saveProduct(productData);
    setProducts(getProducts());
    setIsAddingProduct(false);
    setEditingProduct(null);
    onDataChanged?.();
    alert(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
  };

  // Start editing a product
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      rarity: product.rarity,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      description: product.description,
      image: product.image,
      inStock: product.inStock
    });
    setIsAddingProduct(true);
  };

  // Delete product
  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa vật phẩm "${name}" không?`)) {
      deleteProduct(id);
      setProducts(getProducts());
      onDataChanged?.();
    }
  };

  // Quick price update inline
  const handleQuickPriceChange = (id: string, newPriceStr: string) => {
    const newPrice = parseInt(newPriceStr, 10);
    if (isNaN(newPrice) || newPrice <= 0) return;

    const prod = products.find(p => p.id === id);
    if (!prod) return;

    const updated: Product = { ...prod, price: newPrice };
    saveProduct(updated);
    setProducts(getProducts());
    onDataChanged?.();
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId: string) => {
    updateOrderStatus(orderId, newOrderStatus, newOrderStatus === 'cancelled' ? cancelReason : undefined);
    setOrders(getOrders());
    setSelectedOrder(null);
    onDataChanged?.();
    alert(`Đã cập nhật trạng thái đơn #${orderId}!`);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.zaloPhone.trim()) {
      alert('Vui lòng nhập số điện thoại Zalo.');
      return;
    }

    let finalPin = settings.adminPin;
    if (newPin.trim()) {
      if (newPin !== confirmPin) {
        alert('Mã PIN mới và xác nhận mã PIN không khớp!');
        return;
      }
      finalPin = newPin.trim();
    }

    const updated: AppSettings = {
      zaloPhone: settings.zaloPhone.trim(),
      adminPin: finalPin
    };

    saveSettings(updated);
    setSettings(updated);
    setNewPin('');
    setConfirmPin('');
    setSettingsMessage('Đã lưu cấu hình thành công!');
    setTimeout(() => setSettingsMessage(''), 3000);
    onDataChanged?.();
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (confirm('Khôi phục toàn bộ dữ liệu mẫu (sản phẩm, đơn hàng, cài đặt gốc)?')) {
      resetStorage();
      loadAllData();
      onDataChanged?.();
      alert('Đã khôi phục dữ liệu ban đầu!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900/95 border border-conan-gold/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-conan-navy via-slate-900 to-conan-navy border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-conan-gold/20 border border-conan-gold/50 flex items-center justify-center text-conan-gold shadow-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                BẢNG QUẢN TRỊ BÍ MẬT
                <span className="text-xs px-2 py-0.5 rounded-full bg-conan-red/30 text-conan-red border border-conan-red/40 font-mono">
                  #1412
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Văn phòng Thám tử Conan • Hệ thống quản lý vật phẩm & đơn hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs border border-white/10 transition-colors"
                title="Khóa bảng quản trị"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Khóa</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        {!isAuthenticated ? (
          /* PIN Authentication Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center flex-1 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-conan-gold/20 to-conan-red/20 border border-conan-gold/40 flex items-center justify-center text-conan-gold mb-6 shadow-xl animate-pulse">
              <KeyRound className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-2">
              XÁC THỰC MẬT MÃ QUẢN TRỊ
            </h3>
            <p className="text-sm text-slate-400 text-center max-w-md mb-6">
              Vui lòng nhập mã số bí mật để truy cập bảng điều khiển quản lý shop và đơn hàng.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mã số bảo mật (PIN)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={10}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Nhập mã bí mật..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-conan-gold/40 text-center text-xl font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-conan-gold"
                  />
                  <Lock className="w-5 h-5 text-conan-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {pinError && (
                  <p className="text-xs text-conan-red mt-2 flex items-center gap-1.5 justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-conan-red to-red-600 hover:from-red-600 hover:to-conan-red text-white font-bold text-sm tracking-wide shadow-lg shadow-conan-red/25 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                ĐĂNG NHẬP QUẢN TRỊ
              </button>

              <div className="p-3 rounded-xl bg-conan-navy/50 border border-conan-gold/20 text-center">
                <p className="text-xs text-slate-400">
                  💡 Gợi ý mã PIN mặc định: <span className="font-mono text-conan-gold font-bold">1412</span> (Mật mã Siêu trộm Kid)
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs bar */}
            <div className="flex border-b border-white/10 bg-slate-950/60 px-6 pt-3 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 ${
                  activeTab === 'products'
                    ? 'border-conan-gold text-conan-gold bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                Quản Lý Sản Phẩm ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-conan-gold text-conan-gold bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Quản Lý Đơn Hàng ({orders.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-conan-gold text-conan-gold bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Phone className="w-4 h-4" />
                Cài Đặt Zalo & PIN
              </button>
            </div>

            {/* Tab contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: PRODUCT MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Action row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Danh mục Thẻ bài & Vật phẩm</h3>
                      <p className="text-xs text-slate-400">
                        Cho phép thêm ảnh mới từ máy tính, điều chỉnh giá tiền và thông tin vật phẩm
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          rarity: 'SSR',
                          price: 150000,
                          originalPrice: 200000,
                          description: '',
                          image: '',
                          inStock: true
                        });
                        setIsAddingProduct(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-conan-gold text-slate-950 font-bold text-xs sm:text-sm hover:bg-amber-400 transition-all shadow-lg shadow-conan-gold/20"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Sản Phẩm Mới
                    </button>
                  </div>

                  {/* Add / Edit Form Modal/Drawer */}
                  {isAddingProduct && (
                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-conan-gold/40 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Tag className="w-4 h-4 text-conan-gold" />
                          {editingProduct ? 'Chỉnh Sửa Vật Phẩm' : 'Thêm Vật Phẩm Mới Vào Cửa Hàng'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingProduct(false);
                            setEditingProduct(null);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Tên sản phẩm *
                            </label>
                            <input
                              type="text"
                              required
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              placeholder="Ví dụ: Thẻ Thám Tử Lừng Danh SSR..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-conan-gold focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Độ hiếm (Rarity)
                            </label>
                            <select
                              value={productForm.rarity}
                              onChange={(e) => setProductForm({ ...productForm, rarity: e.target.value as ProductRarity })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-conan-gold focus:outline-none"
                            >
                              <option value="SSR">SSR (Siêu Hiếm)</option>
                              <option value="UR">UR (Cực Hiếm - Vàng Kim)</option>
                              <option value="DETECTIVE">DETECTIVE (Huy Hiệu Mori)</option>
                              <option value="SR">SR (Hiếm)</option>
                              <option value="R">R (Phổ Thông)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Giá bán (VNĐ) *
                            </label>
                            <input
                              type="number"
                              required
                              min={1000}
                              step={1000}
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-conan-gold focus:outline-none font-mono"
                            />
                            <p className="text-[11px] text-conan-gold mt-1">
                              Hiển thị: {formatVND(productForm.price || 0)}
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Giá gốc (VNĐ) (Tùy chọn)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={productForm.originalPrice}
                              onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-conan-gold focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        {/* Image upload section */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-300">
                            Hình ảnh sản phẩm (Đẩy ảnh từ máy hoặc nhập URL)
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3 items-start">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-conan-navy hover:bg-slate-800 text-white text-xs border border-conan-gold/30 transition-colors"
                            >
                              <Upload className="w-4 h-4 text-conan-gold" />
                              Tải ảnh từ máy tính/điện thoại
                            </button>

                            <div className="flex-1 w-full">
                              <input
                                type="url"
                                value={productForm.image}
                                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                placeholder="Hoặc dán link ảnh URL..."
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-conan-gold focus:outline-none"
                              />
                            </div>

                            {productForm.image && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-conan-gold/50 flex-shrink-0 bg-slate-950">
                                <img
                                  src={productForm.image}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Mô tả vật phẩm
                          </label>
                          <textarea
                            rows={3}
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Mô tả chi tiết thẻ bài hoặc đạo cụ thám tử..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-conan-gold focus:outline-none resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="inStockCheck"
                            checked={productForm.inStock}
                            onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                            className="rounded accent-conan-gold w-4 h-4"
                          />
                          <label htmlFor="inStockCheck" className="text-xs text-slate-300 cursor-pointer">
                            Còn hàng trong kho (Hiển thị cho khách mua)
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingProduct(false);
                              setEditingProduct(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-conan-red hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-conan-red/20"
                          >
                            <Save className="w-4 h-4" />
                            {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm Mới'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Products table */}
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 text-slate-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Ảnh</th>
                          <th className="py-3 px-4">Tên Sản Phẩm</th>
                          <th className="py-3 px-4">Độ Hiếm</th>
                          <th className="py-3 px-4">Giá Tiền (Sửa nhanh)</th>
                          <th className="py-3 px-4">Trạng Thái</th>
                          <th className="py-3 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {products.map((p) => {
                          const badge = getRarityBadgeInfo(p.rarity);
                          return (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4">
                                <div className="w-12 h-14 rounded-lg overflow-hidden border border-white/10 bg-slate-900 flex-shrink-0">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium max-w-[200px] truncate" title={p.name}>
                                {p.name}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.badgeClass}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    key={`${p.id}-${p.price}`}
                                    type="number"
                                    step={1000}
                                    defaultValue={p.price}
                                    onBlur={(e) => handleQuickPriceChange(p.id, e.target.value)}
                                    className="w-28 px-2 py-1 rounded bg-slate-900 border border-white/10 text-conan-gold font-mono font-bold text-xs focus:border-conan-gold focus:outline-none"
                                  />
                                  <span className="text-[10px] text-slate-400">đ</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  p.inStock ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {p.inStock ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(p)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-conan-gold transition-colors"
                                    title="Chỉnh sửa sản phẩm"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                                    title="Xóa sản phẩm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Danh sách đơn hàng cần theo dõi</h3>
                      <p className="text-xs text-slate-400">
                        Cập nhật trạng thái giao hàng để khách tra cứu trực tiếp trên web theo mã đơn
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetData}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Khôi phục dữ liệu gốc
                    </button>
                  </div>

                  {/* Order editing status modal */}
                  {selectedOrder && (
                    <div className="p-4 rounded-xl bg-slate-800/90 border border-conan-gold/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h4 className="font-bold text-sm text-white">
                          Cập nhật trạng thái đơn #{selectedOrder.id} ({selectedOrder.customerName})
                        </h4>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Trạng thái mới</label>
                          <select
                            value={newOrderStatus}
                            onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-conan-gold focus:outline-none"
                          >
                            <option value="pending">1. Chờ xác nhận</option>
                            <option value="confirmed">2. Đã xác nhận</option>
                            <option value="processing">3. Đang xử lý</option>
                            <option value="shipping">4. Đang giao hàng</option>
                            <option value="delivered">5. Đã giao hàng</option>
                            <option value="cancelled">6. Đã hủy đơn</option>
                          </select>
                        </div>

                        {newOrderStatus === 'cancelled' && (
                          <div>
                            <label className="block text-xs text-slate-300 mb-1">Lý do hủy đơn</label>
                            <input
                              type="text"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Nhập lý do hủy..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-conan-gold focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs"
                        >
                          Đóng
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id)}
                          className="px-4 py-1.5 rounded-lg bg-conan-gold text-slate-950 font-bold text-xs hover:bg-amber-400"
                        >
                          Lưu Trạng Thái
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Orders table */}
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 text-slate-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Mã Đơn</th>
                          <th className="py-3 px-4">Khách Hàng</th>
                          <th className="py-3 px-4">SĐT</th>
                          <th className="py-3 px-4">Tổng Tiền</th>
                          <th className="py-3 px-4">Trạng Thái Hiện Tại</th>
                          <th className="py-3 px-4 text-right">Đổi Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {orders.map((o) => {
                          const statusInfo = ORDER_STATUS_MAP[o.status] || {
                            label: o.status,
                            badgeBg: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          };
                          return (
                            <tr key={o.id} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-4 font-mono font-bold text-conan-gold">
                                #{o.id}
                              </td>
                              <td className="py-3 px-4 font-medium">{o.customerName}</td>
                              <td className="py-3 px-4 font-mono text-slate-300">{o.phone}</td>
                              <td className="py-3 px-4 font-mono font-bold text-white">
                                {formatVND(o.total)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusInfo.badgeBg}`}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrder(o);
                                    setNewOrderStatus(o.status);
                                    setCancelReason(o.cancelReason || '');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-conan-navy hover:bg-slate-800 text-conan-gold font-bold text-xs border border-conan-gold/30 transition-colors"
                                >
                                  Cập Nhật
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & ZALO CONFIG */}
              {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Cấu hình Zalo Người Bán & Mã PIN</h3>
                    <p className="text-xs text-slate-400">
                      Thay đổi số điện thoại Zalo tiếp nhận đơn và mã số đăng nhập quản trị bí mật
                    </p>
                  </div>

                  {settingsMessage && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {settingsMessage}
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-white/10">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-conan-gold" />
                        Số điện thoại Zalo người bán (Tiếp nhận tin nhắn đặt hàng) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.zaloPhone}
                        onChange={(e) => setSettings({ ...settings, zaloPhone: e.target.value })}
                        placeholder="Ví dụ: 0901234567..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-conan-gold focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tất cả các nút "Gửi đơn qua Zalo" trên web sẽ tự động chuyển hướng tới số này.
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-3">
                      <h4 className="text-xs font-bold text-conan-gold flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        ĐỔI MÃ SỐ BÍ MẬT QUẢN TRỊ (PIN)
                      </h4>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Mã PIN mới (Để trống nếu không muốn đổi)
                        </label>
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Nhập mã PIN mới..."
                          className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-conan-gold focus:outline-none"
                        />
                      </div>

                      {newPin && (
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Xác nhận mã PIN mới
                          </label>
                          <input
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            placeholder="Nhập lại mã PIN mới..."
                            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-conan-gold focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-conan-gold to-amber-500 hover:from-amber-500 hover:to-conan-gold text-slate-950 font-bold text-sm shadow-lg shadow-conan-gold/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        LƯU CẤU HÌNH HỆ THỐNG
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
