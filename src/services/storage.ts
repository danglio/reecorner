import type {
  Product,
  Order,
  OrderStatus,
  AppSettings,
  OrderStatusConfig,
  ProductRarity,
} from '../types';

export const STORAGE_KEYS = {
  PRODUCTS: 'conan_products',
  ORDERS: 'conan_orders',
  SETTINGS: 'conan_settings',
} as const;

// 1. Initial Mock Data
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Hộp Thẻ Bài Conan Cao Cấp - Vụ Án Thế Kỷ',
    price: 350000,
    originalPrice: 420000,
    rarity: 'SSR',
    image:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    description:
      'Hộp thẻ bài Conan phiên bản đặc biệt kỷ niệm vụ án thế kỷ. Bao gồm 10 pack thẻ bài chất lượng cao, cơ hội mở trúng thẻ chữ ký mạ vàng của tác giả Gosho Aoyama và thẻ 3D Hologram siêu hiếm.',
    inStock: true,
    rating: 5.0,
  },
  {
    id: 'prod-2',
    name: 'Thẻ Hologram Giới Hạn: Conan & Siêu Đạo Chích Kid',
    price: 180000,
    originalPrice: 220000,
    rarity: 'UR',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    description:
      'Thẻ bài Hologram ánh kim độc quyền tái hiện cuộc đấu trí kinh điển dưới ánh trăng Tokyo giữa Edogawa Conan và Kaitou Kid (1412). Phủ màng bảo vệ 3D chống trầy xước, ánh quang 7 màu rực rỡ.',
    inStock: true,
    rating: 4.9,
  },
  {
    id: 'prod-3',
    name: 'Huy Hiệu Đội Thám Tử Nhí Tích Hợp Bộ Đàm',
    price: 120000,
    originalPrice: 150000,
    rarity: 'DETECTIVE',
    image:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    description:
      'Bảo bối kinh điển của Tiến sĩ Agasa dành riêng cho Đội Thám Tử Nhí Lớp 1B. Chất liệu hợp kim mạ vàng ánh đồng sắc sảo, tích hợp mô hình bộ đàm liên lạc và kim cài áo tiện lợi.',
    inStock: true,
    rating: 4.8,
  },
  {
    id: 'prod-4',
    name: 'Nơ Biến Đổi Giọng Nói Mori Kogoro Special Edition',
    price: 250000,
    originalPrice: 300000,
    rarity: 'SSR',
    image:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    description:
      'Vũ khí phá án số một của Conan - Chiếc nơ biến đổi giọng nói phong cách Mori Kogoro "Ngủ Gật". Vải nhung đỏ rực rỡ, trang bị núm xoay điều chỉnh tần số âm thanh cơ học chuẩn tỉ lệ 1:1.',
    inStock: true,
    rating: 4.9,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'CONAN-001',
    customerName: 'Kudo Shinichi',
    phone: '0901234567',
    address: 'Văn phòng Thám tử Mori, Số 5 Phố Beika, Tokyo (Giao về 221B Baker St, Quận 1, TP.HCM)',
    note: 'Vui lòng giao hàng giờ hành chính, bọc chống sốc thẻ bài giúp mình nhé!',
    items: [
      {
        productId: 'prod-1',
        productName: 'Hộp Thẻ Bài Conan Cao Cấp - Vụ Án Thế Kỷ',
        productImage:
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        price: 350000,
        quantity: 1,
      },
      {
        productId: 'prod-2',
        productName: 'Thẻ Hologram Giới Hạn: Conan & Siêu Đạo Chích Kid',
        productImage:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        price: 180000,
        quantity: 1,
      },
    ],
    subtotal: 530000,
    shippingFee: 0,
    discount: 0,
    total: 530000,
    status: 'shipping',
    createdAt: '2026-10-10 09:30',
  },
  {
    id: 'KID-1412',
    customerName: 'Kuroba Kaito',
    phone: '0988888888',
    address: 'Tháp Đồng Hồ Beika, Tokyo (Giao về Tòa nhà Landmark 81, Quận Bình Thạnh, TP.HCM)',
    note: 'Hẹn gặp lúc trăng tròn. Hãy bảo vệ báu vật thật kỹ!',
    items: [
      {
        productId: 'prod-2',
        productName: 'Thẻ Hologram Giới Hạn: Conan & Siêu Đạo Chích Kid',
        productImage:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        price: 180000,
        quantity: 1,
      },
    ],
    subtotal: 180000,
    shippingFee: 0,
    discount: 0,
    total: 180000,
    status: 'delivered',
    createdAt: '2026-10-09 14:12',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  zaloPhone: '0901234567',
  adminPin: '1412',
};

