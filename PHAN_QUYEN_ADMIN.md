# Tài liệu Phân Quyền Admin (RBAC)

> **Dành cho Frontend:** Dựa vào `role` giải mã từ JWT token để ẩn/hiện menu và chức năng tương ứng.

---

## 1. Các Nhóm Người Dùng (Roles)

| Role | Tên hiển thị | Mô tả |
|------|-------------|-------|
| `admin` | Quản trị viên | Toàn quyền hệ thống, quản lý người dùng và phân quyền |
| `manager` | Quản lý | Quản lý vận hành: đơn hàng, sản phẩm, danh mục, mã giảm giá, blog |
| `staff` | Nhân viên | Xử lý đơn hàng, quản lý blog & bình luận, xem sản phẩm |
| `user` | Người dùng | Không có quyền vào trang admin |

> **Lưu ý:** Hiện tại server chỉ có 3 role: `admin`, `staff`, `user`.  
> Cần **thêm `manager`** vào enum của `ModelUser.js` để dùng đầy đủ.

---

## 2. Nhóm Quyền (Permissions) Theo Module

### 2.1 Dashboard

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem thống kê tổng quan | ✅ | ✅ | ✅ |
| Xem doanh thu & biểu đồ | ✅ | ✅ | ❌ |
| Xem số lượng người dùng | ✅ | ✅ | ❌ |

---

### 2.2 Đơn Hàng (Orders)

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem danh sách đơn hàng | ✅ | ✅ | ✅ |
| Xem chi tiết đơn hàng | ✅ | ✅ | ✅ |
| Cập nhật trạng thái đơn | ✅ | ✅ | ✅ |
| Xóa đơn hàng | ✅ | ❌ | ❌ |

---

### 2.3 Sản Phẩm (Products)

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem danh sách sản phẩm | ✅ | ✅ | ✅ |
| Thêm sản phẩm mới | ✅ | ✅ | ❌ |
| Chỉnh sửa sản phẩm | ✅ | ✅ | ❌ |
| Xóa sản phẩm | ✅ | ❌ | ❌ |
| Quản lý biến thể (variants) | ✅ | ✅ | ❌ |

---

### 2.4 Danh Mục (Categories)

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem danh mục | ✅ | ✅ | ✅ |
| Thêm danh mục | ✅ | ✅ | ❌ |
| Chỉnh sửa danh mục | ✅ | ✅ | ❌ |
| Xóa danh mục | ✅ | ❌ | ❌ |

---

### 2.5 Mã Giảm Giá (Coupons)

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem danh sách mã | ✅ | ✅ | ❌ |
| Thêm mã giảm giá | ✅ | ✅ | ❌ |
| Chỉnh sửa mã giảm giá | ✅ | ✅ | ❌ |
| Xóa mã giảm giá | ✅ | ❌ | ❌ |

---

### 2.6 Khách Hàng / Người Dùng (Customers)

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem danh sách người dùng | ✅ | ✅ | ❌ |
| Xem chi tiết người dùng | ✅ | ✅ | ❌ |
| Chỉnh sửa thông tin người dùng | ✅ | ❌ | ❌ |
| Xóa người dùng | ✅ | ❌ | ❌ |
| **Phân quyền (đổi role)** | ✅ | ❌ | ❌ |

---

### 2.7 Blog

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem danh sách bài viết | ✅ | ✅ | ✅ |
| Thêm bài viết | ✅ | ✅ | ✅ |
| Chỉnh sửa bài viết | ✅ | ✅ | ✅ |
| Xóa bài viết | ✅ | ✅ | ❌ |

---

### 2.8 Bình Luận (Comments)

| Quyền | admin | manager | staff |
|-------|:-----:|:-------:|:-----:|
| Xem bình luận | ✅ | ✅ | ✅ |
| Xóa bình luận | ✅ | ✅ | ✅ |

---

## 3. Menu Hiển Thị Theo Role

```
Menu Item       │ admin │ manager │ staff
────────────────┼───────┼─────────┼───────
Dashboard       │  ✅   │   ✅   │  ✅
Đơn hàng        │  ✅   │   ✅   │  ✅
Sản phẩm        │  ✅   │   ✅   │  ✅ (chỉ xem)
Danh mục        │  ✅   │   ✅   │  ✅ (chỉ xem)
Mã giảm giá     │  ✅   │   ✅   │  ❌
Khách hàng      │  ✅   │   ✅   │  ❌
Blog            │  ✅   │   ✅   │  ✅
Bình luận       │  ✅   │   ✅   │  ✅
```

---

## 4. Hướng Dẫn Triển Khai Frontend

### 4.1 Lấy role từ token

```javascript
// client/src/utils/auth.js
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export function getCurrentRole() {
  const token = Cookies.get('token'); // hoặc tên cookie bạn đang dùng
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role || (decoded.admin ? 'admin' : 'user');
  } catch {
    return null;
  }
}
```

### 4.2 Định nghĩa cấu hình menu theo role

```javascript
// client/src/config/menuPermissions.js

export const MENU_PERMISSIONS = {
  dash:     ['admin', 'manager', 'staff'],
  order:    ['admin', 'manager', 'staff'],
  product:  ['admin', 'manager', 'staff'],
  category: ['admin', 'manager', 'staff'],
  coupon:   ['admin', 'manager'],
  customer: ['admin', 'manager'],
  blog:     ['admin', 'manager', 'staff'],
  comment:  ['admin', 'manager', 'staff'],
};

export function canAccessMenu(menuKey, role) {
  return MENU_PERMISSIONS[menuKey]?.includes(role) ?? false;
}
```

