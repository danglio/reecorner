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
  Tag,
  GitBranch,
  GitCommit,
  Download,
  Copy,
  Terminal,
  FileCode,
  ExternalLink,
  Check,
  Sparkles
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
  getRarityBadgeInfo,
  getCustomTags,
  addCustomTag,
  deleteCustomTag,
  clearAllSsrRarityTags,
  checkSyncStatus,
  syncToSourceCode,
  exportStoreDataJSON,
  exportStoreDataTypeScript,
  importStoreDataJSON,
  syncToGitHubRepo,
  checkAndUpdateFromSource,
  SyncStatus,
  STORAGE_KEYS
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
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'source_sync'>('products');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');

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
    rarity: '',
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
    facebookUrl: 'https://www.facebook.com/share/1EbKBvvmf9/?mibextid=wwXIfr',
    adminPin: '1412'
  });
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [settingsMessage, setSettingsMessage] = useState<string>('');

  // Source & Git Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | '';
    message: string;
    timestamp?: string;
  }>({ type: '', message: '' });
  const [isAutoSync, setIsAutoSync] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTO_SYNC) !== 'false';
  });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // GitHub Remote API Sync state
  const [githubToken, setGithubToken] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
      return saved ? JSON.parse(saved).token || '' : '';
    } catch {
      return '';
    }
  });
  const [githubRepo, setGithubRepo] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
      return saved ? JSON.parse(saved).repo || 'danglio/conan-order-tracker' : 'danglio/conan-order-tracker';
    } catch {
      return 'danglio/conan-order-tracker';
    }
  });
  const [githubBranch, setGithubBranch] = useState<string>('main');
  const [isGitHubSyncing, setIsGitHubSyncing] = useState<boolean>(false);
  const [githubMessage, setGithubMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: ''
  });

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputJsonRef = useRef<HTMLInputElement>(null);

  // Load data when opened
  useEffect(() => {
    if (isOpen) {
      loadAllData();
      checkSyncStatus().then(setSyncStatus);
    }
  }, [isOpen]);

  const loadAllData = () => {
    setProducts(getProducts());
    setOrders(getOrders());
    setSettings(getSettings());
    setCustomTags(getCustomTags());
  };

  const handleAddCustomTag = () => {
    const clean = newTagInput.trim();
    if (!clean) return;
    const updated = addCustomTag(clean);
    setCustomTags(updated);
    setProductForm((prev) => ({ ...prev, rarity: clean }));
    setNewTagInput('');
    onDataChanged?.();
  };

  const handleDeleteTag = (tagToDelete: string) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn mục "${tagToDelete}" khỏi danh sách nhãn và gỡ khỏi các sản phẩm không?`
      )
    ) {
      const updated = deleteCustomTag(tagToDelete);
      setCustomTags(updated);
      setProducts(getProducts());
      if (productForm.rarity?.trim().toLowerCase() === tagToDelete.trim().toLowerCase()) {
        setProductForm((prev) => ({ ...prev, rarity: '' }));
      }
      onDataChanged?.();
    }
  };

  const handleClearAllSsrTags = () => {
    if (
      confirm(
        'Bạn có chắc chắn muốn XÓA HOÀN TOÀN các mục SSR, UR, DETECTIVE, SR, R khỏi danh sách nhãn và gỡ khỏi tất cả sản phẩm không?'
      )
    ) {
      const updated = clearAllSsrRarityTags();
      setCustomTags(updated);
      setProducts(getProducts());
      const gameTags = ['SSR', 'UR', 'DETECTIVE', 'SR', 'R'];
      if (gameTags.includes(productForm.rarity?.trim().toUpperCase() || '')) {
        setProductForm((prev) => ({ ...prev, rarity: '' }));
      }
      onDataChanged?.();
    }
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
      checkSyncStatus().then(setSyncStatus);
    } else {
      setPinError('Mã số bí mật không chính xác! (Gợi ý mặc định: 1412)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
  };

  // Image upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có dung lượng nhỏ hơn 10MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setProductForm((prev) => ({ ...prev, image: compressed }));
        } else {
          setProductForm((prev) => ({ ...prev, image: dataUrl }));
        }
      };
      img.onerror = () => {
        setProductForm((prev) => ({ ...prev, image: dataUrl }));
      };
      img.src = dataUrl;
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

    const imageToSave =
      productForm.image.trim() ||
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';

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
    alert(
      editingProduct
        ? 'Cập nhật sản phẩm thành công! (Dữ liệu đã tự động đồng bộ vào mã nguồn nếu chạy local dev)'
        : 'Thêm sản phẩm mới thành công! (Dữ liệu đã tự động đồng bộ vào mã nguồn nếu chạy local dev)'
    );
  };

  // Start editing a product
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      rarity: product.rarity || '',
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
      facebookUrl: settings.facebookUrl.trim() || 'https://www.facebook.com/share/1EbKBvvmf9/?mibextid=wwXIfr',
      adminPin: finalPin,
      customTags: getCustomTags()
    };

    saveSettings(updated);
    setSettings(updated);
    setNewPin('');
    setConfirmPin('');
    setSettingsMessage('Đã lưu cấu hình thành công! (Tự động đồng bộ vào mã nguồn)');
    setTimeout(() => setSettingsMessage(''), 3500);
    onDataChanged?.();
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (confirm('Khôi phục toàn bộ dữ liệu mẫu (sản phẩm, đơn hàng, cài đặt gốc từ mã nguồn)?')) {
      resetStorage();
      loadAllData();
      onDataChanged?.();
      alert('Đã khôi phục dữ liệu ban đầu!');
    }
  };

  // Source Sync Action
  const handleSyncToSource = async () => {
    setIsSyncing(true);
    setSyncFeedback({ type: '', message: '' });
    try {
      const result = await syncToSourceCode();
      if (result.success) {
        setSyncFeedback({
          type: 'success',
          message: `${result.message} ${result.gitCommitted ? '(Đã tạo Git Commit)' : ''} ${result.gitPushed ? '(Đã Git Push)' : ''}`,
          timestamp: new Date().toLocaleTimeString('vi-VN')
        });
        checkSyncStatus().then(setSyncStatus);
      } else {
        setSyncFeedback({
          type: 'error',
          message: result.message
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Lỗi kết nối: ${err?.message || 'Không xác định'}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Reload from source code
  const handleReloadFromSource = () => {
    if (confirm('Tải lại toàn bộ dữ liệu mới nhất từ file mã nguồn (storeData.json)? Những thay đổi chưa lưu trên máy bạn sẽ bị ghi đè.')) {
      checkAndUpdateFromSource(true);
      loadAllData();
      onDataChanged?.();
      alert('Đã nạp lại dữ liệu từ file mã nguồn storeData.json thành công!');
    }
  };

  // Download JSON file
  const handleDownloadJSON = () => {
    const jsonStr = exportStoreDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storeData-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy TypeScript code
  const handleCopyTS = () => {
    const tsCode = exportStoreDataTypeScript();
    navigator.clipboard.writeText(tsCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  // Import JSON file handler
  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (typeof content !== 'string') return;
      const res = importStoreDataJSON(content);
      if (res.success) {
        loadAllData();
        onDataChanged?.();
        alert(res.message);
      } else {
        alert(res.message);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Toggle Auto-sync
  const handleToggleAutoSync = (enabled: boolean) => {
    setIsAutoSync(enabled);
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, enabled ? 'true' : 'false');
  };

  // Remote GitHub API sync
  const handleGitHubSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) {
      alert('Vui lòng nhập GitHub Personal Access Token.');
      return;
    }
    if (!githubRepo.trim()) {
      alert('Vui lòng nhập tên GitHub Repository (dạng username/repo).');
      return;
    }

    setIsGitHubSyncing(true);
    setGithubMessage({ type: '', text: '' });

    try {
      // Save config for convenience
      localStorage.setItem(
        STORAGE_KEYS.GITHUB_CONFIG,
        JSON.stringify({ token: githubToken.trim(), repo: githubRepo.trim() })
      );

      const res = await syncToGitHubRepo({
        token: githubToken.trim(),
        repo: githubRepo.trim(),
        branch: githubBranch.trim() || 'main'
      });

      if (res.success) {
        setGithubMessage({ type: 'success', text: res.message });
      } else {
        setGithubMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setGithubMessage({ type: 'error', text: err?.message || 'Lỗi không xác định khi kết nối GitHub API' });
    } finally {
      setIsGitHubSyncing(false);
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
                {syncStatus?.isLocalDev && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Mã Nguồn Đã Kết Nối
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                BreeCorner x Conan Shop • Hệ thống quản lý vật phẩm & đồng bộ mã nguồn mở
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
              Vui lòng nhập mã số bí mật để truy cập bảng điều khiển quản lý shop, đơn hàng và đồng bộ mã nguồn.
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-conan-gold text-conan-gold bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Phone className="w-4 h-4" />
                Cài Đặt Facebook & Zalo
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('source_sync')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'source_sync'
                    ? 'border-breezy-blue text-breezy-blue bg-slate-900/90 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-4 h-4 text-breezy-blue" />
                <span>Mã Nguồn Mở & Git</span>
                {syncStatus?.isLocalDev && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
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
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        Danh mục Thẻ bài & Vật phẩm
                        {syncStatus?.isLocalDev && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-normal">
                            ✓ Tự động ghi vào mã nguồn
                          </span>
                        )}
                      </h3>
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
                          rarity: '',
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
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-slate-300">
                                Độ hiếm / Nhãn phân loại (Tùy chọn)
                              </label>
                              {productForm.rarity && (
                                <button
                                  type="button"
                                  onClick={() => setProductForm({ ...productForm, rarity: '' })}
                                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Xóa nhãn sản phẩm này (để trống)
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={productForm.rarity || ''}
                                onChange={(e) => setProductForm({ ...productForm, rarity: e.target.value })}
                                placeholder="Để trống nếu không muốn dùng nhãn, hoặc tự gõ nhãn tùy ý..."
                                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-conan-gold focus:outline-none"
                              />
                              {productForm.rarity && (
                                <button
                                  type="button"
                                  onClick={() => setProductForm({ ...productForm, rarity: '' })}
                                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-white/10 text-xs cursor-pointer"
                                  title="Xóa trắng nhãn này"
                                >
                                  Xóa nhãn
                                </button>
                              )}
                            </div>

                            {/* Tag Management & Selection */}
                            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="text-[11px] font-semibold text-slate-300">
                                  Danh sách nhãn mẫu (Bấm để chọn, bấm × để xóa luôn khỏi hệ thống):
                                </span>
                                <button
                                  type="button"
                                  onClick={handleClearAllSsrTags}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                                  title="Xóa vĩnh viễn SSR, UR, DETECTIVE, SR, R khỏi danh sách nhãn và toàn bộ sản phẩm"
                                >
                                  🗑️ Xóa hết các mục SSR/UR/SR
                                </button>
                              </div>

                              {/* Chips with delete button */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {customTags.length === 0 ? (
                                  <span className="text-[11px] text-slate-500 italic">
                                    Đã xóa hết nhãn mẫu (Sản phẩm không bắt buộc phải có nhãn).
                                  </span>
                                ) : (
                                  customTags.map((tag) => {
                                    const isSelected =
                                      productForm.rarity?.trim().toLowerCase() === tag.trim().toLowerCase();
                                    return (
                                      <div
                                        key={tag}
                                        className={`inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                                          isSelected
                                            ? 'bg-conan-gold text-slate-950 font-bold border-conan-gold shadow-sm'
                                            : 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20'
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => setProductForm({ ...productForm, rarity: tag })}
                                          className="cursor-pointer"
                                        >
                                          {tag}
                                        </button>
                                        <button
                                          type="button"
                                          title={`Xóa vĩnh viễn mục "${tag}"`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTag(tag);
                                          }}
                                          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20 ml-0.5 cursor-pointer transition-colors"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Add new tag inline */}
                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <input
                                  type="text"
                                  value={newTagInput}
                                  onChange={(e) => setNewTagInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddCustomTag();
                                    }
                                  }}
                                  placeholder="Thêm nhãn mới (VD: Limited, Sưu tầm, Manga...)"
                                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-conan-gold"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddCustomTag}
                                  className="px-3 py-1.5 rounded-lg bg-conan-gold/20 text-conan-gold hover:bg-conan-gold hover:text-slate-950 font-bold text-xs border border-conan-gold/40 transition-all cursor-pointer whitespace-nowrap"
                                >
                                  + Thêm nhãn
                                </button>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-400 mt-1">
                              💡 Bạn có thể để trống nếu không muốn hiển thị nhãn, tự do gõ nhãn mới, hoặc bấm dấu × để xóa vĩnh viễn các mục như SSR/UR.
                            </p>
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
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
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
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium max-w-[200px] truncate" title={p.name}>
                                {p.name}
                              </td>
                              <td className="py-3 px-4">
                                {badge ? (
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.badgeClass}`}
                                  >
                                    {badge.label}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 italic">Không nhãn</span>
                                )}
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
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    p.inStock
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}
                                >
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
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusInfo.badgeBg}`}
                                >
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

              {/* TAB 3: SETTINGS & SOCIAL CONFIG */}
              {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Cấu hình Facebook, Zalo & Mã PIN</h3>
                    <p className="text-xs text-slate-400">
                      Thay đổi đường dẫn Facebook người bán, số điện thoại Zalo tiếp nhận đơn và mã số quản trị bí mật
                    </p>
                  </div>

                  {settingsMessage && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {settingsMessage}
                    </div>
                  )}

                  <form
                    onSubmit={handleSaveSettings}
                    className="space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-white/10"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-bree-baby" />
                        Đường dẫn Facebook Người Bán (Tiếp nhận đơn hàng trực tiếp) *
                      </label>
                      <input
                        type="url"
                        required
                        value={settings.facebookUrl}
                        onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                        placeholder="https://www.facebook.com/share/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-conan-gold focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Mặc định: link Facebook cá nhân người bán được khách gửi qua tin nhắn.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-conan-gold" />
                        Số điện thoại Zalo người bán (Hỗ trợ phụ) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.zaloPhone}
                        onChange={(e) => setSettings({ ...settings, zaloPhone: e.target.value })}
                        placeholder="Ví dụ: 0901234567..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-conan-gold focus:outline-none"
                      />
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

              {/* TAB 4: SOURCE CODE & GIT REPOSITORY SYNC */}
              {activeTab === 'source_sync' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Top explanation */}
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-breezy-blue" />
                      TRUNG TÂM ĐỒNG BỘ MÃ NGUỒN MỞ & GIT
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Khắc phục triệt để tình trạng: <em>"Chỉnh sửa trên admin chỉ lưu tạm vào trình duyệt và không đẩy lên mã nguồn"</em>. Tính năng này cho phép ghi dữ liệu thẳng vào file mã nguồn mở <span className="font-mono text-conan-gold">src/data/storeData.json</span> và tạo Git commit tự động!
                    </p>
                  </div>

                  {/* SECTION 1: Local Dev Server Status & One-Click Sync */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            syncStatus?.isLocalDev ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {syncStatus?.isLocalDev
                              ? '🟢 Máy chủ Local Dev đang kết nối trực tiếp với Mã nguồn'
                              : '🟡 Đang chạy trên Hosting Tĩnh (Vercel / Cloud)'}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Tệp đích: src/data/storeData.json {syncStatus?.gitBranch ? `• Nhánh Git: [${syncStatus.gitBranch}]` : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => checkSyncStatus().then(setSyncStatus)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                        title="Kiểm tra lại kết nối"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    {syncStatus?.lastCommit && (
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center gap-2 text-xs text-slate-300">
                        <GitCommit className="w-4 h-4 text-conan-gold shrink-0" />
                        <span className="text-slate-400">Commit gần nhất:</span>
                        <span className="font-mono text-[11px] text-white truncate">{syncStatus.lastCommit}</span>
                      </div>
                    )}

                    {/* Feedback message */}
                    {syncFeedback.message && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                          syncFeedback.type === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-500/15 border-red-500/40 text-red-300'
                        }`}
                      >
                        {syncFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{syncFeedback.message}</p>
                          {syncFeedback.timestamp && (
                            <p className="text-[10px] opacity-75 mt-0.5">Lúc: {syncFeedback.timestamp}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Main action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={handleSyncToSource}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-breezy-blue to-blue-600 hover:from-blue-600 hover:to-breezy-blue text-slate-950 font-bold text-sm shadow-lg shadow-breezy-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>
                          {isSyncing ? 'Đang ghi vào mã nguồn...' : '⚡ GHI ĐÈ VÀO MÃ NGUỒN & GIT COMMIT NGAY'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReloadFromSource}
                        className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                        title="Nạp lại dữ liệu từ file mã nguồn ban đầu"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Nạp lại từ Code nguồn</span>
                      </button>
                    </div>

                    {/* Auto-sync switch */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <input
                        type="checkbox"
                        id="autoSyncCheck"
                        checked={isAutoSync}
                        onChange={(e) => handleToggleAutoSync(e.target.checked)}
                        className="rounded accent-breezy-blue w-4 h-4"
                      />
                      <label htmlFor="autoSyncCheck" className="text-xs text-slate-300 cursor-pointer">
                        <span className="font-medium">Tự động đồng bộ ngầm vào mã nguồn:</span> Mỗi khi thêm/sửa sản phẩm, đổi giá, đổi tag, hệ thống sẽ tự động cập nhật ngay file <code className="text-conan-gold">storeData.json</code>.
                      </label>
                    </div>
                  </div>

                  {/* SECTION 2: Export & Import Source Data */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-conan-gold" />
                        BỘ CÔNG CỤ XUẤT & NHẬP DỮ LIỆU NGUỒN (EXPORT / IMPORT)
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Dùng khi bạn muốn sao chép mã nguồn sang máy tính khác, hoặc sao lưu tệp dữ liệu JSON của cửa hàng.
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputJsonRef}
                      accept=".json"
                      onChange={handleImportJSONFile}
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadJSON}
                        className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-white/10 text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all hover:border-conan-gold/50"
                      >
                        <Download className="w-5 h-5 text-conan-gold" />
                        <span>Tải file storeData.json</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyTS}
                        className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-white/10 text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all hover:border-breezy-blue/50"
                      >
                        {copiedCode ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-breezy-blue" />
                        )}
                        <span>{copiedCode ? 'Đã sao chép Code!' : 'Sao chép Code TypeScript'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputJsonRef.current?.click()}
                        className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-white/10 text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all hover:border-cream-sun/50"
                      >
                        <Upload className="w-5 h-5 text-cream-sun" />
                        <span>Nhập file JSON từ máy</span>
                      </button>
                    </div>
                  </div>

                  {/* SECTION 3: Remote GitHub API Sync */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        ĐỒNG BỘ TRỰC TIẾP LÊN GITHUB TỪ XA (CHO BẢN WEB VERCEL / ONLINE)
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Khi trang web chạy online trên Vercel, bạn có thể nhập GitHub Personal Access Token để web tự động đẩy commit trực tiếp lên kho mã nguồn GitHub mà không cần chạm vào terminal!
                      </p>
                    </div>

                    {githubMessage.text && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          githubMessage.type === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-500/15 border-red-500/40 text-red-300'
                        }`}
                      >
                        {githubMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        )}
                        <span>{githubMessage.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleGitHubSync} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            GitHub Repository (Tên repo) *
                          </label>
                          <input
                            type="text"
                            required
                            value={githubRepo}
                            onChange={(e) => setGithubRepo(e.target.value)}
                            placeholder="Ví dụ: danglio/conan-order-tracker"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-conan-gold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            Nhánh GitHub (Branch)
                          </label>
                          <input
                            type="text"
                            value={githubBranch}
                            onChange={(e) => setGithubBranch(e.target.value)}
                            placeholder="main"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-conan-gold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-slate-300">
                            GitHub Personal Access Token (PAT) *
                          </label>
                          <a
                            href="https://github.com/settings/tokens/new?scopes=repo&description=Conan+Web+Sync"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-breezy-blue hover:underline flex items-center gap-1"
                          >
                            <span>Tạo Token GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <input
                          type="password"
                          required
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-conan-gold focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isGitHubSyncing}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {isGitHubSyncing ? 'Đang đẩy lên GitHub Repository...' : '🚀 ĐẨY COMMIT TRỰC TIẾP LÊN GITHUB REPOSITORY'}
                        </span>
                      </button>
                    </form>
                  </div>
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
