# Quy trình đổi trả hàng

## Tổng quan luồng

```
Khách yêu cầu trả hàng
        ↓
Nhân viên liên hệ điện thoại xác nhận
        ↓
Khách gửi hàng về shop
        ↓
Nhân viên nhận hàng → cập nhật trạng thái
        ↓
Admin xác nhận chấp nhận trả hàng → hoàn tiền
```

---

## Vòng đời trạng thái (Status Flow)

```
PENDING_REVIEW  →  CONTACTING  →  WAITING_ITEM  →  ITEM_RECEIVED  →  APPROVED  →  REFUNDED
    (mới)          (đang liên      (chờ nhận          (đã nhận        (chấp       (đã hoàn
                    hệ KH)          hàng)              hàng)          nhận)        tiền)
                                                           ↓
                                                       REJECTED
                                                      (từ chối)
```

| Trạng thái | Người thực hiện | Mô tả |
|---|---|---|
| `PENDING_REVIEW` | Hệ thống (khi KH gửi) | Yêu cầu mới, chờ xem xét |
| `CONTACTING` | Nhân viên | Đang liên hệ khách hàng qua SĐT |
| `WAITING_ITEM` | Nhân viên | Đã trao đổi, chờ KH gửi hàng về |
| `ITEM_RECEIVED` | Nhân viên | Đã nhận hàng từ KH |
| `APPROVED` | Admin | Chấp nhận trả hàng |
| `REJECTED` | Admin | Từ chối (hàng lỗi do KH, quá hạn...) |
| `REFUNDED` | Admin | Đã hoàn tiền vào tài khoản KH |

---

## Model dữ liệu

### ModelReturnRequest

```javascript
{
    // Liên kết đơn hàng
    order_id:       ObjectId (ref: 'order', required),
    customer_email: String (required),

    // Lý do từ khách
    reason:         String (required),        // lý do trả hàng
    description:    String,                   // mô tả chi tiết
    images:         [String],                 // ảnh minh chứng (URL)

    // Trạng thái
    status: {
        type: String,
        enum: ['PENDING_REVIEW', 'CONTACTING', 'WAITING_ITEM',
               'ITEM_RECEIVED', 'APPROVED', 'REJECTED', 'REFUNDED'],
        default: 'PENDING_REVIEW'
    },

    // Ghi chú nội bộ (nhân viên/admin điền)
    staff_note:     String,
    reject_reason:  String,                   // lý do từ chối (nếu REJECTED)

    // Hoàn tiền
    refund_amount:  Number,                   // số tiền hoàn (mặc định = sumPrice đơn hàng)
    refunded_by:    String,                   // email admin thực hiện hoàn tiền

    // Audit
    created_at:     Date (default: now),
    modified_at:    Date,
    modified_by:    String,                   // email người cập nhật cuối
}
```

### Thay đổi ModelOrder
Thêm field để đánh dấu đơn hàng đang trong quy trình trả:
```javascript
has_return_request: { type: Boolean, default: false }
```

---

## API Endpoints

### Phía khách hàng (cần đăng nhập)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/return-request` | Tạo yêu cầu trả hàng |
| `GET` | `/api/return-request/my` | Xem các yêu cầu của mình |
| `GET` | `/api/return-request/:id` | Xem chi tiết 1 yêu cầu |

**Điều kiện tạo yêu cầu:**
- Đơn hàng phải thuộc về khách hàng đó
- `statusOrder = true` (đã giao hàng)
- Trong vòng `return_days` ngày kể từ ngày đặt hàng (lấy từ sản phẩm)
- Chưa có yêu cầu trả hàng nào cho đơn này

### Phía admin (nhân viên + admin)

