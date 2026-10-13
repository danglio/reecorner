import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Zap,
  Star,
  Sparkles,
  ShieldCheck,
  Check,
  Tag,
  Package,
  Layers,
} from 'lucide-react';
import type { Product, ProductRarity } from '../types';
import { getProducts, getRarityBadgeInfo, formatVND } from '../services/storage';

export interface ShopCatalogProps {
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  products?: Product[];
}

type RarityFilter = 'ALL' | ProductRarity;

const RARITY_TABS: { id: RarityFilter; label: string; countBadge?: string }[] = [
  { id: 'ALL', label: 'Tất cả bảo bối' },
  { id: 'SSR', label: 'SSR Cực Hiếm' },
  { id: 'UR', label: 'UR Huyền Thoại' },
  { id: 'DETECTIVE', label: 'Bảo Bối Agasa' },
  { id: 'SR', label: 'SR Hiếm' },
];

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  onAddToCart,
  onBuyNow,
  products: initialProducts,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<RarityFilter>('ALL');
  const [addedId, setAddedId] = useState<string | null>(null);

  // Load products from storage if not provided via props
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    } else {
      setProducts(getProducts());
    }
  }, [initialProducts]);

  // Filter products by rarity and search query
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchRarity =
        selectedRarity === 'ALL' ? true : prod.rarity === selectedRarity;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        prod.rarity.toLowerCase().includes(q);
      return matchRarity && matchSearch;
    });
  }, [products, selectedRarity, searchQuery]);

  const handleAddToCart = (product: Product) => {
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1500);
  };

  const handleBuyNow = (product: Product) => {
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* 1. BreeCorner 5-Color Showcase Banner (Chuẩn 100% Theo Ảnh Thiết Kế) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-breezy-blue/40 bg-gradient-to-br from-[#051F45]/95 via-[#0A2754]/90 to-[#123B72]/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Glow ambient spots */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-breezy-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cream-sun/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-matcha-tea/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Title from Design */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 text-white font-outfit font-extrabold text-xl sm:text-2xl">
                <span className="text-breezy-blue">BreeCorner</span>
                <span className="text-white/40">-</span>
                <span>GÓC THẺ BÀI & BÁU VẬT</span>
              </div>
              <p className="text-xs sm:text-sm text-cream-sun font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-breezy-blue" />
                BẢNG MÀU CHÍNH CHỌN LỌC (TƯƠI SÁNG, DỊU MẮT)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-navy-night/90 text-white border border-breezy-blue/40 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Chuẩn 5 Mã Màu Thiết Kế</span>
              </span>
            </div>
          </div>

          {/* 5 Core Color Circles Strip - 100% Theo Ảnh Khách Gửi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Color 1: Breezy Blue */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-breezy-blue/40 hover:border-breezy-blue transition-all shadow-md group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#BED9F4] shadow-md border-2 border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white truncate">Breezy Blue</h4>
                  <p className="text-[11px] font-mono text-breezy-blue font-bold">#BED9F4</p>
                  <p className="text-[10px] text-slate-300 leading-tight truncate">Màu nền chính - Tươi mới, êm đềm</p>
                </div>
              </div>
            </div>

            {/* Color 2: Vàng Cream Nắng */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-cream-sun/40 hover:border-cream-sun transition-all shadow-md group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF4C8] shadow-md border-2 border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white truncate">Vàng Cream Nắng</h4>
                  <p className="text-[11px] font-mono text-cream-sun font-bold">#FFF4C8</p>
                  <p className="text-[10px] text-slate-300 leading-tight truncate">Màu điểm nhấn phụ, làm ấm không gian</p>
                </div>
              </div>
            </div>

            {/* Color 3: Matcha Tea */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-matcha-tea/50 hover:border-matcha-tea transition-all shadow-md group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#838F58] shadow-md border-2 border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white truncate">Matcha Tea</h4>
                  <p className="text-[11px] font-mono text-[#A4B56C] font-bold">#838F58</p>
                  <p className="text-[10px] text-slate-300 leading-tight truncate">Màu chữ, icon, điểm nhấn trẻ trung</p>
                </div>
              </div>
            </div>

            {/* Color 4: Mây Trắng */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/30 hover:border-white transition-all shadow-md group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] shadow-md border-2 border-slate-300 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white truncate">Mây Trắng</h4>
                  <p className="text-[11px] font-mono text-slate-200 font-bold">#FFFFFF</p>
                  <p className="text-[10px] text-slate-300 leading-tight truncate">Màu nền văn/sạch - bản/icon</p>
                </div>
              </div>
            </div>

            {/* Color 5: Navy Đêm */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-blue-400/40 hover:border-blue-400 transition-all shadow-md group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#051F45] shadow-md border-2 border-breezy-blue/40 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white truncate">Navy Đêm</h4>
                  <p className="text-[11px] font-mono text-blue-300 font-bold">#051F45</p>
                  <p className="text-[10px] text-slate-300 leading-tight truncate">Chỉ chìm labels trong màn Giảm Độ Chói</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Controls: Filter Tabs & Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Rarity Tabs - Bảng màu dịu mắt */}
          <div className="flex items-center overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-none">
            {RARITY_TABS.map((tab) => {
              const active = selectedRarity === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRarity(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                    active
                      ? 'bg-breezy-blue text-navy-night border-breezy-blue shadow-lg shadow-breezy-blue/20 font-bold glow-breezy'
                      : 'bg-conan-navy-light/40 text-slate-300 border-white/10 hover:border-breezy-blue/40 hover:text-white hover:bg-conan-navy-light/70'
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 ${active ? 'text-navy-night' : 'text-breezy-blue/70'}`} />
                  <span>{tab.label}</span>
                  {tab.id !== 'ALL' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active
                          ? 'bg-navy-night text-cream-sun font-bold'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {products.filter((p) => p.rarity === tab.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-breezy-blue/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thẻ bài, báu vật sưu tầm BreeCorner..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-conan-navy-light/50 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-breezy-blue focus:ring-1 focus:ring-breezy-blue transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Status Count Line */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Tìm thấy{' '}
            <strong className="text-white font-semibold">{filteredProducts.length}</strong>{' '}
            vật phẩm
            {selectedRarity !== 'ALL' && (
              <span>
                {' '}
                thuộc nhóm <strong className="text-conan-gold">{selectedRarity}</strong>
              </span>
            )}
            {searchQuery && (
              <span>
                {' '}
                khớp từ khóa "<strong className="text-conan-gold">{searchQuery}</strong>"
              </span>
            )}
          </span>
        </div>
      </section>

      {/* 3. Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-white/10 bg-conan-navy/40">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-conan-gold/10 text-conan-gold mb-3 border border-conan-gold/20">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Không tìm thấy vật phẩm</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Không có bảo bối hay thẻ bài nào phù hợp với bộ lọc hiện tại. Hãy thử tìm bằng từ khóa khác!
          </p>
          <button
            onClick={() => {
              setSelectedRarity('ALL');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-conan-gold border border-conan-gold/30 rounded-lg hover:bg-conan-gold/10 transition-colors"
          >
            Xem lại tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const rarityInfo = getRarityBadgeInfo(product.rarity);
            const isAdded = addedId === product.id;
            const discountPercent =
              product.originalPrice && product.originalPrice > product.price
                ? Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )
                : 0;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col rounded-2xl border border-breezy-blue/30 bg-gradient-to-b from-[#051F45] via-[#082755] to-[#0E356A] hover:border-breezy-blue transition-all duration-300 hover:shadow-2xl hover:shadow-breezy-blue/20 hover:-translate-y-1 overflow-hidden"
              >
                {/* Breezy Blue & Cream Sun Accent Border */}
                <div className="h-1 w-full bg-gradient-to-r from-breezy-blue via-cream-sun to-breezy-blue" />

                {/* Card Image Wrapper */}
                <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback image in case of broken link
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src =
                        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051F45] via-transparent to-transparent opacity-70" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md ${rarityInfo.badgeClass}`}
                    >
                      {rarityInfo.label}
                    </span>

                    {discountPercent > 0 && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-conan-red text-white text-[10px] font-extrabold shadow-md">
                        <Tag className="w-2.5 h-2.5" />
                        <span>-{discountPercent}%</span>
                      </span>
                    )}
                  </div>

                  {/* Rating Badge */}
                  {product.rating && (
                    <div className="absolute bottom-2.5 left-3 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-cream-sun text-[11px] font-semibold">
                      <Star className="w-3 h-3 fill-cream-sun text-cream-sun" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="absolute bottom-2.5 right-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-sm border ${
                        product.inStock
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-950/70 text-red-300 border-red-500/30'
                      }`}
                    >
                      {product.inStock ? 'Còn hàng' : 'Tạm hết'}
                    </span>
                  </div>
                </div>

                {/* Card Content - Faithful to right mockup in photo */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1.5">
                    {/* 1. Title in pure white */}
                    <h3 className="font-outfit font-extrabold text-white text-base sm:text-lg group-hover:text-breezy-blue transition-colors line-clamp-1 leading-snug">
                      TIÊU ĐỀ SẢN PHẨM: "{product.name}"
                    </h3>
                    {/* 2. Subtitle: Vàng Cream Nắng - Breezy Blue */}
                    <p className="text-xs font-semibold text-breezy-blue flex items-center gap-1.5">
                      <span className="text-cream-sun font-bold">Vàng Cream Nắng</span>
                      <span className="text-white/40">-</span>
                      <span className="text-breezy-blue font-bold">Breezy Blue</span>
                    </p>
                    <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed pt-0.5">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {/* 3. Action Button: ĐẶT ĐƠN (Pill Outline Border Breezy Blue chuẩn mockup) */}
                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={!product.inStock}
                      className="w-full py-2.5 px-4 rounded-full border-2 border-breezy-blue bg-navy-night/70 hover:bg-breezy-blue text-breezy-blue hover:text-navy-night font-black text-sm tracking-widest uppercase transition-all duration-200 shadow-md shadow-breezy-blue/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>ĐẶT ĐƠN</span>
                    </button>

                    {/* Secondary Add to Cart button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:border-cream-sun hover:text-cream-sun'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ShoppingCart className="w-3.5 h-3.5 text-cream-sun" />
                      )}
                      <span>{isAdded ? 'Đã thêm giỏ hàng' : 'Thêm giỏ hàng'}</span>
                    </button>

                    {/* 4. Price Row with Vàng Cream Nắng Pill Tag */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-lg sm:text-xl font-black text-white font-outfit tracking-tight">
                          {formatVND(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatVND(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFF4C8] text-[#051F45] shadow-sm">
                        Vàng Cream Nắng
                      </span>
                    </div>

                    {/* 5. Category Pill with Matcha Tea */}
                    <div className="w-full py-1.5 px-3 rounded-full bg-[#838F58] text-white text-xs font-bold text-center shadow-sm flex items-center justify-center gap-1.5">
                      <span>Bảo Bối Agasa - Matcha Tea</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopCatalog;
