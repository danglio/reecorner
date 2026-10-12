# Conan Order Tracker & Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng web bán hàng và tra cứu đơn hàng phong cách Thám Tử Lừng Danh Conan, tái hiện giao diện và tính năng tra cứu đơn của `enne.vn/order-status`, tích hợp BGM nhạc Conan, luồng đặt hàng chuyển Zalo người bán, và Bảng Quản trị bí mật bằng mã PIN.

**Architecture:** Ứng dụng SPA trên nền React 18 + TypeScript + Vite + Tailwind CSS. Dữ liệu (sản phẩm, đơn hàng, cấu hình SĐT Zalo) được quản lý tập trung qua `storage.ts` với LocalStorage và bộ mock data mặc định. Các component phân tách độc lập: Header, WelcomeModal, OrderStatusView, ShopCatalog, CartDrawer, AudioPlayer, AdminPanel.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, HTML5 Audio API.

## Global Constraints

- Tone màu: Xanh Navy Thám tử (`#0B192C`, `#1E3E62`), Đỏ nơ Conan (`#E63946`), Vàng đồng huy hiệu (`#F59E0B`).
- Tái hiện đầy đủ 5 bước trạng thái đơn hàng của `enne.vn/order-status` (Chờ xác nhận -> Đã xác nhận -> Đang xử lý -> Đang giao hàng -> Đã giao hàng / Đã hủy).
- Popup chào mừng có nút "Bỏ qua để xem shop" tự động bật nhạc Conan BGM.
- Mã PIN Admin mặc định là `1412`, cho phép đổi SĐT Zalo, upload ảnh sản phẩm (Base64/URL) và đổi giá tiền.
- Đặt hàng xuất link Zalo chuyển thẳng tới Zalo người bán: `https://zalo.me/<sdt>?text=...`.

---

### Task 1: Khởi tạo Project Vite React TypeScript & Cấu hình Tailwind CSS

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `index.html`, `src/index.css`, `src/main.tsx`

**Interfaces:**
- Produces: Project React + Vite + Tailwind CSS sẵn sàng build và chạy dev server.

- [ ] **Step 1: Khởi tạo package.json và cài đặt các dependencies**
Cài đặt `react`, `react-dom`, `lucide-react`, cùng devDependencies `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`, `@types/react`, `@types/react-dom`.

- [ ] **Step 2: Cấu hình vite.config.ts, tsconfig.json, tailwind.config.js và postcss.config.js**
Thiết lập theme màu Conan (`conan-navy`, `conan-blue`, `conan-red`, `conan-gold`) trong `tailwind.config.js`.

- [ ] **Step 3: Thiết lập index.html và src/index.css**
Font Inter/Outfit, custom scrollbar, hiệu ứng glassmorphism và sound wave animation.

- [ ] **Step 4: Kiểm tra build dự án**
Chạy `npm run build` để kiểm tra project compile không lỗi.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "chore: scaffold Vite React Tailwind project for Conan Shop"
```

---

### Task 2: Dữ liệu & Storage Service (Types, Mock Data, LocalStorage)

**Files:**
- Create: `src/types/index.ts`
- Create: `src/services/storage.ts`

**Interfaces:**
- Produces:
  - Types: `Product`, `Order`, `OrderItem`, `OrderStatus`, `AppSettings`
  - Functions: `getProducts()`, `saveProduct(p)`, `deleteProduct(id)`, `getOrders()`, `getOrderById(code)`, `updateOrderStatus(code, status)`, `getSettings()`, `saveSettings(s)`

- [ ] **Step 1: Định nghĩa Types trong src/types/index.ts**
Các kiểu dữ liệu cho sản phẩm, đơn hàng, chi tiết đơn, và trạng thái 5 bước.

- [ ] **Step 2: Xây dựng service src/services/storage.ts**
Khởi tạo dữ liệu mẫu Conan: 4 sản phẩm thẻ bài/bộ đàm/nơ Conan và 2 đơn hàng mẫu (`CONAN-001`, `KID-1412`), hàm get/set vào LocalStorage.

- [ ] **Step 3: Kiểm tra Storage Service**
Kiểm tra nạp dữ liệu và ghi dữ liệu hoạt động chính xác.

- [ ] **Step 4: Commit**
```bash
git add src/types/index.ts src/services/storage.ts
git commit -m "feat: implement data types and LocalStorage service with Conan mock data"
```

---

### Task 3: BGM Audio Player (Trình Phát Nhạc Nền Conan)

**Files:**
- Create: `src/components/AudioPlayer.tsx`
- Create: `public/audio/conan-theme.mp3` (hoặc Web Audio synthesizer / audio URL chất lượng cao)

**Interfaces:**
- Consumes: User gesture events, auto-play permission.
- Produces: `<AudioPlayer isPlaying={isPlaying} onToggle={togglePlay} />`

- [ ] **Step 1: Tạo component src/components/AudioPlayer.tsx**
Widget nổi góc màn hình hình Huy hiệu Thám tử nhí / Nơ Conan, gồm nút Play/Pause, hoạt ảnh sóng âm (Sound wave bars) khi nhạc đang phát, thanh điều chỉnh âm lượng.

- [ ] **Step 2: Xử lý chính sách Autoplay của trình duyệt**
Lắng nghe tương tác đầu tiên hoặc khi người dùng nhấn "Bỏ qua để xem shop" để khởi chạy âm thanh mượt mà không bị trình duyệt chặn.

- [ ] **Step 3: Commit**
```bash
git add src/components/AudioPlayer.tsx
git commit -m "feat: create Conan BGM audio player component with visualizer"
```

---

### Task 4: Welcome Modal (Popup Chào Mừng & Đặt Hàng Nhanh Zalo)

**Files:**
- Create: `src/components/WelcomeModal.tsx`

**Interfaces:**
- Consumes: `AppSettings` (SĐT Zalo).
- Produces: `<WelcomeModal isOpen={isOpen} onClose={handleClose} onSkip={handleSkip} />`

- [ ] **Step 1: Xây dựng giao diện Popup Chào mừng phong cách Thám tử Mori**
Hiển thị lời chào từ Văn phòng Thám tử Conan, form nhập nhanh Tên, SĐT, Sản phẩm/Ghi chú.

- [ ] **Step 2: Xử lý nút "Gửi đơn qua Zalo"**
Tạo link `https://zalo.me/<sdt>?text=...` với nội dung chào và thông tin đơn hàng, mở tab Zalo.

