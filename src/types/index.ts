export type ProductRarity = string;

export interface Product {
  id: string;
  name: string;
  price: number; // Đơn giá theo VNĐ
  originalPrice?: number; // Giá gốc hiển thị gạch ngang (nếu có)
  rarity?: ProductRarity; // Nhãn / độ hiếm tùy chọn (có thể để trống hoặc xóa)
  image: string; // URL hoặc data URI Base64
  description: string;
  inStock: boolean;
  rating?: number; // Đánh giá sao (ví dụ: 4.9, 5.0)
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string; // Ví dụ: 'CONAN-001', 'KID-1412'
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  cancelReason?: string;
}

export interface AppSettings {
  zaloPhone: string; // Số điện thoại nhận đơn Zalo (mặc định '0901234567')
  facebookUrl: string; // Đường dẫn Facebook người bán (mặc định 'https://www.facebook.com/share/1EbKBvvmf9/?mibextid=wwXIfr')
  adminPin: string; // Mã PIN truy cập trang quản trị bí mật (mặc định '1412')
  customTags?: string[]; // Danh sách nhãn/độ hiếm tùy chỉnh, cho phép thêm và xóa hoàn toàn
}

export interface OrderStatusConfig {
  step: number; // Thứ tự bước (1-5, hoặc 0 cho 'cancelled')
  label: string; // Tên hiển thị đầy đủ (ví dụ: 'Đang giao hàng')
  shortLabel: string; // Tên hiển thị ngắn gọn trên stepper
  description: string; // Mô tả ngữ cảnh Conan
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
}
