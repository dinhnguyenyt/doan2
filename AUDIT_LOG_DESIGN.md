# Thiết kế: Hệ thống Lịch sử Tác động (Audit Log)

> **Trạng thái:** Đề xuất — chờ review  
> **Ngày:** 2026-05-12

---

## 1. Tổng quan

Hệ thống ghi lại **mọi hành động làm thay đổi dữ liệu** trong database, bao gồm:
- **Tác nhân (Actor):** Ai thực hiện (email + role)
- **Hành động (Action):** Loại thao tác và đối tượng bị tác động
- **Dữ liệu trước (Before):** Snapshot trước khi thay đổi
- **Dữ liệu sau (After):** Snapshot sau khi thay đổi

Hệ thống gồm **2 collection** phối hợp:
- `actions` — danh mục các loại hành động (lookup table, thêm trực tiếp vào DB khi cần)
- `audit_logs` — bản ghi từng lần tác động thực tế

---

## 2. Collection: `actions` (Lookup Table)

> Lưu danh mục các loại hành động. BE lấy từ bảng này ra khi cần.  
> Khi thêm action mới → **insert thẳng vào DB**, không cần thay đổi code.

### 2.1 Schema — `ModelAction.js`

```js
{
  _id:         ObjectId,   // auto
  code:        String,     // unique — mã định danh, vd: "PRODUCT_CREATE"
  label:       String,     // tên hiển thị tiếng Việt, vd: "Thêm sản phẩm mới"
  target_type: String,     // collection bị tác động: User|Product|Order|...
  action_type: String,     // enum: CREATE | UPDATE | DELETE
  description: String,     // mô tả chi tiết hành động
  is_active:   Boolean,    // default: true — false để vô hiệu hoá không dùng nữa
  created_at:  Date        // default: Date.now
}
```

**Index:** `{ code: 1 }` unique

---

### 2.2 Dữ liệu seed — toàn bộ actions cần insert vào DB