- [ ] **Step 3: Xử lý nút "Bỏ qua để xem shop"**
Đóng modal, kích hoạt phát nhạc nền Conan và cho phép duyệt toàn bộ website.

- [ ] **Step 4: Commit**
```bash
git add src/components/WelcomeModal.tsx
git commit -m "feat: implement Welcome modal with quick Zalo order and skip to browse"
```

---

### Task 5: Order Status View (Tái Hiện Chuẩn `enne.vn/order-status` Phong Cách Conan)

**Files:**
- Create: `src/components/OrderStatusView.tsx`

**Interfaces:**
- Consumes: `getOrderById(orderCode)` từ `storage.ts`.
- Produces: `<OrderStatusView onSelectOrder={(code) => ...} />`

- [ ] **Step 1: Xây dựng Form Tra Cứu**
Khung tìm kiếm gồm Mã đơn hàng (`Mã đơn hàng *`) và Số điện thoại (tùy chọn), nút "Tra cứu vụ án / đơn hàng", kèm các nút bấm nhanh mã đơn mẫu (`CONAN-001`, `KID-1412`) để người dùng bấm thử nghiệm ngay.

- [ ] **Step 2: Xây dựng Stepper Tiến trình 5 bước**
Chờ xác nhận -> Đã xác nhận -> Đang xử lý -> Đang giao hàng -> Đã giao hàng (với icon, màu sắc và hiệu ứng ánh sáng Conan). Xử lý riêng trường hợp Đã hủy với khung cảnh báo lý do hủy màu đỏ.

- [ ] **Step 3: Xây dựng các thẻ Thông tin nhận hàng, Sản phẩm đã đặt, Thanh toán**
Hiển thị đầy đủ Tên, SĐT, Địa chỉ, Danh sách thẻ bài có hình ảnh, giá tiền, Tạm tính, Phí ship, Tổng cộng chuẩn định dạng VND.

- [ ] **Step 4: Commit**
```bash
git add src/components/OrderStatusView.tsx
git commit -m "feat: build order status tracking view replicating enne.vn with Conan theme"
```

---

### Task 6: Cửa Hàng (Shop Catalog) & Giỏ Hàng (Cart Drawer) Xuất Đơn Zalo

**Files:**
- Create: `src/components/ShopCatalog.tsx`
- Create: `src/components/CartDrawer.tsx`

**Interfaces:**
- Consumes: `getProducts()` từ `storage.ts`.
- Produces: `<ShopCatalog onAddToCart={...} />`, `<CartDrawer items={cart} onCheckoutZalo={...} />`

- [ ] **Step 1: Xây dựng danh mục thẻ bài / vật phẩm ShopCatalog**
Card sản phẩm phong cách kính lúp thám tử, tag độ hiếm (SSR, UR), giá tiền VNĐ, nút "Thêm vào giỏ" và "Mua ngay".

