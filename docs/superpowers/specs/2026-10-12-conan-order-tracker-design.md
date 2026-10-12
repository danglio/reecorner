# Thiết Kế Chi Tiết: Ứng Dụng Web Bán Hàng & Tra Cứu Đơn Hàng Phong Cách Conan (Conan Order Tracker & Shop)

**Ngày tạo:** 12-10-2026  
**Chủ đề:** Tái hiện trang tra cứu đơn hàng `enne.vn/order-status` kết hợp Cửa hàng thẻ bài, nhạc nền Conan BGM, luồng đặt hàng Zalo và Bảng quản trị bí mật.

---

## 1. Mục Tiêu & Bối Cảnh (Context & Goals)

- **Mục tiêu chính:** 
  1. Tái hiện trung thực bố cục và chức năng trang tra cứu đơn hàng của `enne.vn/order-status`.
  2. Mang phong cách nhận diện đặc trưng của bộ truyện **Thám Tử Lừng Danh Conan** (Detective Conan): màu xanh navy thám tử, viền đỏ chiếc nơ biến đổi giọng nói, kính lúp, huy hiệu thám tử nhí Mori.
  3. Tích hợp nhạc nền Conan BGM tự động phát mượt mà kèm trình phát nhạc nổi (floating audio player).
  4. Popup chào mừng: Cho phép khách nhập thông tin mua hàng nhanh chuyển thẳng link Zalo người bán, hoặc chọn *"Bỏ qua để xem shop"*.
  5. Bảng Quản trị bí mật (Admin Panel) bảo vệ bằng mã PIN: Cho phép chủ shop cấu hình số điện thoại Zalo, đăng thêm hình ảnh sản phẩm (upload từ máy tính/điện thoại hoặc link ảnh), chỉnh sửa giá tiền, và cập nhật trạng thái đơn hàng.
  6. Lưu trữ dữ liệu: Sử dụng `localStorage` của trình duyệt để lưu bền vững và chạy demo tức thì, kèm sẵn bộ dữ liệu mẫu (mock data) phong phú.

---

## 2. Công Nghệ & Kiến Trúc (Tech Stack & Architecture)

- **Frontend Core:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons (lucide-react) + Glassmorphism hiệu ứng mờ cao cấp
- **Âm thanh:** HTML5 Audio API (Detective Conan Theme Song / Saxophone BGM) được tối ưu hóa chống block autoplay
- **Lưu trữ dữ liệu:** LocalStorage service quản lý 3 bảng:
  - `conan_products`: Danh sách sản phẩm thẻ bài / vật phẩm.
  - `conan_orders`: Danh sách đơn hàng phục vụ tra cứu.
  - `conan_settings`: Cài đặt hệ thống (Số điện thoại Zalo, Mã PIN quản trị).

---

## 3. Hệ Thống Thiết Kế Chủ Đề Conan (Visual Design System)

- **Màu sắc chủ đạo:**
  - `Primary Navy`: `#0B192C` (Navy đêm Tokyo), `#1E3E62` (Xanh thám tử)
  - `Accent Crimson`: `#E63946`, `#D90429` (Đỏ nơ biến đổi giọng nói Conan)
  - `Detective Gold`: `#F59E0B`, `#FBBF24` (Kính lúp, huy hiệu thám tử)
  - `Background`: Gradient chuyển từ Slate 900 sang Navy sâu, kết hợp hiệu ứng card viền sáng phản quang nhẹ.
- **Font & Iconography:**
  - Sans-serif hiện đại, nét chữ sắc sảo, icon kính lúp, huy hiệu thám tử, giỏ hàng, thẻ bài.

---

## 4. Chi Tiết Các Phân Hệ & Component (Component Specifications)

### 4.1. Header & Điều Hướng (Detective Navigation)
- Logo: *MOURI AGENCY x CONAN SHOP* kèm biểu tượng kính lúp và chiếc nơ đỏ.
- Menu điều hướng:
  - **Cửa hàng (Shop):** Xem danh mục thẻ bài / vật phẩm Conan.
  - **Tra cứu đơn (Order Status):** Trang tra cứu tiến độ đơn hàng y chang `enne.vn`.
- Các nút tương tác nhanh:
  - **Nút BGM Audio:** Huy hiệu thám tử nhí nhấp nháy theo điệu nhạc, click để Bật/Tắt âm thanh.
  - **Giỏ hàng (Cart):** Hiển thị số lượng hàng đã chọn, click mở Drawer giỏ hàng.
  - **Nút Admin bí mật:** Biểu tượng ổ khóa / kính lúp bảo mật ở góc thanh điều hướng, nhập PIN để mở Bảng Quản trị.

### 4.2. Popup Chào Mừng (Welcome Modal)
- Tự động hiển thị khi người dùng lần đầu truy cập trang.
- Nội dung:
  - Chào mừng quý khách đến với Văn phòng Thám tử Conan.
  - Form đặt hàng nhanh: Họ tên, Số điện thoại, Địa chỉ, Sản phẩm/Lời nhắn.
  - Nút **"Gửi đơn qua Zalo"**: Tự động mở link `https://zalo.me/<sdt>?text=...` với nội dung đơn hàng được định dạng sẵn.
  - Nút **"Bỏ qua để xem shop"**: Đóng popup, mở khóa tương tác và kích hoạt ngay nhạc nền Conan BGM.

