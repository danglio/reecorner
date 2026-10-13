import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import type { Product, OrderItem, Order } from '../types';
import { createOrder, getSettings, formatVND } from '../services/storage';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart?: CartItem[];
  items?: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderSuccess?: (newOrder: Order) => void;
  onCheckoutZalo?: (order: Order) => void;
}

interface NormalizedItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  inStock?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
  onCheckoutZalo,
}) => {
  // Customer Info Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  // Validation & feedback state
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Normalize cart items regardless of which prop was passed
  const normalizedItems: NormalizedItem[] = useMemo(() => {
    if (cart && cart.length > 0) {
      return cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
        inStock: item.product.inStock,
      }));
    }
    if (items && items.length > 0) {
      return items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        image: item.productImage,
        quantity: item.quantity,
      }));
    }
    return [];
  }, [cart, items]);

  const subtotal = useMemo(() => {
    return normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [normalizedItems]);

  const totalQuantity = useMemo(() => {
    return normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [normalizedItems]);

  const handleClose = useCallback(() => {
    setCreatedOrder(null);
    onClose();
  }, [onClose]);

  // Reset created order state when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setCreatedOrder(null);
    }
  }, [isOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: { name?: string; phone?: string; address?: string } = {};
    if (!customerName.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên của bạn';
    }
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      newErrors.phone = 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9-10 chữ số)';
    }
    if (!address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ nhận hàng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckoutFacebook = () => {
    if (normalizedItems.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Get settings for recipient Facebook URL
      const settings = getSettings();
      const facebookUrl =
        settings.facebookUrl ||
        'https://www.facebook.com/share/1EbKBvvmf9/?mibextid=wwXIfr';

      // 2. Prepare order items
      const orderItems: OrderItem[] = normalizedItems.map((item) => ({
        productId: item.productId,
        productName: item.name,
        productImage: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      // 3. Persist order to storage
      const newOrder = createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim() || undefined,
        items: orderItems,
        subtotal: subtotal,
        shippingFee: 0,
        discount: 0,
        total: subtotal,
        status: 'pending',
      });

      // 4. Compose order message
      const itemsListText = orderItems
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.productName}\n   - SL: ${item.quantity} x ${formatVND(item.price)} = ${formatVND(
              item.price * item.quantity
            )}`
        )
        .join('\n');

      const message = `🔍 [BREECORNER X CONAN SHOP] ĐƠN HÀNG MỚI
====================================
🆔 Mã đơn hàng: ${newOrder.id}
👤 Khách hàng: ${newOrder.customerName}
📞 Số điện thoại: ${newOrder.phone}
🏠 Địa chỉ nhận: ${newOrder.address}
📝 Ghi chú: ${newOrder.note || 'Không có'}
------------------------------------
📦 DANH SÁCH BẢO BỐI / THẺ BÀI SƯU TẦM:
${itemsListText}
------------------------------------
💰 TỔNG THANH TOÁN: ${formatVND(newOrder.total)}
🚚 Phí vận chuyển: Miễn phí toàn quốc
====================================
👉 Nhờ shop xác nhận và gửi hàng giúp mình nhé!
🔍 Tra cứu trạng thái đơn tại web với mã: ${newOrder.id}`;

      // Copy to clipboard for easy pasting into Facebook chat
      try {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(message);
        }
      } catch {
        // Ignore clipboard write error
      }

      // 5. Open Facebook profile / chat
      try {
        window.open(facebookUrl, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = facebookUrl;
      }

      // 6. Notify callbacks and transition state
      if (onOrderSuccess) onOrderSuccess(newOrder);
      if (onCheckoutZalo) onCheckoutZalo(newOrder);

      setCreatedOrder(newOrder);
      onClearCart();
    } catch (err) {
      console.error('Lỗi khi xuất đơn hàng qua Facebook:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-conan-navy-dark/95 border-l border-white/10 backdrop-blur-2xl text-slate-100 flex flex-col shadow-2xl relative animate-slideLeft">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-conan-navy/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-breezy-blue/15 text-breezy-blue flex items-center justify-center border border-breezy-blue/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-outfit font-bold text-lg text-white flex items-center gap-2">
                  <span>Giỏ Hàng BreeCorner</span>
                  {totalQuantity > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-breezy-blue text-navy-night font-extrabold">
                      {totalQuantity}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Vật phẩm sẵn sàng đóng gói & chốt đơn Facebook
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Đóng giỏ hàng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {createdOrder ? (
              /* Success Screen inside Drawer */
              <div className="py-8 text-center space-y-6 animate-fadeIn">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                    ĐƠN HÀNG ĐÃ ĐƯỢC TIẾP NHẬN
                  </span>
                  <h3 className="text-xl font-bold font-outfit text-white">
                    Đã Khởi Tạo Đơn Hàng Thành Công!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Hệ thống đã tự động lưu hồ sơ đơn hàng và sao chép chi tiết vào bộ nhớ đệm, đồng thời chuyển hướng tới Facebook Người Bán để bạn gửi chốt đơn tức thì.
                  </p>
                </div>

                {/* Order Code Box */}
                <div className="p-4 rounded-xl bg-conan-navy border border-breezy-blue/40 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Mã tra cứu đơn hàng:</span>
                    <button
                      onClick={() => handleCopyCode(createdOrder.id)}
                      className="inline-flex items-center space-x-1 text-xs text-breezy-blue hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                    </button>
                  </div>
                  <div className="text-xl font-mono font-black text-cream-sun tracking-wider">
                    {createdOrder.id}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hãy lưu mã này để tra cứu lộ trình vận chuyển trên thanh tìm kiếm bất kỳ lúc nào!
                  </p>
                </div>

                {/* Quick Info Summary */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-left text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Người nhận:</span>
                    <span className="font-semibold text-white">{createdOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-semibold text-white">{createdOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tổng thanh toán:</span>
                    <span className="font-bold text-cream-sun">{formatVND(createdOrder.total)}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-breezy-blue text-navy-night font-extrabold text-sm shadow-lg shadow-breezy-blue/20 hover:brightness-110 transition-all"
                  >
                    Hoàn tất & Tiếp tục khám phá
                  </button>
                </div>
              </div>
            ) : normalizedItems.length === 0 ? (
              /* Empty Cart State */
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/60 border border-white/10 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Giỏ hàng của bạn đang trống</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Chưa có thẻ bài hoặc báu vật nào trong giỏ. Hãy chọn những món đồ bạn yêu thích nhé!
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-breezy-blue text-navy-night font-bold text-xs hover:brightness-110 transition-all"
                >
                  Khám phá cửa hàng ngay
                </button>
              </div>
            ) : (
              /* Items List & Checkout Form */
              <>
                {/* 1. Item List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>DANH SÁCH SẢN PHẨM ({normalizedItems.length})</span>
                    <button
                      onClick={onClearCart}
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa tất cả</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {normalizedItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-conan-navy/70 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-950 border border-white/10"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                          }}
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                            {item.name}
                          </h4>
                          <div className="text-xs font-bold text-conan-gold">
                            {formatVND(item.price)}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 pt-1">
                            <div className="inline-flex items-center rounded-lg border border-white/15 bg-slate-900/80">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.productId,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                disabled={item.quantity <= 1}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Giảm số lượng"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.productId, item.quantity + 1)
                                }
                                className="p-1 text-slate-400 hover:text-white"
                                title="Tăng số lượng"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[11px] text-slate-400">
                              = {formatVND(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.productId)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Xóa vật phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Customer Information Form */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-conan-gold">
                    <User className="w-4 h-4" />
                    <span>THÔNG TIN GIAO HÀNG & NHẬN ĐƠN</span>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                      <span>Họ và tên người nhận *</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        placeholder="Ví dụ: Kudo Shinichi"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl bg-conan-navy/80 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                          errors.name
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-white/15 focus:border-conan-gold'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">
                      Số điện thoại nhận hàng *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors({ ...errors, phone: undefined });
                        }}
                        placeholder="Ví dụ: 0901234567"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl bg-conan-navy/80 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                          errors.phone
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-white/15 focus:border-conan-gold'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">
                      Địa chỉ nhận hàng chi tiết *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (errors.address) setErrors({ ...errors, address: undefined });
                        }}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                        className={`w-full pl-9 pr-3 py-2 rounded-xl bg-conan-navy/80 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none ${
                          errors.address
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-white/15 focus:border-conan-gold'
                        }`}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">
                      Ghi chú đơn hàng (Tùy chọn)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ví dụ: Giao giờ hành chính, bọc chống sốc thẻ bài..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-conan-navy/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-conan-gold transition-all"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer with Summary & Checkout Button */}
          {!createdOrder && normalizedItems.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-conan-navy/90 space-y-3">
              {/* Order pricing summary */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tạm tính:</span>
                  <span className="font-semibold text-white">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phí vận chuyển:</span>
                  <span className="text-emerald-400 font-medium">Miễn phí toàn quốc</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                  <span className="font-bold text-white text-sm">Tổng cộng:</span>
                  <span className="text-xl font-black font-outfit text-conan-gold">
                    {formatVND(subtotal)}
                  </span>
                </div>
              </div>

              {/* Facebook Checkout Button */}
              <button
                onClick={handleCheckoutFacebook}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-conan-red to-conan-red-hover hover:from-conan-red-hover hover:to-conan-red text-white font-extrabold text-sm shadow-xl shadow-conan-red/25 flex items-center justify-center space-x-2 transition-all transform active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>XÁC NHẬN ĐẶT HÀNG QUA FACEBOOK</span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-conan-gold" />
                <span>Tự động sinh mã tra cứu CONAN-xxx lưu vào hệ thống</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