- [ ] **Step 2: Xây dựng CartDrawer**
Khung giỏ hàng trượt sang từ cạnh phải: danh sách món đồ, tăng giảm số lượng, form thông tin khách, nút "Gửi đơn hàng qua Zalo" tạo tin nhắn chi tiết đầy đủ tên các sản phẩm, tổng tiền.

- [ ] **Step 3: Commit**
```bash
git add src/components/ShopCatalog.tsx src/components/CartDrawer.tsx
git commit -m "feat: implement Shop catalog and Cart drawer with Zalo checkout"
```

---

### Task 7: Header & Điều Hướng Website

**Files:**
- Create: `src/components/Header.tsx`

**Interfaces:**
- Produces: `<Header activeTab={activeTab} setActiveTab={setActiveTab} cartCount={cartCount} onOpenCart={...} isPlaying={isPlaying} onToggleAudio={...} onOpenAdmin={...} />`

- [ ] **Step 1: Xây dựng thanh Header**
Logo *MOURI DETECTIVE AGENCY x CONAN COLLECTION* với icon nơ đỏ và kính lúp, tab chuyển đổi giữa Cửa Hàng và Tra Cứu Đơn.

- [ ] **Step 2: Tích hợp nút Giỏ hàng (badge số lượng), Nút BGM và Nút Admin bí mật**
Nút Admin với icon ổ khóa / kính lúp thám tử góc phải.

- [ ] **Step 3: Commit**
```bash
git add src/components/Header.tsx
git commit -m "feat: build header navigation with audio toggle and admin trigger"
```

---

### Task 8: Bảng Quản Trị Bí Mật (Admin Dashboard)

**Files:**
- Create: `src/components/AdminPanel.tsx`

**Interfaces:**
- Consumes: `storage.ts` CRUD functions.
- Produces: `<AdminPanel isOpen={isOpen} onClose={...} onDataChanged={...} />`

- [ ] **Step 1: Màn hình nhập mã PIN bảo mật**
Bàn phím nhập mã PIN bảo mật (mặc định: `1412`), hiển thị thông báo lỗi nếu nhập sai.

- [ ] **Step 2: Tab Quản lý sản phẩm (Product CRUD)**
Form thêm sản phẩm: Tên, Mô tả, Giá tiền, Tải ảnh từ máy tính (đọc FileReader sang Base64) hoặc paste URL ảnh. Bảng danh sách sản phẩm với nút Sửa giá / Xóa.

- [ ] **Step 3: Tab Cấu hình Zalo**
Ô nhập SĐT Zalo người bán để cập nhật `conan_settings`, bấm Lưu áp dụng ngay toàn web.

- [ ] **Step 4: Tab Quản lý đơn hàng**
Danh sách các đơn hàng (`CONAN-001`, `KID-1412`...), dropdown thay đổi trạng thái đơn (Chờ xác nhận -> Đã xác nhận -> Đang xử lý -> Đang giao -> Đã giao -> Hủy).

- [ ] **Step 5: Commit**
```bash
git add src/components/AdminPanel.tsx
git commit -m "feat: implement Admin dashboard with PIN auth, product CRUD, and Zalo settings"
```

---

### Task 9: Tích Hợp Toàn Bộ Hệ Thống & Kiểm Thử Tổng Thể (Integration & E2E)

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Kết nối tất cả các component: Header, WelcomeModal, OrderStatusView, ShopCatalog, CartDrawer, AudioPlayer, AdminPanel.

- [ ] **Step 1: Hoàn thiện App.tsx**
Quản lý state trung tâm (`activeTab`, `cart`, `audioPlaying`, `isWelcomeOpen`, `isAdminOpen`, `products`, `orders`).

- [ ] **Step 2: Chạy kiểm tra build (`npm run build`)**
Xác nhận TypeScript và Vite build thành công không có bất kỳ lỗi cú pháp hoặc typing nào.

- [ ] **Step 3: Chạy máy chủ phát triển (`npm run dev`) và nghiệm thu**
Kiểm tra:
1. Mới vào: Hiện popup chào mừng -> bấm "Bỏ qua" -> popup đóng và nhạc Conan bắt đầu phát.
2. Tra cứu đơn: Nhập `CONAN-001` -> hiển thị kết quả chuẩn giao diện `enne.vn` với stepper 5 bước.
3. Thêm giỏ hàng & Đặt hàng Zalo: Tạo đơn thành công, mở link Zalo.
4. Quản trị viên: Bấm icon Admin bí mật -> nhập mã PIN `1412` -> đổi giá sản phẩm hoặc đổi trạng thái đơn `CONAN-001` -> trang khách hàng cập nhật tức thì.

- [ ] **Step 4: Commit**
```bash
git add src/App.tsx
git commit -m "feat: complete Conan shop & order tracking application integration"
```
