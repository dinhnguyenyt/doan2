# Thiết kế hệ thống phí vận chuyển

## Tổng quan hiện tại

Hệ thống hiện có sẵn:
- Sản phẩm có field `free_shipping` (Boolean) và `shipping_note` (String)
- Checkout đã có state `shippingFee` (đang = 0 chờ triển khai)
- Coupon loại `shipping` đã hoàn chỉnh — giảm `%` trên phí vận chuyển
- Payment (COD + VNPay) đã nhận `shippingFee` và tính vào `finalPrice`
- Địa chỉ giao hàng đã lưu: `city`, `country`, `address_line1`

---

## 3 phương án để chọn

---

### Phương án A — Phí cố định theo khu vực ⭐ (Khuyến nghị)

Đơn giản nhất, phù hợp giai đoạn đầu.

| Khu vực | Phí |
|---|---|
| Nội thành (cùng tỉnh/thành với kho) | 20.000 VNĐ |
| Liên tỉnh (tỉnh/thành khác) | 35.000 VNĐ |
| Miễn phí | Đơn ≥ ngưỡng cấu hình (VD: 500.000 VNĐ) hoặc sản phẩm có `free_shipping = true` |

**Cần làm:**
- Thêm model `ModelShippingConfig` lưu: phí nội thành, phí liên tỉnh, ngưỡng miễn phí, tên tỉnh/thành kho
- Admin có màn hình cấu hình (1 form đơn giản)
- Checkout gọi API tính phí dựa vào `city` của địa chỉ giao hàng
- So sánh city của khách với city của kho → nội thành hay liên tỉnh

**Ưu điểm:** Dễ triển khai (1–2 ngày), dễ giải thích với khách hàng  
**Nhược điểm:** Không chính xác theo quãng đường thực tế

---

### Phương án B — Phí theo cân nặng × khu vực

Gần với thực tế hơn, phù hợp khi sản phẩm có trọng lượng chênh lệch lớn.

**Công thức:**
```
Phí = phí_cơ_bản(khu_vực) + (cân_nặng_kg × đơn_giá_per_kg)
```

Ví dụ:
- Nội thành: 15.000 + 2.500/kg
- Liên tỉnh: 25.000 + 5.000/kg

**Cần làm thêm so với PA A:**
- Thêm field `weight_gram` vào ModelProducts
- Tính tổng cân nặng từ cart items
- Bảng giá theo khu vực × kg trong ModelShippingConfig

**Ưu điểm:** Công bằng hơn với đơn hàng nhiều/nặng  
**Nhược điểm:** Cần nhập cân nặng cho từng sản phẩm, phức tạp hơn PA A

---

### Phương án C — Tích hợp API hãng vận chuyển (GHN / GHTK)

Phí tính chính xác theo địa chỉ thực tế, tự động tra cứu.

**Các hãng phổ biến tại VN:**
- **GHN** (Giao Hàng Nhanh): API miễn phí, tính phí theo tỉnh/quận/phường
- **GHTK** (Giao Hàng Tiết Kiệm): tương tự, giá rẻ hơn

**Cần làm:**
- Đăng ký tài khoản merchant tại GHN/GHTK
- Lưu API key vào `.env`
- Khi checkout: gọi API hãng với địa chỉ người nhận + cân nặng/kích thước → nhận về phí
- Hiển thị phí cho khách trước khi thanh toán

**Ưu điểm:** Chính xác 100%, không cần tự quản lý bảng giá  
**Nhược điểm:** Phụ thuộc bên thứ 3, cần đăng ký tài khoản doanh nghiệp, phức tạp hơn

---

## Luồng xử lý đề xuất (PA A)

```
Khách chọn địa chỉ giao hàng
        ↓
Checkout gọi GET /api/shipping-fee?city=...&sumPrice=...
        ↓
Server so sánh city → nội thành hay liên tỉnh
        ↓
Kiểm tra: sumPrice >= ngưỡng miễn phí? → fee = 0
Kiểm tra: tất cả sản phẩm free_shipping? → fee = 0
        ↓
Trả về { fee, label }  (VD: { fee: 35000, label: "Liên tỉnh" })
        ↓
Checkout hiển thị phí, cập nhật shippingFee state
        ↓
Khách áp mã coupon vận chuyển (nếu có) → giảm thêm
        ↓
Thanh toán với finalPrice = productTotal + shippingFee
```

---

## Những gì đã sẵn sàng (không cần làm thêm)

- ✅ `shippingFee` state trong Checkout.js
- ✅ Payment API nhận `shippingFee` và tính đúng
- ✅ Coupon loại `shipping` giảm % phí vận chuyển
- ✅ Địa chỉ giao hàng đã lưu với `city`
- ✅ Sản phẩm có `free_shipping` boolean

## Những gì cần thêm (PA A)

| # | Việc cần làm | Độ phức tạp |
|---|---|---|
| 1 | Model `ModelShippingConfig` (phí nội thành, liên tỉnh, ngưỡng miễn phí, city kho) | Thấp |
| 2 | API `GET /api/shipping-fee` tính phí theo city + sumPrice | Thấp |
| 3 | Admin: màn hình cấu hình phí vận chuyển | Thấp |
| 4 | Checkout: gọi API và hiển thị phí vận chuyển | Thấp |
| 5 | ProductDetail: hiển thị "Miễn phí vận chuyển" nếu `free_shipping = true` | Rất thấp |

---

## Câu hỏi cần quyết định trước khi làm

1. **Kho hàng đặt ở tỉnh/thành nào?** (để phân loại nội thành/liên tỉnh)
2. **Ngưỡng miễn phí vận chuyển là bao nhiêu?** (VD: 500.000, 1.000.000 VNĐ)
3. **Phí nội thành và liên tỉnh là bao nhiêu?**
4. **Có muốn hiển thị nhiều tùy chọn vận chuyển** (tiêu chuẩn/nhanh) hay chỉ 1 mức?
5. **PA A, B hay C?**
