import type {
  Product,
  Order,
  OrderStatus,
  AppSettings,
  OrderStatusConfig,
  ProductRarity,
} from '../types';
import storeData from '../data/storeData.json';

export const STORAGE_KEYS = {
  PRODUCTS: 'conan_products',
  ORDERS: 'conan_orders',
  SETTINGS: 'conan_settings',
  DATA_VERSION: 'conan_data_version',
  DATA_UPDATED_AT: 'conan_data_updated_at',
  LAST_SYNC: 'conan_last_sync_time',
  AUTO_SYNC: 'conan_auto_sync_to_source',
  GITHUB_CONFIG: 'conan_github_sync_config',
} as const;

// 1. Initial Source Data from storeData.json (Source of truth)
export const INITIAL_PRODUCTS: Product[] = (storeData.products || []) as Product[];
export const INITIAL_ORDERS: Order[] = (storeData.orders || []) as Order[];
export const INITIAL_SETTINGS: AppSettings = (storeData.settings || {
  zaloPhone: '0901234567',
  facebookUrl: 'https://www.facebook.com/share/1EbKBvvmf9/?mibextid=wwXIfr',
  adminPin: '1412',
  customTags: ['Bảo Bối Agasa', 'Bản Giới Hạn', 'Bán Chạy', 'Mới Nhất', 'SSR', 'UR'],
}) as AppSettings;

export const STORE_DATA_VERSION = storeData.version || '1.0.1';
export const STORE_DATA_LAST_UPDATED = storeData.lastUpdated || new Date().toISOString();

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