### 4.3 Định nghĩa quyền hành động theo role

```javascript
// client/src/config/actionPermissions.js

export const ACTION_PERMISSIONS = {
  // Orders
  'order:delete':           ['admin'],
  'order:edit':             ['admin', 'manager', 'staff'],

  // Products
  'product:create':         ['admin', 'manager'],
  'product:edit':           ['admin', 'manager'],
  'product:delete':         ['admin'],

  // Categories
  'category:create':        ['admin', 'manager'],
  'category:edit':          ['admin', 'manager'],
  'category:delete':        ['admin'],

  // Coupons
  'coupon:create':          ['admin', 'manager'],
  'coupon:edit':            ['admin', 'manager'],
  'coupon:delete':          ['admin'],

  // Customers
  'customer:edit':          ['admin'],
  'customer:delete':        ['admin'],
  'customer:change_role':   ['admin'],

  // Blog
  'blog:create':            ['admin', 'manager', 'staff'],
  'blog:edit':              ['admin', 'manager', 'staff'],
  'blog:delete':            ['admin', 'manager'],

  // Comments
  'comment:delete':         ['admin', 'manager', 'staff'],
};

export function canDo(action, role) {
  return ACTION_PERMISSIONS[action]?.includes(role) ?? false;
}
```

### 4.4 Sử dụng trong component Sidebar

```jsx
// SlideBar.js
import { canAccessMenu } from '../../../../config/menuPermissions';
import { getCurrentRole } from '../../../../utils/auth';

const role = getCurrentRole();

const menuItems = [
  { key: 'dash',     label: 'Dashboard',     icon: <DashIcon /> },
  { key: 'order',    label: 'Đơn hàng',       icon: <OrderIcon /> },
  { key: 'product',  label: 'Sản phẩm',       icon: <ProductIcon /> },
  { key: 'category', label: 'Danh mục',       icon: <CategoryIcon /> },
  { key: 'coupon',   label: 'Mã giảm giá',    icon: <CouponIcon /> },
  { key: 'customer', label: 'Khách hàng',     icon: <CustomerIcon /> },
  { key: 'blog',     label: 'Blog',           icon: <BlogIcon /> },
  { key: 'comment',  label: 'Bình luận',      icon: <CommentIcon /> },
];

// Lọc menu theo role
const allowedMenu = menuItems.filter(item => canAccessMenu(item.key, role));
```

### 4.5 Sử dụng trong component để ẩn/hiện nút

```jsx
// Ví dụ trong Products.js
import { canDo } from '../../../../config/actionPermissions';
import { getCurrentRole } from '../../../../utils/auth';

const role = getCurrentRole();

// Ẩn nút Thêm nếu không có quyền
{canDo('product:create', role) && (
  <button onClick={handleAdd}>Thêm sản phẩm</button>
)}

// Ẩn nút Xóa nếu không có quyền
{canDo('product:delete', role) && (
  <button onClick={handleDelete}>Xóa</button>
)}
```

---

## 5. Thay Đổi Cần Thực Hiện

### 5.1 Server (Backend)

| File | Thay đổi |
|------|---------|
| `server/src/model/ModelUser.js` | Thêm `'manager'` vào enum của field `role` |
| `server/src/route/AdminRoutes.js` | Áp dụng middleware `verifyRole([...])` cho từng route tương ứng |
| `server/src/controller/jwt/ControllerJWT.js` | Đã có sẵn `verifyRole()` — chỉ cần gắn vào route |

### 5.2 Client (Frontend)

| File | Thay đổi |
|------|---------|
| `client/src/config/menuPermissions.js` | **Tạo mới** — cấu hình menu theo role |
| `client/src/config/actionPermissions.js` | **Tạo mới** — cấu hình hành động theo role |
| `client/src/utils/auth.js` | **Tạo mới** — helper lấy role từ token |
| `client/src/Pages/Admin/Layouts/SlideBar/SlideBar.js` | Lọc menu theo role |
| `client/src/Pages/Admin/.../Products.js` | Ẩn nút Thêm/Sửa/Xóa theo role |
| `client/src/Pages/Admin/.../Categories.js` | Ẩn nút Thêm/Sửa/Xóa theo role |
| `client/src/Pages/Admin/.../Coupons.js` | Ẩn toàn bộ với `staff` |
| `client/src/Pages/Admin/.../Customers.js` | Ẩn nút Sửa/Xóa/Đổi role với `manager` |
| `client/src/Pages/Admin/.../Blog.js` | Ẩn nút Xóa với `staff` |

---

## 6. Ví Dụ Giao Diện Theo Role

### Admin — thấy tất cả
```
[Dashboard] [Đơn hàng] [Sản phẩm] [Danh mục] [Mã giảm giá] [Khách hàng] [Blog] [Bình luận]
Tất cả nút: Thêm | Sửa | Xóa | Đổi quyền
```

### Manager — không quản lý người dùng sâu, không xóa tùy tiện
```
[Dashboard] [Đơn hàng] [Sản phẩm] [Danh mục] [Mã giảm giá] [Khách hàng] [Blog] [Bình luận]
Nút hiển thị: Thêm | Sửa (không có Xóa sản phẩm/danh mục/mã, không đổi quyền user)
```

### Staff — chỉ vận hành hàng ngày
```
[Dashboard] [Đơn hàng] [Sản phẩm*] [Danh mục*] [Blog] [Bình luận]
* chỉ xem, không có nút Thêm/Sửa/Xóa
Nút hiển thị: Cập nhật trạng thái đơn | Thêm/Sửa blog | Xóa bình luận
```
