import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WelcomeModal from './components/WelcomeModal';
import ShopCatalog from './components/ShopCatalog';
import OrderStatusView from './components/OrderStatusView';
import CartDrawer, { CartItem } from './components/CartDrawer';
import AudioPlayer, { triggerPlayConanBGM } from './components/AudioPlayer';
import AdminPanel from './components/AdminPanel';
import { Product, Order } from './types';
import { getSettings } from './services/storage';
import { Phone, Shield, Sparkles, Heart } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'shop' | 'tracking'>('shop');

  // Welcome modal state (auto opens on first visit)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('conan_welcome_dismissed');
    return !dismissed;
  });

  // Admin panel modal state
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Cart drawer state
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('conan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tracking query state (when customer navigates from order success)
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>('');

  // Audio playing sync state
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Data reload trigger key
  const [dataVersion, setDataVersion] = useState<number>(0);

  // Sync cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('conan_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('Cannot persist cart:', err);
    }
  }, [cart]);

  // Cart actions
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // When order is successfully created in CartDrawer
  const handleOrderSuccess = (order: Order) => {
    setSelectedOrderCode(order.id);
    setIsCartOpen(false);
    setActiveTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Welcome modal close / skip
  const handleCloseWelcome = () => {
    sessionStorage.setItem('conan_welcome_dismissed', 'true');
    setIsWelcomeOpen(false);
  };

  const handleSkipWelcome = () => {
    sessionStorage.setItem('conan_welcome_dismissed', 'true');
    setIsWelcomeOpen(false);
    // Trigger audio playback seamlessly
    triggerPlayConanBGM();
    setIsAudioPlaying(true);
  };

  // Reload data from admin changes
  const handleDataChanged = () => {
    setDataVersion(v => v + 1);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const settings = getSettings();

  return (
    <div className="min-h-screen bg-navy-night text-slate-100 flex flex-col relative selection:bg-breezy-blue selection:text-navy-night">
      {/* Background ambient lighting effects BreeCorner */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-breezy-blue/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-matcha-tea/15 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[350px] h-[350px] bg-cream-sun/15 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        isPlaying={isAudioPlaying}
        onToggleAudio={() => setIsAudioPlaying(p => !p)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'shop' ? (
          <ShopCatalog
            key={`shop-${dataVersion}`}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        ) : (
          <div className="pt-6 sm:pt-8">
            <OrderStatusView
              key={`tracking-${dataVersion}-${selectedOrderCode || 'CONAN-001'}`}
              initialOrderCode={selectedOrderCode || 'CONAN-001'}
              onSelectOrder={(code) => setSelectedOrderCode(code)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-10 px-4 text-xs text-slate-400 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-conan-red flex items-center justify-center text-[10px] font-mono shadow-md text-white font-black">
                X
              </span>
              <span>BREECORNER X CONAN SHOP</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Tiệm thẻ bài & vật phẩm sưu tầm độc quyền tại BreeCorner kết hợp Detective Conan Shop.
            </p>
            <p className="text-[11px] text-cream-sun font-mono italic">
              "Góc thẻ bài & báu vật • Trải nghiệm sưu tầm trọn vẹn"
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Liên Hệ & Đặt Hàng
            </h4>
            <p className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-breezy-blue" />
              <span>Facebook Người Bán: </span>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-breezy-blue hover:underline truncate max-w-[200px]"
                title="Mở Facebook người bán"
              >
                BreeCorner (Nhắn tin ngay)
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-cream-sun" />
              <span>Zalo hỗ trợ: </span>
              <a
                href={`https://zalo.me/${settings.zaloPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-cream-sun hover:underline"
              >
                {settings.zaloPhone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cam kết: 100% Chính hãng & Uy tín toàn quốc</span>
            </p>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Bảo Mật & Quản Trị
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Chủ shop có thể bấm vào biểu tượng chiếc khóa bảo mật ở góc trên bên phải để vào bảng quản lý thay đổi giá và đẩy thêm ảnh sản phẩm.
            </p>
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-conan-navy hover:bg-slate-800 text-cream-sun border border-breezy-blue/30 text-xs font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-breezy-blue" />
              Đăng nhập Quản trị viên (#1412)
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-slate-500 text-[11px]">
          <p>© 2026 BREECORNER X CONAN SHOP. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Bảng màu chuẩn Breezy Blue × Vàng Cream Nắng trên nền Navy Đêm dịu mắt
            <Heart className="w-3 h-3 text-conan-red inline" />
          </p>
        </div>
      </footer>

      {/* Floating Conan BGM Audio Player */}
      <AudioPlayer
        isPlaying={isAudioPlaying}
        onToggle={(playing) => setIsAudioPlaying(playing)}
      />

      {/* Welcome Modal on arrival */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={handleCloseWelcome}
        onSkip={handleSkipWelcome}
      />

      {/* Cart Drawer Slide-over */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Secret Admin Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={handleDataChanged}
      />
    </div>
  );
};

export default App;