// 2. Formatters & Helpers
export function formatVND(amount: number): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return val.toLocaleString('vi-VN') + 'đ';
}

export const ORDER_ACTIVE_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipping',
  'delivered',
];

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    step: 1,
    label: 'Chờ xác nhận',
    shortLabel: 'Tiếp nhận',
    description: 'Đơn hàng đang chờ văn phòng thám tử tiếp nhận và kiểm tra thông tin',
    color: 'text-amber-400',
    textColor: 'text-amber-300',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  confirmed: {
    step: 2,
    label: 'Đã xác nhận',
    shortLabel: 'Xác nhận',
    description: 'Hồ sơ vụ án đã được phê duyệt, chuẩn bị lên đơn giao hàng',
    color: 'text-blue-400',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  processing: {
    step: 3,
    label: 'Đang xử lý',
    shortLabel: 'Đóng gói',
    description: 'Vật phẩm đang được đóng gói niêm phong cẩn thận tại trụ sở',
    color: 'text-indigo-400',
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  shipping: {
    step: 4,
    label: 'Đang giao hàng',
    shortLabel: 'Vận chuyển',
    description: 'Đặc vụ vận chuyển đang trên đường giao hàng đến địa chỉ nhận',
    color: 'text-purple-400',
    textColor: 'text-purple-300',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  delivered: {
    step: 5,
    label: 'Đã giao hàng',
    shortLabel: 'Hoàn tất',
    description: 'Giao hàng thành công! Vụ án hoàn tất trọn vẹn',
    color: 'text-emerald-400',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  cancelled: {
    step: 0,
    label: 'Đã hủy',
    shortLabel: 'Đã hủy',
    description: 'Vụ án đã bị đình chỉ / Đơn hàng đã hủy theo yêu cầu',
    color: 'text-red-400',
    textColor: 'text-red-300',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
};

export function getOrderStatusInfo(status: OrderStatus): OrderStatusConfig {
  return ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP.pending;
}

export function getRarityBadgeInfo(rarity: ProductRarity): {
  label: string;
  badgeClass: string;
} {
  switch (rarity) {
    case 'SSR':
      return {
        label: 'SSR Cực Hiếm',
        badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30',
      };
    case 'UR':
      return {
        label: 'UR Huyền Thoại',
        badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    case 'SR':
      return {
        label: 'SR Hiếm',
        badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      };
    case 'R':
      return {
        label: 'R Thường',
        badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      };
    case 'DETECTIVE':
      return {
        label: 'BẢO BỐI AGASA',
        badgeClass: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-semibold',
      };
    default:
      return {
        label: rarity,
        badgeClass: 'bg-slate-700/50 text-slate-300 border border-slate-600',
      };
  }
}

// 3. Storage In-memory & LocalStorage Layer
const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__conan_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getStorageItem<T>(key: string): T | null {
  try {
    if (isLocalStorageAvailable()) {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
    const memRaw = memoryStore[key];
    return memRaw ? (JSON.parse(memRaw) as T) : null;
  } catch (error) {
    console.error(`Lỗi khi đọc ${key} từ LocalStorage:`, error);
    return null;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    if (isLocalStorageAvailable()) {
      window.localStorage.setItem(key, serialized);
    }
    memoryStore[key] = serialized;
  } catch (error) {
    console.error(`Lỗi khi ghi ${key} vào LocalStorage:`, error);
  }
}

// 4. Products API
export function getProducts(): Product[] {
  const cached = getStorageItem<Product[]>(STORAGE_KEYS.PRODUCTS);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  setStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

export function saveProduct(product: Product): Product {
  const products = getProducts();
  const id = product.id ? product.id.trim() : `prod-${Date.now()}`;
  const productToSave: Product = { ...product, id };

  const existingIndex = products.findIndex((p) => p.id === id);
  let updatedProducts: Product[];
  if (existingIndex >= 0) {
    updatedProducts = [...products];
    updatedProducts[existingIndex] = productToSave;
  } else {
    updatedProducts = [productToSave, ...products];
  }

  setStorageItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
  return productToSave;
}

export function deleteProduct(id: string): void {
  const products = getProducts();
  const updatedProducts = products.filter((p) => p.id !== id);
  setStorageItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
}

// 5. Orders API
export function getOrders(): Order[] {
  const cached = getStorageItem<Order[]>(STORAGE_KEYS.ORDERS);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  setStorageItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

export function getOrderById(codeOrId: string): Order | undefined {
  if (!codeOrId) return undefined;
  const clean = codeOrId.trim().toLowerCase();
  const normalized = clean.replace(/[^a-z0-9]/g, '');
  const orders = getOrders();

  return orders.find((order) => {
    const orderIdLower = order.id.toLowerCase();
    const orderPhone = order.phone.trim();
    return (
      orderIdLower === clean ||
      orderIdLower.replace(/[^a-z0-9]/g, '') === normalized ||
      orderPhone === clean
    );
  });
}

export function getOrderByCodeAndPhone(code: string, phone?: string): Order | undefined {
  if (!code) return undefined;
  const cleanCode = code.trim().toLowerCase();
  const normalizedCode = cleanCode.replace(/[^a-z0-9]/g, '');
  const cleanPhone = phone?.trim().replace(/[^0-9]/g, '');
  const orders = getOrders();

  return orders.find((order) => {
    const orderIdLower = order.id.toLowerCase();
    const matchCode =
      orderIdLower === cleanCode ||
      orderIdLower.replace(/[^a-z0-9]/g, '') === normalizedCode;

    if (!cleanPhone) return matchCode;

    const matchPhone = order.phone.replace(/[^0-9]/g, '') === cleanPhone;
    return matchCode && matchPhone;
  });
}

export function updateOrderStatus(
  codeOrId: string,
  status: OrderStatus,
  cancelReason?: string
): Order | undefined {
  const orders = getOrders();
  const clean = codeOrId.trim().toLowerCase();
  const index = orders.findIndex(
    (o) =>
      o.id.toLowerCase() === clean ||
      o.id.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')
  );

  if (index === -1) return undefined;

  const targetOrder = orders[index];
  const updatedOrder: Order = {
    ...targetOrder,
    status,
    cancelReason:
      status === 'cancelled'
        ? cancelReason || targetOrder.cancelReason || 'Đơn hàng đã hủy theo yêu cầu'
        : undefined,
  };

  const updatedOrders = [...orders];
  updatedOrders[index] = updatedOrder;
  setStorageItem(STORAGE_KEYS.ORDERS, updatedOrders);
  return updatedOrder;
}

export function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
  const orders = getOrders();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const newOrder: Order = {
    ...orderData,
    id: `CONAN-${randomSuffix}`,
    createdAt: dateStr,
  };

  const updatedOrders = [newOrder, ...orders];
  setStorageItem(STORAGE_KEYS.ORDERS, updatedOrders);
  return newOrder;
}

// 6. Settings API
export function getSettings(): AppSettings {
  const cached = getStorageItem<AppSettings>(STORAGE_KEYS.SETTINGS);
  if (cached && cached.zaloPhone && cached.adminPin) {
    return cached;
  }
  setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  setStorageItem(STORAGE_KEYS.SETTINGS, settings);
}

// 7. Reset Storage helper (hữu ích cho Admin / Test)
export function resetStorage(): void {
  setStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  setStorageItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}