```js
// ── USER ────────────────────────────────────────────────────────────────────
{ code: "USER_REGISTER",      label: "Đăng ký tài khoản",           target_type: "User",       action_type: "CREATE", description: "User tự đăng ký tài khoản mới",                           is_active: true }
{ code: "USER_CREATE",        label: "Tạo tài khoản (admin)",        target_type: "User",       action_type: "CREATE", description: "Admin/manager tạo tài khoản người dùng",                  is_active: true }
{ code: "USER_UPDATE",        label: "Cập nhật thông tin tài khoản", target_type: "User",       action_type: "UPDATE", description: "Chỉnh sửa thông tin cá nhân (fullname, phone, avatar...)", is_active: true }
{ code: "USER_UPDATE_ROLE",   label: "Thay đổi phân quyền",          target_type: "User",       action_type: "UPDATE", description: "Thay đổi role của người dùng",                            is_active: true }
{ code: "USER_CHANGE_PASS",   label: "Đổi mật khẩu",                 target_type: "User",       action_type: "UPDATE", description: "Thay đổi mật khẩu (không lưu giá trị hash)",              is_active: true }
{ code: "USER_DELETE",        label: "Xoá tài khoản",                target_type: "User",       action_type: "DELETE", description: "Xoá tài khoản người dùng khỏi hệ thống",                  is_active: true }

// ── PRODUCT ─────────────────────────────────────────────────────────────────
{ code: "PRODUCT_CREATE",     label: "Thêm sản phẩm",                target_type: "Product",    action_type: "CREATE", description: "Thêm sản phẩm mới vào danh mục",                          is_active: true }
{ code: "PRODUCT_UPDATE",     label: "Cập nhật sản phẩm",            target_type: "Product",    action_type: "UPDATE", description: "Chỉnh sửa thông tin sản phẩm (giá, mô tả, tồn kho...)",  is_active: true }
{ code: "PRODUCT_DELETE",     label: "Xoá sản phẩm",                 target_type: "Product",    action_type: "DELETE", description: "Xoá sản phẩm khỏi hệ thống",                             is_active: true }

// ── VARIANT ─────────────────────────────────────────────────────────────────
{ code: "VARIANT_CREATE",     label: "Thêm biến thể màu",            target_type: "Variant",    action_type: "CREATE", description: "Thêm biến thể màu sắc cho sản phẩm",                      is_active: true }
{ code: "VARIANT_UPDATE",     label: "Cập nhật biến thể màu",        target_type: "Variant",    action_type: "UPDATE", description: "Chỉnh sửa thông tin biến thể màu sắc",                    is_active: true }
{ code: "VARIANT_DELETE",     label: "Xoá biến thể màu",             target_type: "Variant",    action_type: "DELETE", description: "Xoá biến thể màu sắc khỏi sản phẩm",                     is_active: true }
{ code: "VARIANT_SIZE_ADD",   label: "Thêm kích thước biến thể",     target_type: "Variant",    action_type: "CREATE", description: "Thêm size mới vào biến thể của sản phẩm",                 is_active: true }
{ code: "VARIANT_SIZE_DELETE",label: "Xoá kích thước biến thể",      target_type: "Variant",    action_type: "DELETE", description: "Xoá size khỏi biến thể của sản phẩm",                    is_active: true }

// ── CATEGORY ────────────────────────────────────────────────────────────────
{ code: "CATEGORY_CREATE",    label: "Thêm danh mục",                target_type: "Category",   action_type: "CREATE", description: "Tạo danh mục sản phẩm mới",                               is_active: true }
{ code: "CATEGORY_UPDATE",    label: "Cập nhật danh mục",            target_type: "Category",   action_type: "UPDATE", description: "Chỉnh sửa thông tin danh mục sản phẩm",                  is_active: true }
{ code: "CATEGORY_DELETE",    label: "Xoá danh mục",                 target_type: "Category",   action_type: "DELETE", description: "Xoá danh mục sản phẩm khỏi hệ thống",                    is_active: true }

// ── ORDER ────────────────────────────────────────────────────────────────────
{ code: "ORDER_CREATE_COD",   label: "Đặt hàng (COD)",               target_type: "Order",      action_type: "CREATE", description: "Khách hàng đặt hàng thanh toán khi nhận hàng",            is_active: true }
{ code: "ORDER_CREATE_MOMO",  label: "Đặt hàng (Momo)",              target_type: "Order",      action_type: "CREATE", description: "Khách hàng đặt hàng qua ví Momo",                        is_active: true }
{ code: "ORDER_CREATE_VNPAY", label: "Đặt hàng (VNPay)",             target_type: "Order",      action_type: "CREATE", description: "Khách hàng đặt hàng qua VNPay",                          is_active: true }
{ code: "ORDER_UPDATE_STATUS",label: "Cập nhật trạng thái đơn hàng", target_type: "Order",      action_type: "UPDATE", description: "Thay đổi trạng thái xử lý hoặc thanh toán đơn hàng",     is_active: true }

// ── COUPON ───────────────────────────────────────────────────────────────────
{ code: "COUPON_CREATE",      label: "Tạo mã giảm giá",              target_type: "Coupon",     action_type: "CREATE", description: "Tạo coupon giảm giá mới",                                 is_active: true }
{ code: "COUPON_UPDATE",      label: "Cập nhật mã giảm giá",         target_type: "Coupon",     action_type: "UPDATE", description: "Chỉnh sửa thông tin coupon",                              is_active: true }
{ code: "COUPON_DELETE",      label: "Xoá mã giảm giá",              target_type: "Coupon",     action_type: "DELETE", description: "Xoá coupon khỏi hệ thống",                                is_active: true }

// ── BLOG ─────────────────────────────────────────────────────────────────────
{ code: "BLOG_CREATE",        label: "Thêm bài viết",                target_type: "Blog",       action_type: "CREATE", description: "Tạo bài viết blog mới",                                   is_active: true }
{ code: "BLOG_DELETE",        label: "Xoá bài viết",                 target_type: "Blog",       action_type: "DELETE", description: "Xoá bài viết blog khỏi hệ thống",                        is_active: true }

// ── COMMENT ──────────────────────────────────────────────────────────────────
{ code: "COMMENT_DELETE",     label: "Xoá bình luận",                target_type: "Comment",    action_type: "DELETE", description: "Admin xoá bình luận của người dùng",                     is_active: true }

// ── ROLE ─────────────────────────────────────────────────────────────────────
{ code: "ROLE_CREATE",        label: "Tạo vai trò mới",              target_type: "Role",       action_type: "CREATE", description: "Tạo vai trò phân quyền mới trong hệ thống",               is_active: true }
{ code: "ROLE_UPDATE",        label: "Cập nhật vai trò",             target_type: "Role",       action_type: "UPDATE", description: "Chỉnh sửa quyền hạn của vai trò",                        is_active: true }
{ code: "ROLE_DELETE",        label: "Xoá vai trò",                  target_type: "Role",       action_type: "DELETE", description: "Xoá vai trò khỏi hệ thống",                              is_active: true }
```

