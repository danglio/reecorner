import React from 'react';
import {
  ShoppingBag,
  Search,
  VolumeX,
  Lock,
  FileSearch,
} from 'lucide-react';
import { ConanBowtieIcon } from './AudioPlayer';

export interface HeaderProps {
  activeTab: 'shop' | 'tracking';
  setActiveTab: (tab: 'shop' | 'tracking') => void;
  cartCount: number;
  onOpenCart: () => void;
  isPlaying?: boolean;
  onToggleAudio?: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  isPlaying = false,
  onToggleAudio,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-conan-navy/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Brand Logo */}
        <button
          type="button"
          onClick={() => setActiveTab('shop')}
          className="group flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-conan-gold rounded-xl p-1 -ml-1 transition-transform active:scale-95"
          title="Về trang chủ Cửa hàng Conan"
        >
          {/* Logo Badge Icon */}
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-conan-blue-dark via-conan-navy to-conan-navy-deep border border-conan-gold/40 shadow-md group-hover:border-conan-gold group-hover:glow-gold transition-all duration-300">
            <ConanBowtieIcon className="w-5 h-5 sm:w-6 sm:h-6" isAnimated={isPlaying} />
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-conan-gold text-conan-navy shadow-sm">
              <Search className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          {/* Logo Typography */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5 font-outfit text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-conan-gold transition-colors">
              <span>MOURI AGENCY</span>
              <span className="text-conan-red font-black">×</span>
              <span className="text-conan-gold">CONAN SHOP</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-medium">
              <span className="hidden xs:inline">Văn Phòng Thám Tử</span>
              <span className="hidden xs:inline text-conan-gold/60">•</span>
              <span>Hồ Sơ & Thẻ Bài</span>
            </div>
          </div>
        </button>

        {/* 2. Navigation Tabs */}
        <nav
          aria-label="Điều hướng chính"
          className="flex items-center p-1 sm:p-1.5 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-full shadow-inner"
        >
          {/* Tab Cửa Hàng */}
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
              activeTab === 'shop'
                ? 'bg-conan-red text-white shadow-md glow-red'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Cửa Hàng</span>
          </button>

          {/* Tab Tra Cứu Đơn */}
          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
              activeTab === 'tracking'
                ? 'bg-conan-gold text-conan-navy-dark shadow-md glow-gold font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Tra Cứu Đơn</span>
          </button>
        </nav>

        {/* 3. Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* BGM Audio Toggle Button */}
          {onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 border transition-all duration-200 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-conan-gold ${
                isPlaying
                  ? 'bg-conan-gold/15 text-conan-gold border-conan-gold/40 glow-gold shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-white/10'
              }`}
              title={isPlaying ? 'Tạm dừng nhạc nền BGM' : 'Bật nhạc nền Conan BGM'}
              aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền'}
            >
              {isPlaying ? (
                <>
                  <div className="flex items-end space-x-0.5 h-3.5 px-0.5" aria-hidden="true">
                    <div className="w-0.5 bg-conan-gold rounded-full animate-equalizer-1" />
                    <div className="w-0.5 bg-conan-red rounded-full animate-equalizer-2" />
                    <div className="w-0.5 bg-conan-gold rounded-full animate-equalizer-3" />
                    <div className="w-0.5 bg-conan-red rounded-full animate-equalizer-4" />
                  </div>
                  <span className="hidden md:inline font-semibold">BGM</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 opacity-70" />
                  <span className="hidden md:inline text-slate-400">BGM Tắt</span>
                </>
              )}
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/70 hover:bg-conan-blue-light/30 text-slate-100 border border-white/10 hover:border-conan-gold/40 transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-conan-gold active:scale-95"
            title={`Giỏ hàng (${cartCount} vật phẩm)`}
            aria-label={`Giỏ hàng, hiện có ${cartCount} sản phẩm`}
          >
            <ShoppingBag className="w-4 h-4 text-conan-gold" />
            <span className="hidden md:inline text-xs font-semibold text-slate-200">
              Giỏ Hàng
            </span>

            {/* Cart Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-conan-red text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-conan-navy shadow-md animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Secret Admin Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 hover:bg-conan-gold/15 text-slate-400 hover:text-conan-gold border border-white/5 hover:border-conan-gold/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-conan-gold active:scale-95 group"
            title="Khu vực mật vụ Mori (Admin PIN: 1412)"
            aria-label="Đăng nhập quản trị viên"
          >
            <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