### 4.3. Phân Hệ Tra Cứu Đơn Hàng (Order Status View - Chuẩn `enne.vn`)
- Tái hiện chính xác cấu trúc của `enne.vn/order-status`:
  - **Khung tìm kiếm:**
    - Input 1: Mã đơn hàng (Ví dụ: `CONAN-001`, `KID-1412`).
    - Input 2: Số điện thoại (tùy chọn để xác thực).
    - Nút Tra cứu: Hiệu ứng radar / kính lúp xoay tìm kiếm.
  - **Kết quả tra cứu:**
    - **Header đơn:** Mã đơn `#CONAN-001`, Ngày đặt, Badge trạng thái có màu tương ứng.
    - **Tiến trình 5 bước (Stepper Timeline):**
      1. Chờ xác nhận (pending)
      2. Đã xác nhận (confirmed)
      3. Đang xử lý (processing)
      4. Đang giao hàng (shipping)
      5. Đã giao hàng (delivered)
      *(Trường hợp Đã hủy: Banner đỏ hiển thị lý do hủy)*
    - **Thông tin nhận hàng:** Tên người nhận, Số điện thoại, Địa chỉ nhận hàng, Ghi chú.
    - **Sản phẩm đã đặt:** Bảng danh sách sản phẩm gồm hình ảnh, tên sản phẩm, số lượng, đơn giá, thành tiền.
    - **Tổng kết thanh toán:** Tạm tính, Phí vận chuyển, Giảm giá, Tổng cộng (định dạng VNĐ).

### 4.4. Cửa Hàng & Giỏ Hàng (Shop & Cart Drawer)
- Danh mục sản phẩm thẻ bài Conan:
  - Ảnh đại diện chất lượng cao, tên thẻ, giá bán VNĐ, huy hiệu độ hiếm (SSR, UR, Detective Badge).
  - Nút "Thêm vào giỏ" và "Mua ngay qua Zalo".
- Giỏ hàng (Cart Drawer) trượt từ cạnh phải:
  - Danh sách sản phẩm đã chọn, điều chỉnh số lượng (+/-), xóa sản phẩm.
  - Nút "Xác nhận đặt hàng qua Zalo": Tự động xuất thông tin giỏ hàng và mở link Zalo người bán.

### 4.5. Trình Phát Nhạc Nền (Conan BGM Player)
- Nạp sẵn giai điệu Conan kinh điển.
- Cơ chế Autoplay: Tuân thủ chính sách trình duyệt (kích hoạt sau tương tác đầu tiên của khách hoặc nút "Bỏ qua").
- Trình phát nổi (Floating Widget): Nằm ở góc dưới bên trái, gồm:
  - Nút Play/Pause.
  - Hoạt ảnh sóng âm (Sound wave bar animation).
  - Thanh chỉnh âm lượng (Volume slider).

### 4.6. Bảng Quản Trị Bí Mật (Admin Dashboard)
- Bảo mật bằng mã PIN: Mặc định `1412` (mã Siêu đạo chích Kid, có thể đổi trong cài đặt).
- Tab 1: **Quản lý sản phẩm (Product Management)**
  - Thêm sản phẩm mới: Tên, giá tiền, mô tả, ảnh (cho phép chọn file ảnh từ máy chuyển thành Base64 hoặc paste link ảnh trực tiếp).
  - Sửa thông tin sản phẩm: Thay đổi giá tiền, cập nhật ảnh, đổi tên.
  - Xóa sản phẩm.
- Tab 2: **Cấu hình Zalo (Zalo Settings)**
  - Cập nhật số điện thoại Zalo người bán để toàn bộ link đặt hàng trên web tự động gửi tới số này.
- Tab 3: **Quản lý đơn hàng (Order Management)**
  - Xem danh sách đơn hàng đã tạo.
  - Cập nhật trạng thái đơn (Chờ xác nhận -> Đã xác nhận -> Đang xử lý -> Đang giao -> Đã giao / Hủy).
  - Thêm đơn hàng mới để khách tra cứu.

---

## 5. Dữ Liệu Mẫu Mặc Định (Default Mock Data)

1. **Sản phẩm mẫu:**
   - Hộp Thẻ Bài Conan Cao Cấp - Vụ Án Thế Kỷ (SSR) - Giá: 350.000đ
   - Thẻ Hologram Giới Hạn: Conan & Siêu Đạo Chích Kid (UR) - Giá: 180.000đ
   - Huy Hiệu Đội Thám Tử Nhí Tích Hợp Bộ Đàm - Giá: 120.000đ
   - Nơ Biến Đổi Giọng Nói Mori Kogoro Special Edition - Giá: 250.000đ
2. **Đơn hàng mẫu:**
   - Mã `CONAN-001` (SĐT `0901234567`): Trạng thái "Đang giao hàng", 2 sản phẩm, tổng 530.000đ.
   - Mã `KID-1412` (SĐT `0988888888`): Trạng thái "Đã giao hàng", 1 sản phẩm thẻ Hologram Kid, tổng 180.000đ.
3. **Cấu hình mặc định:**
   - Mã PIN Admin: `1412`
   - Số Zalo người bán mặc định: `0901234567` (có thể sửa ngay trong Admin).

---

## 6. Kế Hoạch Kiểm Thử & Nghiệm Thu (Verification Plan)
1. **Kiểm tra giao diện:** Bố cục và các trường tra cứu đơn hàng giống hệt `enne.vn/order-status` kèm thiết kế Conan cao cấp.
2. **Kiểm tra âm nhạc:** Nhạc BGM phát êm tai, bật tắt mượt mà, không giật lag.
3. **Kiểm tra luồng Zalo:** Nhập thông tin đơn hàng -> link Zalo mở chuẩn với nội dung chi tiết.
4. **Kiểm tra Admin:** Đăng nhập PIN `1412` thành công, thêm ảnh từ máy, sửa giá tiền -> giao diện Shop cập nhật ngay tức thì.