export function getRarityBadgeInfo(rarity?: ProductRarity): {
  label: string;
  badgeClass: string;
} | null {
  if (!rarity || !rarity.trim()) {
    return null;
  }
  const clean = rarity.trim();
  const normalized = clean.toUpperCase();
  switch (normalized) {
    case 'SSR':
      return {
        label: 'SSR Cực Hiếm',
        badgeClass: 'bg-conan-red/20 text-[#FFF4C8] border border-conan-red/40',
      };
    case 'UR':
      return {
        label: 'UR Huyền Thoại',
        badgeClass: 'bg-breezy-blue/20 text-breezy-blue border border-breezy-blue/40',
      };
    case 'SR':
      return {
        label: 'SR Hiếm',
        badgeClass: 'bg-matcha-tea/25 text-[#FFF4C8] border border-matcha-tea/40',
      };
    case 'R':
      return {
        label: 'R Thường',
        badgeClass: 'bg-blue-500/20 text-breezy-blue border border-blue-500/30',
      };
    case 'DETECTIVE':
      return {
        label: 'BẢO BỐI AGASA',
        badgeClass: 'bg-matcha-tea/30 text-cream-sun border border-matcha-tea/50 font-semibold',
      };
    default:
      return {
        label: clean,
        badgeClass: 'bg-breezy-blue/20 text-breezy-blue border border-breezy-blue/40 font-semibold',
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

// 4. Source Version Check & Auto Sync to Local
export function checkAndUpdateFromSource(force: boolean = false): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const savedVersion = window.localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    const savedUpdatedAt = window.localStorage.getItem(STORAGE_KEYS.DATA_UPDATED_AT);

    // Chỉ ghi đè khi chưa từng có dữ liệu hoặc file bundle thực sự mới hơn dữ liệu đã lưu
    // Tuyệt đối không xóa dữ liệu chỉ vì chuỗi version khác nhau (tránh ghi đè admin cập nhật)
    const isNewer =
      !savedVersion ||
      !savedUpdatedAt ||
      (STORE_DATA_LAST_UPDATED && savedUpdatedAt && new Date(STORE_DATA_LAST_UPDATED) > new Date(savedUpdatedAt));

    if (force || isNewer) {
      setStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      setStorageItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      window.localStorage.setItem(STORAGE_KEYS.DATA_VERSION, STORE_DATA_VERSION);
      window.localStorage.setItem(STORAGE_KEYS.DATA_UPDATED_AT, STORE_DATA_LAST_UPDATED);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Lỗi khi kiểm tra phiên bản dữ liệu nguồn:', err);
    return false;
  }
}

// Auto check once when module is loaded in browser
if (typeof window !== 'undefined') {
  checkAndUpdateFromSource(false);
}

// 4.1. Real-time Live Cloud Sync from GitHub & Vercel API
export async function fetchLatestFromGitHub(onUpdated?: () => void): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    let remoteData: any = null;

    // 1. Thử gọi API Serverless Vercel trước (không bị dính cache 5 phút của Fastly CDN trên GitHub Raw)
    try {
      const apiRes = await fetch(`/api/sync-to-github?data=1&t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (apiRes.ok) {
        remoteData = await apiRes.json();
      }
    } catch {
      // Bỏ qua nếu chạy môi trường tĩnh không có Vercel API
    }

    // 2. Dự phòng: Đọc trực tiếp từ GitHub Raw
    if (!remoteData || !Array.isArray(remoteData.products)) {
      const rawUrl = `https://raw.githubusercontent.com/danglio/reecorner/main/src/data/storeData.json?t=${Date.now()}`;
      const res = await fetch(rawUrl);
      if (res.ok) {
        remoteData = await res.json();
      }
    }

    if (!remoteData || !Array.isArray(remoteData.products)) return false;

    const currentVersion = window.localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    const currentUpdatedAt = window.localStorage.getItem(STORAGE_KEYS.DATA_UPDATED_AT);

    // Chỉ cập nhật khi máy khách chưa có dữ liệu hoặc cloud có mốc thời gian mới hơn
    const isNewer =
      !currentVersion ||
      !currentUpdatedAt ||
      (remoteData.lastUpdated && new Date(remoteData.lastUpdated) > new Date(currentUpdatedAt));

    if (isNewer) {
      setStorageItem(STORAGE_KEYS.PRODUCTS, remoteData.products);
      if (Array.isArray(remoteData.orders)) {
        setStorageItem(STORAGE_KEYS.ORDERS, remoteData.orders);
      }
      if (remoteData.settings) {
        setStorageItem(STORAGE_KEYS.SETTINGS, { ...getSettings(), ...remoteData.settings });
      }
      window.localStorage.setItem(STORAGE_KEYS.DATA_VERSION, remoteData.version || `1.0.${Date.now()}`);
      window.localStorage.setItem(STORAGE_KEYS.DATA_UPDATED_AT, remoteData.lastUpdated || new Date().toISOString());
      onUpdated?.();
      return true;
    }
  } catch {
    // Offline or network error
  }
  return false;
}

// 5. Products API
export function getProducts(): Product[] {
  const cached = getStorageItem<Product[]>(STORAGE_KEYS.PRODUCTS);
  if (cached !== null && Array.isArray(cached) && cached.length > 0) {
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
  triggerAutoSync();
  return productToSave;
}

export function deleteProduct(id: string): void {
  const products = getProducts();
  const updatedProducts = products.filter((p) => p.id !== id);
  setStorageItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
  triggerAutoSync();
}

// 6. Orders API
export function getOrders(): Order[] {
  const cached = getStorageItem<Order[]>(STORAGE_KEYS.ORDERS);
  if (cached !== null && Array.isArray(cached)) {
    return cached;
  }
  setStorageItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

export function getOrderById(codeOrId: string): Order | undefined {
  if (!codeOrId) return undefined;
  const clean = codeOrId.trim().toLowerCase();
  const normalized = clean.replace(/[^a-z0-9]/g, '');
  const cleanDigits = clean.replace(/[^0-9]/g, '');
  const orders = getOrders();

  return orders.find((order) => {
    const orderIdLower = order.id.toLowerCase();
    const orderPhone = order.phone.trim();
    const orderPhoneDigits = orderPhone.replace(/[^0-9]/g, '');
    return (
      orderIdLower === clean ||
      orderIdLower.replace(/[^a-z0-9]/g, '') === normalized ||
      orderPhone === clean ||
      (cleanDigits.length >= 9 && orderPhoneDigits === cleanDigits)
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
  triggerAutoSync();
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
  triggerAutoSync();
  return newOrder;
}

// 7. Settings API
export function getSettings(): AppSettings {
  const cached = getStorageItem<AppSettings>(STORAGE_KEYS.SETTINGS);
  if (cached && cached.adminPin) {
    return {
      ...INITIAL_SETTINGS,
      ...cached,
      facebookUrl: cached.facebookUrl || INITIAL_SETTINGS.facebookUrl,
      customTags: cached.customTags || INITIAL_SETTINGS.customTags,
    };
  }
  setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  setStorageItem(STORAGE_KEYS.SETTINGS, settings);
  triggerAutoSync();
}

// 8. Custom Tags Management
export function getCustomTags(): string[] {
  const settings = getSettings();
  if (settings.customTags && Array.isArray(settings.customTags)) {
    return settings.customTags;
  }
  return ['Bảo Bối Agasa', 'Bản Giới Hạn', 'Bán Chạy', 'Mới Nhất', 'SSR', 'UR'];
}

export function saveCustomTags(tags: string[]): void {
  const settings = getSettings();
  settings.customTags = tags;
  saveSettings(settings);
}

export function addCustomTag(newTag: string): string[] {
  const clean = newTag.trim();
  if (!clean) return getCustomTags();
  const current = getCustomTags();
  if (!current.some((t) => t.toLowerCase() === clean.toLowerCase())) {
    const updated = [...current, clean];
    saveCustomTags(updated);
    return updated;
  }
  return current;
}

export function deleteCustomTag(tagToDelete: string, removeFromProducts: boolean = true): string[] {
  const clean = tagToDelete.trim().toLowerCase();
  const current = getCustomTags();
  const updated = current.filter((t) => t.trim().toLowerCase() !== clean);
  saveCustomTags(updated);

  if (removeFromProducts) {
    const products = getProducts();
    let hasChanges = false;
    const updatedProducts = products.map((p) => {
      if (p.rarity && p.rarity.trim().toLowerCase() === clean) {
        hasChanges = true;
        return { ...p, rarity: '' };
      }
      return p;
    });
    if (hasChanges) {
      setStorageItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
      triggerAutoSync();
    }
  }
  return updated;
}

export function clearAllSsrRarityTags(): string[] {
  const gameTags = ['SSR', 'UR', 'DETECTIVE', 'SR', 'R'];
  const current = getCustomTags();
  const updated = current.filter((t) => !gameTags.includes(t.trim().toUpperCase()));
  saveCustomTags(updated);

  const products = getProducts();
  let hasChanges = false;
  const updatedProducts = products.map((p) => {
    if (p.rarity && gameTags.includes(p.rarity.trim().toUpperCase())) {
      hasChanges = true;
      return { ...p, rarity: '' };
    }
    return p;
  });
  if (hasChanges) {
    setStorageItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
    triggerAutoSync();
  }
  return updated;
}

// 9. Reset Storage helper
export function resetStorage(): void {
  setStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  setStorageItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEYS.DATA_VERSION, STORE_DATA_VERSION);
    window.localStorage.setItem(STORAGE_KEYS.DATA_UPDATED_AT, STORE_DATA_LAST_UPDATED);
  }
  triggerAutoSync();
}

// 10. Source Code & Git Sync Engine
export interface SyncStatus {
  isLocalDev: boolean;
  connected: boolean;
  targetFile?: string;
  gitBranch?: string;
  hasGitRemote?: boolean;
  gitRemote?: string;
  lastCommit?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  filePath?: string;
  gitCommitted?: boolean;
  gitPushed?: boolean;
  timestamp?: string;
  isLocalDev?: boolean;
}

export async function checkSyncStatus(): Promise<SyncStatus> {
  try {
    const res = await fetch('/api/sync-source/status', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Ignore fetch error when running static
  }

  // Check Vercel serverless API
  try {
    const vRes = await fetch('/api/sync-to-github', { method: 'GET' });
    if (vRes.ok) {
      const vData = await vRes.json();
      return {
        isLocalDev: false,
        connected: Boolean(vData.configured),
        gitBranch: vData.branch || 'main',
        hasGitRemote: true,
        gitRemote: vData.repo,
      };
    }
  } catch {
    // Ignore
  }

  return {
    isLocalDev: false,
    connected: false,
  };
}

export async function syncToSourceCode(): Promise<SyncResult> {
  const currentProducts = getProducts();
  const currentOrders = getOrders();
  const currentSettings = getSettings();

  const payload = {
    version: `1.0.${Date.now()}`,
    lastUpdated: new Date().toISOString(),
    products: currentProducts,
    orders: currentOrders,
    settings: currentSettings,
  };

  // 1. Try local dev server API (/api/sync-source)
  try {
    const res = await fetch('/api/sync-source', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEYS.DATA_VERSION, payload.version);
        window.localStorage.setItem(STORAGE_KEYS.DATA_UPDATED_AT, payload.lastUpdated);
        window.localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      }
      return {
        ...data,
        isLocalDev: true,
      };
    }
  } catch {
    // Local dev endpoint not available, proceed to Vercel GitHub sync
  }

  // 2. Try Vercel Serverless Function (/api/sync-to-github)
  try {
    const vRes = await fetch('/api/sync-to-github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (vRes.ok) {
      const vData = await vRes.json();
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEYS.DATA_VERSION, payload.version);
        window.localStorage.setItem(STORAGE_KEYS.DATA_UPDATED_AT, payload.lastUpdated);
        window.localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      }
      return {
        success: true,
        message: vData.message || 'Đã lưu và commit trực tiếp lên GitHub! Vercel sẽ tự động build lại.',
        gitCommitted: true,
        gitPushed: true,
        isLocalDev: false,
      };
    } else {
      const vErr = await vRes.json().catch(() => ({}));
      if (vRes.status !== 404 && vErr.message) {
        return {
          success: false,
          message: vErr.message,
          isLocalDev: false,
        };
      }
    }
  } catch {
    // Ignore
  }

  return {
    success: false,
    message:
      'Chưa cấu hình tự động đẩy GitHub trên Vercel. Bạn có thể dùng tính năng "Tải file dữ liệu" hoặc nhập GitHub Token ở tab Mã Nguồn!',
    isLocalDev: false,
  };
}

// Background auto-sync helper
let syncTimeout: any = null;
export function triggerAutoSync(): void {
  if (typeof window === 'undefined') return;
  try {
    const isAutoSyncEnabled = window.localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
    if (isAutoSyncEnabled === 'false') return;

    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(() => {
      syncToSourceCode().catch(() => {});
    }, 600);
  } catch {
    // Ignore
  }
}

// Export / Import Helpers
export function exportStoreDataJSON(): string {
  const data = {
    version: `1.0.${Date.now()}`,
    lastUpdated: new Date().toISOString(),
    products: getProducts(),
    orders: getOrders(),
    settings: getSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importStoreDataJSON(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !Array.isArray(parsed.products)) {
      return { success: false, message: 'Tệp JSON không đúng định dạng dữ liệu cửa hàng (thiếu mảng products)!' };
    }
    setStorageItem(STORAGE_KEYS.PRODUCTS, parsed.products);
    if (Array.isArray(parsed.orders)) {
      setStorageItem(STORAGE_KEYS.ORDERS, parsed.orders);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      setStorageItem(STORAGE_KEYS.SETTINGS, { ...getSettings(), ...parsed.settings });
    }
    if (parsed.version) {
      window.localStorage.setItem(STORAGE_KEYS.DATA_VERSION, parsed.version);
    }
    if (parsed.lastUpdated) {
      window.localStorage.setItem(STORAGE_KEYS.DATA_UPDATED_AT, parsed.lastUpdated);
    }
    triggerAutoSync();
    return { success: true, message: `Nhập thành công ${parsed.products.length} sản phẩm và cấu hình mới!` };
  } catch (err: any) {
    return { success: false, message: `Lỗi đọc file JSON: ${err?.message || 'Không hợp lệ'}` };
  }
}

export function exportStoreDataTypeScript(): string {
  const products = getProducts();
  const orders = getOrders();
  const settings = getSettings();
  return `export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n\nexport const INITIAL_ORDERS: Order[] = ${JSON.stringify(orders, null, 2)};\n\nexport const INITIAL_SETTINGS: AppSettings = ${JSON.stringify(settings, null, 2)};`;
}

// GitHub API Direct Sync for remote deployments (e.g. Vercel)
export interface GitHubSyncConfig {
  token: string;
  repo: string; // e.g. "danglio/conan-order-tracker"
  branch?: string; // default "main"
}

export async function syncToGitHubRepo(config: GitHubSyncConfig): Promise<{ success: boolean; message: string }> {
  try {
    const branch = config.branch || 'main';
    const filePath = 'src/data/storeData.json';
    const cleanRepo = config.repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;

    // 1. Get current file SHA on GitHub
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        Authorization: `token ${config.token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // 2. Prepare payload
    const content = exportStoreDataJSON();
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    const body: any = {
      message: 'chore(data): sync admin updates from web interface to GitHub repository',
      content: encodedContent,
      branch,
    };
    if (sha) {
      body.sha = sha;
    }

    // 3. Put updated file to GitHub repo
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${config.token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (putRes.ok) {
      return {
        success: true,
        message: `Đã đẩy thành công lên kho GitHub ${cleanRepo} (nhánh ${branch})! Vercel sẽ tự động build và deploy bản mới nhất.`,
      };
    } else {
      const errData = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: `GitHub trả về lỗi (${putRes.status}): ${errData.message || 'Token không có quyền hoặc repo không tồn tại'}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi kết nối GitHub API: ${err?.message || 'Không xác định'}`,
    };
  }
}
