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
    <div className="min-h-screen bg-conan-navy text-slate-100 flex flex-col relative selection:bg-conan-red selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-conan-blue/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-conan-red/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[300px] h-[300px] bg-conan-gold/10 rounded-full blur-[90px] pointer-events-none -z-10" />

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
              key={`tracking-${dataVersion}-${selectedOrderCode}`}
              initialOrderCode={selectedOrderCode}
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
              <span className="w-6 h-6 rounded-lg bg-conan-red flex items-center justify-center text-[10px] font-mono shadow-md">
                #1412
              </span>
              <span>MOURI DETECTIVE AGENCY</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Văn phòng Thám tử Mori Kogoro & Cửa hàng thẻ bài, đạo cụ thám tử Conan Edogawa chính hãng.
            </p>
            <p className="text-[11px] text-conan-gold font-mono italic">
              "Chỉ có một sự thật duy nhất!" (真実はいつもひとつ!)
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Liên Hệ & Hỗ Trợ
            </h4>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-conan-gold" />
              <span>Zalo Đặt Hàng: </span>
              <a
                href={`https://zalo.me/${settings.zaloPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-conan-gold hover:underline"
              >
                {settings.zaloPhone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Địa chỉ: Tầng 2, Số 5 Phố Beika, Tokyo</span>
            </p>
            <p className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-conan-red" />
              <span>Cam kết: Thẻ bài SSR & Đạo cụ chất lượng cao</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-conan-navy hover:bg-slate-800 text-conan-gold border border-conan-gold/30 text-xs font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Đăng nhập Quản trị viên
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-slate-500 text-[11px]">
          <p>© 2026 Văn Phòng Thám Tử Mori x Detective Conan Shop. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Thiết kế lấy cảm hứng từ Thám Tử Lừng Danh Conan & Tra cứu đơn enne.vn
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