| Method | Endpoint | Role | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/return-requests` | staff+ | Danh sách tất cả yêu cầu, lọc theo status |
| `GET` | `/api/admin/return-requests/:id` | staff+ | Chi tiết yêu cầu |
| `POST` | `/api/admin/return-requests/:id/status` | staff+ | Cập nhật trạng thái (CONTACTING, WAITING_ITEM, ITEM_RECEIVED) |
| `POST` | `/api/admin/return-requests/:id/approve` | admin | Chấp nhận trả hàng |
| `POST` | `/api/admin/return-requests/:id/reject` | admin | Từ chối trả hàng |
| `POST` | `/api/admin/return-requests/:id/refund` | admin | Xác nhận đã hoàn tiền |

---

## Giao diện người dùng

### Trang `/info` — Lịch sử đơn hàng

Thêm nút **"Yêu cầu trả hàng"** bên cạnh mỗi đơn hàng thỏa điều kiện:
- `statusOrder = true` (đã giao)
- Trong thời hạn trả hàng
- Chưa có yêu cầu trả đang xử lý

Khi click → mở modal nhập thông tin:
- **Lý do** (select): Hàng bị lỗi / Không đúng mô tả / Không vừa size / Khác
- **Mô tả chi tiết** (textarea)
- **Ảnh minh chứng** (upload, tùy chọn)
- Nút Gửi yêu cầu

Sau khi gửi → hiển thị trạng thái yêu cầu ngay trong đơn hàng (badge).

### Màn hình theo dõi yêu cầu (trong `/info`)

Hiển thị timeline trạng thái:
```
✅ Đã gửi yêu cầu     05/05/2026
✅ Nhân viên đang liên hệ  06/05/2026
⏳ Chờ nhận hàng từ bạn
○  Đã nhận hàng
○  Xác nhận trả hàng
○  Hoàn tiền
```

---

## Giao diện Admin

### Menu mới: "Đổi trả" (icon: faRotateLeft)

Màn hình danh sách yêu cầu trả hàng:
- Tabs lọc theo trạng thái: Tất cả / Mới / Đang xử lý / Chờ nhận hàng / Đã nhận / Hoàn tất
- Mỗi row: mã yêu cầu, email khách, mã đơn hàng, lý do, ngày tạo, trạng thái, nút Xem
- Modal chi tiết: xem đầy đủ + nút cập nhật trạng thái

**Phân quyền hành động:**
| Hành động | Role |
|---|---|
| Xem danh sách & chi tiết | staff, manager, admin |
| Cập nhật → CONTACTING / WAITING_ITEM / ITEM_RECEIVED | staff, manager, admin |
| Approve / Reject | manager, admin |
| Refund | admin only |

---

## Cơ chế hoàn tiền

Hệ thống hiện có field `surplus` trong `ModelUser` (số dư tài khoản).

**Luồng hoàn tiền:**
1. Admin bấm "Xác nhận hoàn tiền" với số tiền hoàn (mặc định = `sumPrice` của đơn)
2. Server: `user.surplus += refund_amount`
3. Return request status → `REFUNDED`
4. Ghi nhận `refunded_by`, `refund_amount`

**Lưu ý:**
- Với đơn COD: hoàn tiền vào ví (surplus) là hợp lý
- Với đơn VNPay: có thể hoàn vào ví hoặc xử lý qua VNPay refund API (phức tạp hơn)
- Giai đoạn đầu: hoàn tất cả vào `surplus`

---

## Những gì cần làm

### Server
| # | File | Việc làm |
|---|---|---|
| 1 | `ModelReturnRequest.js` | Tạo model |
| 2 | `ModelOrder.js` | Thêm `has_return_request` |
| 3 | `ControllerReturn.js` | Tất cả logic: tạo, cập nhật status, approve, reject, refund |
| 4 | `AdminRoutes.js` + `index.js` | Đăng ký routes |

### Client
| # | File | Việc làm |
|---|---|---|
| 5 | `InfoUser.js` | Thêm nút "Yêu cầu trả hàng" + timeline theo dõi |
| 6 | `ReturnRequestModal.js` | Modal tạo yêu cầu cho khách |
| 7 | `Returns/Returns.js` | Màn hình admin quản lý đổi trả |
| 8 | `rbacConstants.js` | Thêm menu `returns` |
| 9 | `HomePageAdmin.js` | Mount component Returns |

---

## Câu hỏi cần quyết định

1. **Thời hạn trả hàng** tính theo sản phẩm hay đơn hàng? (Sản phẩm đã có `return_days`)
2. **Ảnh minh chứng** có bắt buộc không?
3. **Hoàn tiền** vào ví nội bộ (`surplus`) hay xử lý qua VNPay refund API?
4. **Thông báo** cho khách khi trạng thái thay đổi (email / socket)?
5. **Số tiền hoàn** có thể nhỏ hơn đơn hàng không (hoàn một phần)?
