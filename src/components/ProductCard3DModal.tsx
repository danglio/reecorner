import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ShoppingCart,
  Zap
} from 'lucide-react';
import type { Product } from '../types';
import { getRarityBadgeInfo, formatVND } from '../services/storage';

export interface ProductCard3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentProductIndex: number;
  onSelectProductIndex: (index: number) => void;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard3DModal: React.FC<ProductCard3DModalProps> = ({
  isOpen,
  onClose,
  products,
  currentProductIndex,
  onSelectProductIndex,
  onAddToCart,
  onBuyNow
}) => {
  // Current product
  const product = products[currentProductIndex] || products[0];

  // 3D rotation state
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Animation frame ref
  const animFrameRef = useRef<number | null>(null);
  const autoAngleRef = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset 3D angle
  const handleResetAngle = useCallback(() => {
    setIsAutoRotate(false);
    setRotateX(0);
    setRotateY(0);
    autoAngleRef.current = 0;
  }, []);

  // Reset angle when changing product
  useEffect(() => {
    if (isOpen) {
      handleResetAngle();
    }
  }, [currentProductIndex, isOpen, handleResetAngle]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentProductIndex, products.length]);

  // Auto rotation loop
  useEffect(() => {
    if (!isAutoRotate) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const animate = () => {
      autoAngleRef.current += 1.2;
      // Gentle continuous 3D wobble / rotation
      const y = Math.sin((autoAngleRef.current * Math.PI) / 180) * 35;
      const x = Math.cos((autoAngleRef.current * Math.PI) / 180 * 0.7) * 15;
      setRotateY(y);
      setRotateX(x);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isAutoRotate]);

  // Navigate Previous
  const handlePrev = () => {
    if (products.length <= 1) return;
    const newIndex = (currentProductIndex - 1 + products.length) % products.length;
    onSelectProductIndex(newIndex);
  };

  // Navigate Next
  const handleNext = () => {
    if (products.length <= 1) return;
    const newIndex = (currentProductIndex + 1) % products.length;
    onSelectProductIndex(newIndex);
  };

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    setRotateY((prev) => prev + deltaX * 0.6);
    setRotateX((prev) => Math.max(-50, Math.min(50, prev - deltaY * 0.6)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setIsAutoRotate(false);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });

    setRotateY((prev) => prev + deltaX * 0.6);
    setRotateX((prev) => Math.max(-50, Math.min(50, prev - deltaY * 0.6)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add to cart click
  const handleAddToCartClick = () => {
    if (onAddToCart && product) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  // Buy now click
  const handleBuyNowClick = () => {
    if (onBuyNow && product) {
      onBuyNow(product);
      onClose();
    } else if (onAddToCart && product) {
      onAddToCart(product);
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const rarityInfo = getRarityBadgeInfo(product.rarity);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  // Calculate dynamic specular glare position based on angle
  const glareX = 50 + (rotateY / 50) * 40;
  const glareY = 50 - (rotateX / 50) * 40;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto select-none"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/40 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP STAGE (Card presentation area) */}
        <div className="relative bg-gradient-to-b from-[#f8f9fa] to-[#eceef2] pt-4 pb-6 px-4 sm:px-8 flex flex-col items-center">
          {/* Header Row: Counter Badge and Close Button */}
          <div className="w-full flex items-center justify-between z-20 mb-2">
            {/* Top-left Counter: e.g. 17 / 151 */}
            <div className="px-3.5 py-1 rounded-full bg-slate-700/80 backdrop-blur-sm text-white font-mono text-xs font-semibold shadow-sm">
              {currentProductIndex + 1} / {products.length}
            </div>

            {/* Top-right Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Left Navigation Arrow */}
          {products.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-500/40 hover:bg-slate-700 text-white flex items-center justify-center transition-all shadow-md z-30 cursor-pointer active:scale-95"
              aria-label="Sản phẩm trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {products.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-500/40 hover:bg-slate-700 text-white flex items-center justify-center transition-all shadow-md z-30 cursor-pointer active:scale-95"
              aria-label="Sản phẩm tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* 3D CARD DISPLAY STAGE */}
          <div
            className="w-full flex items-center justify-center py-2 sm:py-3 cursor-grab active:cursor-grabbing perspective-1000"
            style={{ perspective: '1100px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={cardRef}
              className="relative w-[210px] sm:w-[250px] aspect-[2.5/3.6] rounded-2xl overflow-hidden shadow-2xl transition-transform ease-out"
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
                boxShadow: `${-rotateY * 0.8}px ${rotateX * 0.8 + 20}px 35px rgba(0, 0, 0, 0.28)`,
                transition: isDragging ? 'none' : 'transform 0.25s ease-out',
              }}
            >
              {/* Product Card Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl pointer-events-none select-none"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                }}
              />

              {/* Dynamic Holographic & Metallic Glare Overlay */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl mix-blend-color-dodge transition-opacity duration-150"
                style={{
                  background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 230, 150, 0.3) 30%, rgba(130, 200, 255, 0.2) 60%, transparent 80%)`,
                  opacity: Math.min(1, (Math.abs(rotateX) + Math.abs(rotateY)) / 40 + 0.15),
                }}
              />

              {/* Border shine effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Interactive Controls below card: [▷ Tự động] [↺ Reset] */}
          <div className="flex items-center justify-center gap-2.5 mt-3 z-20">
            {/* Auto-rotate Button */}
            <button
              type="button"
              onClick={() => setIsAutoRotate((prev) => !prev)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isAutoRotate
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-slate-700/80 hover:bg-slate-800 text-white'
              }`}
            >
              {isAutoRotate ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAutoRotate ? 'Tạm dừng' : 'Tự động'}</span>
            </button>

            {/* Reset Angle Button */}
            <button
              type="button"
              onClick={handleResetAngle}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-600/80 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Hint text: Kéo để xoay thủ công */}
          <p className="text-[11px] text-slate-500 mt-2 font-medium tracking-wide">
            Kéo để xoay thủ công
          </p>
        </div>

        {/* BOTTOM SECTION (Product details & quick action) */}
        <div className="p-5 sm:p-6 bg-white space-y-3.5 border-t border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              {/* Rarity Tag Badge (e.g. CR / SSR / UR) */}
              <div className="flex items-center gap-2">
                {rarityInfo ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${rarityInfo.badgeClass}`}>
                    {rarityInfo.label}
                  </span>
                ) : product.rarity ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-orange-500 text-white shadow-sm">
                    {product.rarity}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-800 text-white shadow-sm">
                    BreeCorner
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-red-100 text-conan-red">
                    -{discountPercent}%
                  </span>
                )}

                {product.id && (
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    #{product.id}
                  </span>
                )}
              </div>

              {/* Product Code / Title (e.g. QY09-CR-005) */}
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug font-outfit">
                {product.name}
              </h3>
            </div>

            {/* Price display */}
            <div className="text-right shrink-0">
              <div className="text-lg sm:text-xl font-black text-conan-red font-outfit">
                {formatVND(product.price)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-xs text-slate-400 line-through">
                  {formatVND(product.originalPrice)}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Actions: Đặt đơn & Thêm giỏ hàng */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={!product.inStock}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isAdded ? 'Đã thêm giỏ hàng' : 'Thêm giỏ hàng'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNowClick}
              disabled={!product.inStock}
              className="py-2.5 px-3 rounded-xl bg-conan-red hover:bg-red-600 text-white text-xs font-black tracking-wide uppercase transition-all shadow-md shadow-conan-red/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>ĐẶT ĐƠN NGAY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard3DModal;
