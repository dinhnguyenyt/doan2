# Hướng Dẫn Nâng Cấp Hệ Thống (Phát triển dự án)

Tài liệu này đóng vai trò như bản đồ lộ trình (roadmap) để nâng cấp dự án từ cấu trúc sơ khai hiện tại lên một hệ thống chuyên nghiệp, linh hoạt và đáp ứng được nhiều yêu cầu thực tế hơn, dựa trên thiết kế DBML đã có.

Dự án nên được nâng cấp theo từng giai đoạn (Phase) để đảm bảo không phá vỡ logic cũ và dễ dàng kiểm tra (test) từng tính năng.

---

## Giai đoạn 1 (Phase 1): Xây dựng Nền tảng (Users & Roles)
Đây là bước cốt lõi. Cần quản lý được "Ai" đang tương tác với hệ thống trước khi làm nghiệp vụ.

**1. Database & Models (Server):**
- **Cập nhật `ModelUser`**: Tách thuộc tính `isAdmin` thành `role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' }`.
- Thêm trường `created_at` (nếu chưa có).
- Chạy một script (hoặc viết logic) để chuyển các tài khoản đang có `isAdmin: true` thành `role: 'admin'`.

**2. API Backend:**
- Cập nhật Middleware kiểm tra quyền lực: Tạo Middleware `requireRole(['admin', 'staff'])` thay vì chỉ check thư mục `isAdmin`.
- Xây dựng cụm API `/api/admin/users`: 
  - `GET`: Lấy danh sách toàn bộ User.
  - `PUT`: Cập nhật Role cho một user xác định.
  - `DELETE`: Xóa tài khoản (Hoặc chuyển status thành "inactive" thay vì xóa cứng).

**3. Frontend (Client):**
- Thêm menu `User Management` vào Sidebar của Admin.
- Xây dựng component `UserManagement.js`: Hiển thị danh sách dạng bảng, có `Dropdown` để đổi quyền, có nút xóa.
- Cập nhật luồng Login của Redux / Context để lưu và phân loại `role` (điều hướng Admin/Staff đi đâu, User đi đâu).

---

## Giai đoạn 2 (Phase 2): Cấu trúc Sản Phẩm & Kho Hàng (Categories & Inventory)
Sản phẩm phải có phân loại và số lượng tồn kho để hạn chế bán lố hàng.

**1. Database & Models:**
- **Tạo `ModelCategory`**: `_id, name, description_cate`.
- **Cập nhật `ModelProduct`**: Thêm `category_id` (tham chiếu đến `ModelCategory`) và trường `stock_quantity: { type: Number, default: 0 }`.

**2. API Backend:**
- API Categories CRUD (Thêm, Sửa, Xóa, Đọc danh sách danh mục).
- Chỉnh sửa API tạo Product: bắt buộc truyền `category_id` và `stock_quantity`.
- Chỉnh sửa API Get Product: dùng `.populate('category_id')` để lấy tên danh mục.

**3. Frontend:**
- Trình quản lý Admin: 
  - Màn hình hiển thị và quản lý Danh mục (Category Management).
  - Màn hình Quản lý Sản phẩm cần thêm cột Số lượng tồn kho và Dropdown chọn Danh mục khi thêm mới/sửa.
- Web Client: Trang chủ có thêm Navigation/Filter phân loại sản phẩm theo danh mục (Điện thoại, Laptop, v.v.).

---

## Giai đoạn 3 (Phase 3): Đơn hàng & Lịch sử giá (Orders & Order Items)
Cải tiến giỏ hàng và thanh toán nhằm tính toán chính xác, lưu được lịch sử giá lúc mua thay vì phụ thuộc giá sản phẩm hiện tại.

**1. Database & Models:**
- **Tạo `ModelOrder`**: Gồm thông tin User, Tổng tiền (`sum_price`), Trạng thái (`status_order`: pending/shipping/completed/cancelled), Hình thức thanh toán (`payment_method`), `created_at`.
- **Tạo `ModelOrderItem`**: Chứa `order_id` (trỏ tới `ModelOrder`), `product_id`, `product_name`, `quantity`, `price` (giá sản phẩm tại lúc đặt hàng).

**2. API Backend:**
- Khi user thực hiện Checkout (Thanh toán):
  - Bước 1: Tạo `ModelOrder`.
  - Bước 2: Tạo nhiều `ModelOrderItem` tương ứng với các sản phẩm trong giỏ hàng.
  - Bước 3: Lặp qua từng sản phẩm, trừ đi số lượng `stock_quantity` trong bảng `ModelProduct`. (Nên dùng logic Transactions/Session để tránh lỗi nửa chừng).
- API cập nhật trạng thái đơn (Dành cho Admin/Staff).

**3. Frontend:**
- Màn hình người dùng: Xem lịch sử đơn hàng chi tiết từng món.
- Màn hình Quản trị viên (Order Management): Có nút thay đổi trạng thái vận chuyển.

---

## Giai đoạn 4 (Phase 4): Khuyến Mãi & Mã Giảm Giá (Coupons)

**1. Database & Models:**
- **Tạo `ModelCoupon`**: `code` (Unique), `discount_percent` (hoặc tiền mặt), `expiry_date`, `usage_limit`.

**2. API Backend:**
- API tạo Coupon (Admin).
- API `POST /api/check-coupon`: Nhận mã `code` từ user, kiểm tra xem còn hạn và còn số lượng nhập không, trả về mức giảm giá.
- Khi tạo Order, cập nhật Logic: Nếu có coupon hợp lệ -> trừ tiền -> giảm `usage_limit` của Coupon xuống 1.

**3. Frontend:**
- Trang giỏ hàng (Cart): Có thêm input nhập "Mã Giảm Giá", ấn Áp dụng để tính lại tổng tiền.
- Form quản lý Admin: Nơi tạo và xem các chiến dịch giảm giá.

---

## Giai đoạn 5 (Phase 5): Tương tác người dùng (Blogs & Comments)

**1. Database & Models:**
- **Cập nhật `ModelComment`**: Xóa lưu trữ `username` dưới dạng text cứng, thay bằng tham chiếu `user_id` -> ModelUser. Thêm trường `blog_id` để dùng chung bảng Comment cho tin tức.

**2. API Backend:**
- Đổ dử liệu `GET /comments?product_id=...` sử dụng `.populate('user_id', 'fullname avatar')` để luôn lấy tên/ảnh đại diện mới nhất của User.

**3. Frontend:**
- Hiển thị nhận xét dưới dạng List, load Avatar từ Auth nếu user đó đang login.
- Quản trị viên: Có một Dashboard kiểm duyệt xem ai vừa bình luận gì, xóa bình luận rác.

---

### Các Quy tắc Vàng khi Nâng Cấp:
1. **Làm đến đâu Test đến đó**: Sử dụng Postman để test API Backend trước khi móc dữ liệu lên Frontend.
2. **Không khóa logic cũ ngay lập tức (Backward Compatibility)**: Khi thêm trường mới (vd `stock_quantity`), cứ tạo default = 0. Không xóa các biến cũ như mảng sản phẩm trong file Order cũ ngay, mà cứ cho chạy song song trong 1 khoảng thời gian Migration.
3. **Backup Database liên tục**: Trích xuất bản saoưu của MongoDB MongoDB (Export `mongodump`) trước khi thực hiện các thay đổi lớn về luồng `Schema`.
