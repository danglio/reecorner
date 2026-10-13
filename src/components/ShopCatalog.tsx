import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Zap,
  Star,
  Sparkles,
  ShieldCheck,
  Check,
  Flame,
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
      {/* 1. BreeCorner Shop Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-bree-baby/30 bg-gradient-to-r from-conan-navy-dark via-conan-navy to-conan-blue/40 p-6 sm:p-8 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-bree-baby/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-conan-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-bree-baby/15 border border-bree-baby/30 text-bree-moon text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-bree-baby animate-spin-slow" />
              <span>✨ KHO BÁU BẢO BỐI & THẺ BÀI SƯU TẦM BREECORNER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-outfit tracking-tight leading-tight">
              Cửa Hàng Thẻ Bài Conan & Kho Báu{' '}
              <span className="text-bree-moon">BreeCorner</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Sở hữu các thẻ bài các fandom cùng những vật phẩm sưu tầm độc quyền tại BreeCorner. Giao hàng toàn quốc bảo mật, xác nhận nhanh qua Facebook!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center space-x-1.5 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-white/5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-white">✅ 100% Chính hãng & Uy tín</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-white/5">
                <Flame className="w-4 h-4 text-conan-red" />
                <span className="font-medium text-white">🔥 Thẻ Bài & Bảo Bối Sưu Tầm</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-white/5">
                <Zap className="w-4 h-4 text-bree-baby" />
                <span className="font-medium text-white">⚡ Xác Nhận & Giao Hàng Siêu Tốc</span>
              </span>
            </div>
          </div>

          {/* Quick Counter Card */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
            <div className="p-3 text-center rounded-lg bg-conan-navy-light/40 border border-white/5">
              <span className="text-2xl font-black text-bree-moon font-outfit">
                {products.length}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Vật Phẩm Sẵn Có</p>
            </div>
            <div className="p-3 text-center rounded-lg bg-conan-navy-light/40 border border-white/5">
              <span className="text-2xl font-black text-bree-baby font-outfit">
                100%
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Kho BreeCorner</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Controls: Filter Tabs & Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Rarity Tabs */}
          <div className="flex items-center overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-none">
            {RARITY_TABS.map((tab) => {
              const active = selectedRarity === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRarity(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer border ${
                    active
                      ? 'bg-conan-gold text-slate-950 border-conan-gold shadow-lg shadow-conan-gold/20 font-bold'
                      : 'bg-conan-navy-light/50 text-slate-300 border-white/10 hover:border-conan-gold/40 hover:text-white hover:bg-conan-navy-light/80'
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.id !== 'ALL' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active
                          ? 'bg-slate-950 text-conan-gold font-bold'
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thẻ bài, bảo bối Agasa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-conan-navy-light/60 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-conan-gold focus:ring-1 focus:ring-conan-gold transition-all"
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
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-conan-navy/80 hover:border-conan-gold/50 transition-all duration-300 hover:shadow-xl hover:shadow-conan-gold/10 hover:-translate-y-1 overflow-hidden"
              >
                {/* Rarity Glow Border Top Accent */}
                <div
                  className={`h-1 w-full ${
                    product.rarity === 'SSR'
                      ? 'bg-gradient-to-r from-red-500 via-amber-400 to-red-500'
                      : product.rarity === 'UR'
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500'
                      : product.rarity === 'DETECTIVE'
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  }`}
                />

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
                  <div className="absolute inset-0 bg-gradient-to-t from-conan-navy via-transparent to-transparent opacity-60" />

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
                    <div className="absolute bottom-2.5 left-3 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-conan-gold text-[11px] font-semibold">
                      <Star className="w-3 h-3 fill-conan-gold text-conan-gold" />
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

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-outfit font-bold text-white text-base group-hover:text-conan-gold transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/5">
                    {/* Price Block */}
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg sm:text-xl font-black text-conan-gold font-outfit tracking-tight">
                        {formatVND(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-slate-500 line-through">
                          {formatVND(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                          isAdded
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-conan-navy-light text-slate-200 border-white/10 hover:border-conan-gold hover:text-white hover:bg-conan-navy-light/80'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Thêm vào giỏ hàng"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Đã thêm</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5 text-conan-gold" />
                            <span>Thêm giỏ</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={!product.inStock}
                        className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-conan-red to-conan-red-hover hover:from-conan-red-hover hover:to-conan-red text-white shadow-md shadow-conan-red/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Mua ngay</span>
                      </button>
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
