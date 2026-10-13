import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  Phone,
  MapPin,
  User,
  Calendar,
  FileText,
  ExternalLink,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import {
  getOrderById,
  getOrderByCodeAndPhone,
  getOrderStatusInfo,
  formatVND,
  getSettings,
  ORDER_ACTIVE_STEPS,
} from '../services/storage';

export interface OrderStatusViewProps {
  initialOrderCode?: string;
  onSelectOrder?: (code: string) => void;
}

interface StepMeta {
  status: OrderStatus;
  title: string;
  shortTitle: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPPER_STAGES: StepMeta[] = [
  {
    status: 'pending',
    title: 'Chờ xác nhận',
    shortTitle: 'Tiếp nhận',
    desc: 'Văn phòng Mori đang tiếp nhận hồ sơ đơn hàng',
    icon: Clock,
  },
  {
    status: 'confirmed',
    title: 'Đã xác nhận',
    shortTitle: 'Xác nhận',
    desc: 'Đơn hàng hợp lệ, chuẩn bị xuất kho niêm phong',
    icon: CheckCircle2,
  },
  {
    status: 'processing',
    title: 'Đang xử lý',
    shortTitle: 'Đóng gói',
    desc: 'Bảo bối & thẻ bài đang được đóng gói chống sốc',
    icon: Package,
  },
  {
    status: 'shipping',
    title: 'Đang giao hàng',
    shortTitle: 'Vận chuyển',
    desc: 'Đặc vụ vận chuyển đang trên đường giao bưu phẩm',
    icon: Truck,
  },
  {
    status: 'delivered',
    title: 'Đã giao hàng',
    shortTitle: 'Hoàn tất',
    desc: 'Giao hàng thành công! Vụ án hoàn thành trọn vẹn',
    icon: Sparkles,
  },
];

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({
  initialOrderCode = 'CONAN-001',
  onSelectOrder,
}) => {
  const [orderCodeInput, setOrderCodeInput] = useState<string>(initialOrderCode);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const settings = getSettings();

  // Perform search
  const performSearch = (codeToSearch: string, phoneToSearch?: string) => {
    const cleanCode = codeToSearch.trim();
    if (!cleanCode) return;

    setHasSearched(true);
    let order: Order | undefined;

    if (phoneToSearch && phoneToSearch.trim()) {
      order = getOrderByCodeAndPhone(cleanCode, phoneToSearch.trim());
    } else {
      order = getOrderById(cleanCode);
    }

    setCurrentOrder(order || null);
    if (order && onSelectOrder) {
      onSelectOrder(order.id);
    }
  };

  // Auto-search initialOrderCode on mount or change
  useEffect(() => {
    if (initialOrderCode) {
      setOrderCodeInput(initialOrderCode);
      performSearch(initialOrderCode);
    }
  }, [initialOrderCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(orderCodeInput, phoneInput);
  };

  const handleQuickChipClick = (code: string) => {
    setOrderCodeInput(code);
    setPhoneInput('');
    performSearch(code);
  };

  const handleCopyOrderCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Determine active step index (0 to 4) for valid non-cancelled orders
  const currentStepIndex = useMemo(() => {
    if (!currentOrder || currentOrder.status === 'cancelled') return -1;
    const idx = ORDER_ACTIVE_STEPS.indexOf(currentOrder.status);
    return idx >= 0 ? idx : 0;
  }, [currentOrder]);

  const statusConfig = currentOrder ? getOrderStatusInfo(currentOrder.status) : null;

  // Build Zalo Link
  const zaloUrl = useMemo(() => {
    if (!currentOrder) return `https://zalo.me/${settings.zaloPhone}`;
    const textMessage = `Chào Văn phòng Thám tử Mori, tôi cần hỗ trợ kiểm tra đơn hàng #${currentOrder.id} (${currentOrder.customerName} - SĐT: ${currentOrder.phone}).`;
    return `https://zalo.me/${settings.zaloPhone}?text=${encodeURIComponent(textMessage)}`;
  }, [currentOrder, settings.zaloPhone]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner / Hero Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-conan-gold/10 border border-conan-gold/30 text-conan-gold text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Theo Dõi Vận Đơn Khách Hàng</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-outfit">
          Tra Cứu <span className="text-conan-gold">Tiến Độ Vụ Án</span> & Đơn Hàng
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Cập nhật hành trình bưu kiện thẻ bài & bảo bối thám tử chuẩn thời gian thực từ Văn phòng Mori.
        </p>
      </div>

      {/* Search Bar & Quick Filters */}
      <div className="glass-panel p-6 rounded-2xl border border-conan-gold/20 glow-blue">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Input Mã đơn hàng */}
            <div className="md:col-span-6 relative">
              <label htmlFor="order-code-input" className="block text-xs font-medium text-slate-300 mb-1">
                Mã hồ sơ / đơn hàng <span className="text-conan-red">*</span>
              </label>
              <div className="relative">
                <input
                  id="order-code-input"
                  type="text"
                  value={orderCodeInput}
                  onChange={(e) => setOrderCodeInput(e.target.value)}
                  placeholder="Nhập mã đơn hàng (VD: CONAN-001)..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl glass-input text-white text-sm placeholder-slate-500 font-mono tracking-wide focus:border-conan-gold"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-conan-gold/70">
                  #
                </span>
              </div>
            </div>

            {/* Input Số điện thoại (tùy chọn) */}
            <div className="md:col-span-3">
              <label htmlFor="phone-input" className="block text-xs font-medium text-slate-300 mb-1">
                Số điện thoại <span className="text-slate-500">(tùy chọn)</span>
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="VD: 0901234567"
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm placeholder-slate-500 focus:border-conan-gold"
              />
            </div>

            {/* Nút Tìm kiếm */}
            <div className="md:col-span-3 md:self-end">
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-breezy-blue to-[#DCEBFA] hover:from-[#DCEBFA] hover:to-breezy-blue text-navy-night font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-breezy-blue/25 border border-breezy-blue transition-all active:scale-[0.98] glow-breezy cursor-pointer"
              >
                <Search className="w-4 h-4 text-navy-night stroke-[2.5]" />
                <span>TRA CỨU TIẾN ĐỘ</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
            <span className="text-slate-400 font-medium">Mã đơn mẫu test nhanh:</span>
            <button
              type="button"
              onClick={() => handleQuickChipClick('CONAN-001')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center space-x-1.5 ${
                orderCodeInput.toUpperCase() === 'CONAN-001'
                  ? 'bg-conan-gold/20 border-conan-gold text-conan-gold font-bold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-conan-gold/50'
              }`}
            >
              <span>#CONAN-001</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Đang giao hàng
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickChipClick('KID-1412')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center space-x-1.5 ${
                orderCodeInput.toUpperCase() === 'KID-1412'
                  ? 'bg-conan-gold/20 border-conan-gold text-conan-gold font-bold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-conan-gold/50'
              }`}
            >
              <span>#KID-1412</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Đã giao hàng
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Kết quả Tra cứu */}
      {hasSearched && !currentOrder && (
        <div className="glass-card p-10 rounded-2xl border border-red-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Không tìm thấy hồ sơ đơn hàng</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Không tìm thấy đơn hàng với mã <span className="text-conan-gold font-mono font-bold">#{orderCodeInput}</span>
              {phoneInput ? ` và số điện thoại ${phoneInput}` : ''}. Vui lòng kiểm tra lại mã vận đơn hoặc số điện thoại đặt hàng.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleQuickChipClick('CONAN-001')}
              className="text-xs text-conan-gold hover:underline font-medium"
            >
              Thử tra cứu đơn mẫu: #CONAN-001 →
            </button>
          </div>
        </div>
      )}

      {currentOrder && (
        <div className="space-y-6">
          {/* Order Header Summary */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Mã đơn hàng:</span>
                <span className="text-xl md:text-2xl font-black font-mono text-conan-gold tracking-wider">
                  #{currentOrder.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyOrderCode(currentOrder.id)}
                  title="Sao chép mã đơn hàng"
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Thời gian đặt: {currentOrder.createdAt}</span>
              </div>
            </div>

            {/* Trạng thái hiện tại Badge */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Tình trạng hiện tại</p>
                <p className="text-xs text-slate-300 max-w-xs">{statusConfig?.description}</p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center space-x-2 ${
                  statusConfig?.badgeBg || 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                <span>{statusConfig?.label}</span>
              </div>
            </div>
          </div>

          {/* Cảnh báo trường hợp ĐÃ HỦY (Cancelled Order) */}
          {currentOrder.status === 'cancelled' && (
            <div className="glass-modal p-6 rounded-2xl border border-red-500/40 bg-red-950/40 text-red-200 space-y-2">
              <div className="flex items-center space-x-3 text-red-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h4 className="text-base font-bold">Vụ Án Đã Bị Đình Chỉ / Đơn Hàng Đã Hủy</h4>
              </div>
              <p className="text-sm text-red-200/90 pl-9">
                <span className="font-semibold">Lý do hủy: </span>
                {currentOrder.cancelReason || 'Đơn hàng đã được hủy theo yêu cầu của khách hàng hoặc do sự cố kỹ thuật.'}
              </p>
              <div className="pl-9 pt-2">
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-conan-gold hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Cần khôi phục đơn hoặc hỗ trợ khiếu nại qua Zalo →</span>
                </a>
              </div>
            </div>
          )}

          {/* Stepper 5 bước chuẩn enne.vn/order-status */}
          {currentOrder.status !== 'cancelled' && (
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-conan-gold/20 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>Tiến Trình Chuyển Giao Bưu Kiện</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-conan-gold/20 text-conan-gold border border-conan-gold/30">
                      Bước {currentStepIndex + 1}/5
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hệ thống tự động cập nhật liên tục các trạm trung chuyển Beika
                  </p>
                </div>
              </div>

              {/* Responsive Stepper Container */}
              <div className="relative pt-4 pb-2">
                {/* Connecting Progress Line */}
                <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-1.5 bg-slate-800 rounded-full overflow-hidden -z-0">
                  <div
                    className="h-full bg-gradient-to-r from-conan-gold via-amber-400 to-emerald-400 transition-all duration-700 ease-out rounded-full"
                    style={{
                      width: `${(Math.max(0, currentStepIndex) / (STEPPER_STAGES.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Stepper Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
                  {STEPPER_STAGES.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const StepIcon = step.icon;

                    let nodeStyle = 'bg-slate-900 border-slate-700 text-slate-500';
                    let textStyle = 'text-slate-500';

                    if (isCompleted) {
                      nodeStyle =
                        'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20';
                      textStyle = 'text-emerald-300 font-semibold';
                    } else if (isCurrent) {
                      nodeStyle =
                        'bg-conan-gold/20 border-conan-gold text-conan-gold ring-4 ring-conan-gold/20 shadow-xl shadow-conan-gold/30';
                      textStyle = 'text-conan-gold font-bold';
                    }

                    return (
                      <div
                        key={step.status}
                        className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0 relative group"
                      >
                        {/* Node Circle */}
                        <div
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${nodeStyle}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-scaleIn" />
                          ) : (
                            <StepIcon
                              className={`w-6 h-6 ${isCurrent ? 'animate-bounce' : ''}`}
                            />
                          )}
                        </div>

                        {/* Node Text */}
                        <div className="mt-0 md:mt-3 flex-1 md:flex-initial">
                          <div className="flex items-center md:justify-center space-x-1.5">
                            <span className="text-[11px] font-mono opacity-60">0{idx + 1}.</span>
                            <span className={`text-sm ${textStyle}`}>{step.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 md:px-2">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3 Detail Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Thông tin người nhận */}
            <div className="md:col-span-5 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center space-x-2 text-conan-gold font-bold text-base border-b border-white/5 pb-3">
                <User className="w-5 h-5" />
                <span>Thông Tin Nhận Hàng</span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Người nhận:</p>
                  <p className="font-semibold text-white mt-0.5">{currentOrder.customerName}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Số điện thoại liên lạc:</p>
                  <p className="font-mono text-slate-200 mt-0.5 flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentOrder.phone}</span>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Địa chỉ giao bưu phẩm:</p>
                  <p className="text-slate-300 mt-0.5 flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-conan-red flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{currentOrder.address}</span>
                  </p>
                </div>

                {currentOrder.note && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-xs text-conan-gold font-medium flex items-center space-x-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ghi chú từ thám tử:</span>
                    </p>
                    <p className="text-xs text-slate-300 italic">"{currentOrder.note}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Danh sách sản phẩm & Card 3: Tổng kết thanh toán */}
            <div className="md:col-span-7 space-y-6">
              {/* Card 2: Danh sách sản phẩm */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2 text-conan-gold font-bold text-base">
                    <Package className="w-5 h-5" />
                    <span>Kiện Hàng Thẻ Bài ({currentOrder.items.length} món)</span>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {currentOrder.items.map((item, i) => (
                    <div key={`${item.productId}-${i}`} className="py-3 flex items-center space-x-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 relative">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate" title={item.productName}>
                          {item.productName}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                          <span>Đơn giá: {formatVND(item.price)}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-300">SL: x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-conan-gold font-mono">
                          {formatVND(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Tổng kết thanh toán */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  Tổng Kết Thanh Toán
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Tạm tính tiền hàng:</span>
                    <span className="text-slate-200 font-mono">{formatVND(currentOrder.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Phí vận chuyển:</span>
                    <span className="text-slate-200 font-mono">
                      {currentOrder.shippingFee === 0 ? (
                        <span className="text-emerald-400 font-semibold">Miễn phí</span>
                      ) : (
                        formatVND(currentOrder.shippingFee)
                      )}
                    </span>
                  </div>

                  {currentOrder.discount > 0 && (
                    <div className="flex justify-between text-conan-red">
                      <span>Giảm giá thẻ bài / sự kiện:</span>
                      <span className="font-mono">-{formatVND(currentOrder.discount)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-base font-bold text-white">Tổng cộng thanh toán:</span>
                    <span className="text-2xl font-black text-conan-gold font-mono tracking-tight">
                      {formatVND(currentOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Support Contact Buttons */}
                <div className="pt-3 space-y-2">
                  <a
                    href={settings.facebookUrl || 'https://www.facebook.com/share/1EbKBvvmf9/?mibextid=wwXIfr'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-breezy-blue/20 hover:bg-breezy-blue/30 text-breezy-blue hover:text-white border border-breezy-blue/40 flex items-center justify-center space-x-2 font-bold text-sm transition-all shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4 text-breezy-blue" />
                    <span>Hỗ trợ đơn qua Facebook Người Bán</span>
                  </a>
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-4 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 flex items-center justify-center space-x-2 text-xs transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-cream-sun" />
                    <span>Kênh Zalo phụ ({settings.zaloPhone})</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusView;
