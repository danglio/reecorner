import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  ArrowRight,
  Sparkles,
  Phone,
  User,
  MapPin,
  MessageSquare,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { getSettings, getProducts } from '../services/storage';
import { triggerPlayConanBGM, ConanBowtieIcon } from './AudioPlayer';
import type { Product } from '../types';

export interface WelcomeModalProps {
  /**
   * Controls whether the Welcome Modal is visible.
   */
  isOpen: boolean;
  /**
   * Callback invoked when the modal should be closed.
   */
  onClose: () => void;
  /**
   * Callback invoked when the user skips or closes the modal to browse the shop.
   */
  onSkip?: () => void;
  /**
   * Optional additional CSS class names.
   */
  className?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  className = '',
}) => {
  // Form fields state
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Selected quick product chips
  const [selectedQuickItems, setSelectedQuickItems] = useState<string[]>([]);
  // Available products for quick selection
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Validation error state
  const [errors, setErrors] = useState<{
    customerName?: string;
    phone?: string;
  }>({});

  // Load available products for quick chip selection
  useEffect(() => {
    try {
      const prods = getProducts();
      setAvailableProducts(prods);
    } catch (e) {
      console.warn('Could not load products for welcome modal quick chips:', e);
    }
  }, []);

  // Lock body scroll and handle keyboard ESC when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkipToBrowse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // If modal is not open, do not render into DOM
  if (!isOpen) {
    return null;
  }

  // Handle "Bỏ qua để xem shop" or Close (X) button
  const handleSkipToBrowse = () => {
    // 1. Triggers Detective Conan BGM playback
    triggerPlayConanBGM();
    // 2. Invoke onSkip callback if provided
    onSkip?.();
    // 3. Close the modal
    onClose();
  };

  // Toggle quick select items
  const handleToggleProductChip = (productName: string) => {
    setSelectedQuickItems((prev) => {
      if (prev.includes(productName)) {
        return prev.filter((item) => item !== productName);
      } else {
        return [...prev, productName];
      }
    });
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: { customerName?: string; phone?: string } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Vui lòng nhập họ và tên của bạn';
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại để Zalo liên hệ';
    } else if (cleanPhone.length < 9 || cleanPhone.length > 11) {
      newErrors.phone = 'Số điện thoại không hợp lệ (cần 9 - 11 chữ số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle primary action: "GỬI ĐƠN QUA ZALO NGƯỜI BÁN"
  const handleSendZaloOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 1. Fetch configured Zalo phone number from storage settings
    const settings = getSettings();
    const rawZaloPhone = settings?.zaloPhone || '0901234567';
    const cleanZaloPhone = rawZaloPhone.replace(/[^0-9]/g, '') || '0901234567';

    // 2. Build items interest list
    const itemsList: string[] = [...selectedQuickItems];
    if (note.trim()) {
      itemsList.push(note.trim());
    }

    const itemsSection =
      itemsList.length > 0
        ? itemsList.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')
        : '  • Tư vấn danh mục thẻ bài & bảo bối Conan hot nhất';

    const addressSection = address.trim()
      ? address.trim()
      : '(Chưa cung cấp - Tư vấn & chốt địa chỉ qua Zalo)';

    // 3. Format pre-filled message with customer details in Detective theme
    const zaloMessage = [
      '🕵️ [VĂN PHÒNG THÁM TỬ MORI x TIỆM CONAN] ĐẶT HÀNG NHANH',
      '─────────────────────────────────────',
      `👤 Khách hàng: ${customerName.trim()}`,
      `📞 Số điện thoại: ${phone.trim()}`,
      `📍 Địa chỉ giao hàng: ${addressSection}`,
      '─────────────────────────────────────',
      '📦 Vật phẩm quan tâm:',
      itemsSection,
      '─────────────────────────────────────',
      '⚡ Xin chào shop, mình gửi yêu cầu đặt hàng nhanh từ website Tiệm Thám Tử Conan.',
      'Vui lòng kiểm tra và gửi báo giá / xác nhận đơn giúp mình nhé! Cảm ơn shop.',
    ].join('\n');

    // 4. Construct direct Zalo URL and open in new tab
    const zaloUrl = `https://zalo.me/${cleanZaloPhone}?text=${encodeURIComponent(zaloMessage)}`;

    try {
      window.open(zaloUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = zaloUrl;
    }

    // 5. Trigger Conan BGM audio and close modal
    triggerPlayConanBGM();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleSkipToBrowse}
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`glass-modal w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-conan-gold/40 glow-gold shadow-2xl relative flex flex-col text-slate-100 ${className}`}
      >
        {/* Decorative Top Accent Light Bars */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-conan-red via-conan-gold to-conan-red rounded-t-2xl sm:rounded-t-3xl" />

        {/* Close Button (X) with Skip Behavior */}
        <button
          type="button"
          onClick={handleSkipToBrowse}
          aria-label="Đóng popup chào mừng và xem shop"
          title="Bỏ qua & Xem shop (Phát nhạc Conan)"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/80 hover:bg-conan-red text-slate-300 hover:text-white flex items-center justify-center border border-white/10 hover:border-conan-red transition-all duration-200 active:scale-95 group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90 duration-200" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-7 pb-4 sm:pb-5 text-center relative border-b border-white/10">
          {/* Ambient Glow behind badge */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-16 bg-conan-gold/20 rounded-full blur-2xl pointer-events-none" />

          {/* Detective Agency Badge & Red Bow Tie */}
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-conan-red/25 border border-conan-red/50 flex items-center justify-center glow-red flex-shrink-0 shadow-lg">
              <ConanBowtieIcon className="w-7 h-7 sm:w-8 sm:h-8 text-conan-red" isAnimated={true} />
            </div>
            <div className="text-left">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-conan-gold/15 text-conan-gold border border-conan-gold/40">
                <Sparkles className="w-3 h-3 text-conan-gold animate-spin" style={{ animationDuration: '4s' }} />
                Hồ Sơ Mật #1412
              </span>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-300 tracking-wide uppercase">
                VĂN PHÒNG THÁM TỬ MORI
              </p>
            </div>
          </div>

          <h1
            id="welcome-modal-title"
            className="text-xl sm:text-2xl md:text-[26px] font-outfit font-extrabold tracking-tight text-white leading-snug"
          >
            VĂN PHÒNG THÁM TỬ MORI <span className="text-conan-gold">x</span> TIỆM VẬT PHẨM CONAN
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Chào mừng bạn đến với tiệm thẻ bài & bảo bối Conan! Đặt hàng nhanh nhận tư vấn tức thì qua{' '}
            <span className="text-conan-gold font-semibold">Zalo Người Bán</span> hoặc bỏ qua để dạo quanh shop.
          </p>

          {/* Feature Micro-Badges */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-conan-blue/40 border border-conan-blue/60 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Thẻ Bài Chính Hãng
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-conan-blue/40 border border-conan-blue/60 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-conan-gold" />
              Phản Hồi Zalo Nhanh
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-conan-blue/40 border border-conan-blue/60 text-slate-200">
              <Radio className="w-3.5 h-3.5 text-conan-red animate-pulse" />
              BGM Conan Sống Động
            </span>
          </div>
        </div>

        {/* Modal Body & Quick Order Form */}
        <form onSubmit={handleSendZaloOrder} className="p-5 sm:p-7 pt-4 sm:pt-5 space-y-4">
          <div className="text-left">
            <h2 className="text-xs font-bold text-conan-gold uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Package className="w-4 h-4 text-conan-gold" />
              Đặt Hàng / Đăng Ký Tư Vấn Nhanh Qua Zalo
            </h2>

            {/* Field: Full Name (Mandatory) */}
            <div className="space-y-1 mb-3.5">
              <label htmlFor="customer-name-input" className="block text-xs font-semibold text-slate-200">
                Họ & Tên khách hàng <span className="text-conan-red">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="customer-name-input"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) {
                      setErrors((prev) => ({ ...prev, customerName: undefined }));
                    }
                  }}
                  placeholder="Ví dụ: Kudo Shinichi / Ran Mori..."
                  className={`glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-400 border transition-all ${
                    errors.customerName
                      ? 'border-conan-red focus:border-conan-red focus:ring-1 focus:ring-conan-red/40'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                />
              </div>
              {errors.customerName && (
                <p className="text-[11px] text-conan-red flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Field: Phone Number (Mandatory) */}
            <div className="space-y-1 mb-3.5">
              <label htmlFor="customer-phone-input" className="block text-xs font-semibold text-slate-200">
                Số điện thoại liên hệ <span className="text-conan-red">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="customer-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  placeholder="Ví dụ: 0901234567 (Dùng để kết nối Zalo)"
                  className={`glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-400 border transition-all ${
                    errors.phone
                      ? 'border-conan-red focus:border-conan-red focus:ring-1 focus:ring-conan-red/40'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-conan-red flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Field: Shipping Address (Optional) */}
            <div className="space-y-1 mb-3.5">
              <label htmlFor="customer-address-input" className="block text-xs font-semibold text-slate-200">
                Địa chỉ nhận hàng <span className="text-slate-400 font-normal">(Tùy chọn)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="customer-address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-400 border border-white/10 hover:border-white/20"
                />
              </div>
            </div>

            {/* Quick Product Chips Selection */}
            {availableProducts.length > 0 && (
              <div className="space-y-1.5 mb-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-conan-gold" />
                    Chọn nhanh vật phẩm quan tâm:
                  </span>
                  {selectedQuickItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedQuickItems([])}
                      className="text-[11px] text-conan-gold hover:underline"
                    >
                      Bỏ chọn ({selectedQuickItems.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {availableProducts.map((p) => {
                    const isSelected = selectedQuickItems.includes(p.name);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleProductChip(p.name)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5 text-left ${
                          isSelected
                            ? 'bg-conan-gold/20 text-conan-gold border-conan-gold font-medium shadow-sm'
                            : 'bg-conan-navy-dark/60 text-slate-300 border-white/10 hover:border-conan-gold/50 hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-conan-gold flex-shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[200px] sm:max-w-[260px]">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Field: Note / Custom item request (Optional) */}
            <div className="space-y-1 mb-2">
              <label htmlFor="customer-note-input" className="block text-xs font-semibold text-slate-200">
                Ghi chú / Yêu cầu thêm <span className="text-slate-400 font-normal">(Tùy chọn)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <textarea
                  id="customer-note-input"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm về đơn hàng hoặc các vật phẩm sưu tầm bạn đang tìm kiếm..."
                  className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-400 border border-white/10 hover:border-white/20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            {/* Primary Action Button: Gửi Đơn Qua Zalo */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-conan-red hover:bg-conan-red-hover active:scale-[0.99] transition-all duration-200 shadow-lg shadow-conan-red/30 glow-red flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>GỬI ĐƠN QUA ZALO NGƯỜI BÁN</span>
            </button>

            {/* Secondary Action Button: Bỏ Qua Để Xem Shop */}
            <button
              type="button"
              onClick={handleSkipToBrowse}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-300 hover:text-white bg-conan-blue/40 hover:bg-conan-blue/70 border border-conan-gold/30 hover:border-conan-gold/60 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm group cursor-pointer"
            >
              <span>BỎ QUA ĐỂ XEM SHOP</span>
              <ArrowRight className="w-4 h-4 text-conan-gold group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Micro Audio Hint */}
            <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <span>🎵</span>
              <span>Bấm bỏ qua để bắt đầu khám phá và tự động phát nhạc Conan BGM</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WelcomeModal;