**Tổng cộng: 30 actions**

---

## 3. Collection: `audit_logs`

> Mỗi document = 1 lần tác động thực tế. Tham chiếu đến `actions.code` để lấy metadata.

### 3.1 Schema — `ModelAuditLog.js`

```js
{
  _id:          ObjectId,  // auto
  actor_email:  String,    // email người thực hiện — lấy từ JWT
  actor_role:   String,    // role tại thời điểm thực hiện: admin|manager|staff|user
  action_code:  String,    // ref → actions.code, vd: "PRODUCT_UPDATE"
  action_type:  String,    // denorm từ Action: CREATE|UPDATE|DELETE (để query nhanh)
  target_type:  String,    // denorm từ Action: User|Product|Order|... (để query nhanh)
  target_id:    String,    // _id hoặc email của bản ghi bị tác động
  target_label: String,    // nhãn dễ đọc, vd: "Sản phẩm: Áo Thun Trắng"
  data_before:  Mixed,     // object snapshot trước thay đổi — null nếu CREATE
  data_after:   Mixed,     // object snapshot sau thay đổi  — null nếu DELETE
  ip_address:   String,    // IP của request
  user_agent:   String,    // browser/client info
  created_at:   Date       // default: Date.now
}
```

> **Lưu ý:** `action_type` và `target_type` được denormalize (copy từ Action sang) để tránh phải lookup khi query/filter. Khi Action bị update thì AuditLog cũ giữ nguyên giá trị gốc — đây là hành vi đúng cho audit log.

### 3.2 Index

```js
{ created_at: -1 }                        // query mới nhất trước — dùng nhiều nhất
{ actor_email: 1, created_at: -1 }        // lọc theo tác nhân
{ target_type: 1, target_id: 1, created_at: -1 }  // lịch sử của 1 bản ghi cụ thể
{ action_code: 1 }                         // lọc theo loại hành động
```

---

## 4. Quan hệ giữa 2 collection

```
actions (lookup)               audit_logs (facts)
─────────────────              ──────────────────────────────────────
code: "PRODUCT_UPDATE"  ←───  action_code: "PRODUCT_UPDATE"
label: "Cập nhật SP"          action_type: "UPDATE"        (denorm)
target_type: "Product"        target_type: "Product"       (denorm)
action_type: "UPDATE"         target_id:   "664abc..."
description: "..."            target_label: "Áo Thun Trắng"
is_active: true               actor_email: "admin@..."
                              data_before: { priceNew: 150000 }
                              data_after:  { priceNew: 120000 }
                              created_at:  2026-05-12T10:30:00Z
```

**Luồng BE khi ghi log:**
1. Controller thực hiện thao tác DB thành công
2. Lookup `actions` theo `code` để lấy `action_type`, `target_type`
3. Insert document mới vào `audit_logs` (bất đồng bộ — không block response)

**Luồng BE khi đọc log:**
- Query trực tiếp `audit_logs` với các filter cần thiết
- Nếu cần hiển thị `label` đầy đủ: join với `actions` theo `action_code`

---

## 5. Quy tắc lưu `data_before` / `data_after`

| Hành động | `data_before`              | `data_after`               |
|-----------|---------------------------|---------------------------|
| CREATE    | `null`                    | Toàn bộ document vừa tạo  |
| UPDATE    | Document trước khi update | Document sau khi update    |
| DELETE    | Document trước khi xoá    | `null`                    |

**Các field bị loại bỏ trước khi lưu:**
- `password` — bất kỳ đối tượng User nào
- `__v` — version key của Mongoose (không cần thiết)
