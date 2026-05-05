# Báo Cáo Thay Đổi Cấu Trúc Database

**Dự án:** doan2 — Ứng dụng thương mại điện tử  
**Ngày thực hiện:** 04/05/2026  
**Mục tiêu:** Bổ sung các thành phần còn thiếu để trang chi tiết sản phẩm đạt chuẩn tương tự Shopee

---

## 1. Phân Tích Yêu Cầu

Dựa trên phân tích trang sản phẩm Shopee, các thành phần cần có gồm:

| STT | Thành phần | Trạng thái trước | Hành động |
|-----|-----------|-----------------|-----------|
| 1 | Nhiều ảnh sản phẩm | Chỉ có 1 trường `img` | Thêm trường `images[]` |
| 2 | Tùy chọn màu sắc | Không có | Tạo model mới `ProductVariant` |
| 3 | Tùy chọn kích thước (S/M/L/XL) | Không có | Tạo model mới `ProductVariant` |
| 4 | Điểm đánh giá sao (1–5) | Comments không có rating | Thêm trường `rating` vào Comments |
| 5 | Tổng số & điểm TB đánh giá | Không có | Thêm `rating_avg`, `rating_count` vào Products |
| 6 | Lượt thích sản phẩm | Không có | Tạo model mới `Wishlist` + trường `like_count` |
| 7 | Breadcrumb phân cấp danh mục | Category phẳng, không có cha | Thêm `parent_id`, `slug` vào Category |
| 8 | Chính sách đổi trả | Không có | Thêm `return_days` vào Products |
| 9 | Bảo hiểm thời trang | Không có | Thêm `has_fashion_insurance` vào Products |
| 10 | Thông tin vận chuyển | Không có | Thêm `free_shipping`, `shipping_note` vào Products |

---

## 1. Chi Tiết Các Thay Đổi

### 1.1 Sửa `ModelProducts.js`

**File:** `server/src/model/ModelProducts.js`

#### Trước khi sửa:
```js
const ModelProducts = new Schema({
    id: { type: Number, default: 0 },
    img: { type: String, default: '' },
    nameProducts: { type: String, default: 0 },
    priceNew: { type: Number, default: 0 },
    priceOld: { type: Number, default: 0 },
    des: { type: String, default: '' },
    checkProducts: { type: String, default: '' },
    category_id: { type: Schema.Types.ObjectId, ref: 'category' },
    stock_quantity: { type: Number, default: 100 },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});
```

#### Sau khi sửa:
```js
const ModelProducts = new Schema({
    id: { type: Number, default: 0 },
    img: { type: String, default: '' },
    images: [{ type: String }],                          // THÊM MỚI
    nameProducts: { type: String, default: '' },
    priceNew: { type: Number, default: 0 },
    priceOld: { type: Number, default: 0 },
    des: { type: String, default: '' },
    checkProducts: { type: String, default: '' },
    category_id: { type: Schema.Types.ObjectId, ref: 'category' },
    stock_quantity: { type: Number, default: 100 },
    rating_avg: { type: Number, default: 0 },            // THÊM MỚI
    rating_count: { type: Number, default: 0 },          // THÊM MỚI
    like_count: { type: Number, default: 0 },            // THÊM MỚI
    free_shipping: { type: Boolean, default: false },    // THÊM MỚI
    shipping_note: { type: String, default: '' },        // THÊM MỚI
    return_days: { type: Number, default: 15 },          // THÊM MỚI
    has_fashion_insurance: { type: Boolean, default: false }, // THÊM MỚI
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});
```

#### Giải thích từng trường thêm mới:

| Trường | Kiểu dữ liệu | Mặc định | Mô tả |
|--------|-------------|---------|-------|
| `images` | String[] | `[]` | Mảng URL ảnh phụ (các góc chụp, màu sắc khác nhau) |
| `rating_avg` | Number | `0` | Điểm đánh giá trung bình (ví dụ: 5.0) |
| `rating_count` | Number | `0` | Tổng số lượt đánh giá (ví dụ: 14 đánh giá) |
| `like_count` | Number | `0` | Tổng lượt yêu thích sản phẩm (ví dụ: 57 lượt) |
| `free_shipping` | Boolean | `false` | Sản phẩm có được miễn phí vận chuyển không |
| `shipping_note` | String | `''` | Ghi chú vận chuyển (ví dụ: "Không hỗ trợ vận chuyển") |
| `return_days` | Number | `15` | Số ngày được phép đổi trả hàng miễn phí |
| `has_fashion_insurance` | Boolean | `false` | Có hỗ trợ bảo hiểm thời trang không |

---

### 1.2 Sửa `ModelCategory.js`

**File:** `server/src/model/ModelCategory.js`

#### Trước khi sửa:
```js
const ModelCategory = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});
```

#### Sau khi sửa:
```js
const ModelCategory = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    parent_id: { type: Schema.Types.ObjectId, ref: 'category', default: null }, // THÊM MỚI
    slug: { type: String, default: '' },                                         // THÊM MỚI
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});
```

#### Giải thích từng trường thêm mới:

| Trường | Kiểu dữ liệu | Mặc định | Mô tả |
|--------|-------------|---------|-------|
| `parent_id` | ObjectId (ref: category) | `null` | Trỏ đến danh mục cha, cho phép tạo cấu trúc cây phân cấp để hiển thị breadcrumb: `Shopee > Thời Trang Nữ > Áo > Áo polo` |
| `slug` | String | `''` | Đường dẫn URL thân thiện (ví dụ: `ao-polo`, `thoi-trang-nu`) |

#### Ví dụ cấu trúc phân cấp danh mục:
```
Thời Trang Nữ  (parent_id: null)
 └── Áo        (parent_id: ID của "Thời Trang Nữ")
      └── Áo Polo  (parent_id: ID của "Áo")
```

---

### 1.3 Sửa `ModelComments.js`

**File:** `server/src/model/ModelComments.js`

#### Trước khi sửa:
```js
const ModelComments = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', default: null },
    blog_id: { type: Schema.Types.ObjectId, ref: 'blogs', default: null },
    comments: { type: String, default: "" },
    created_at: { type: Date, default: Date.now }
});
```

#### Sau khi sửa:
```js
const ModelComments = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', default: null },
    blog_id: { type: Schema.Types.ObjectId, ref: 'blogs', default: null },
    comments: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },  // THÊM MỚI
    created_at: { type: Date, default: Date.now }
});
```

#### Giải thích trường thêm mới:

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|--------|-------------|----------|-------|
| `rating` | Number | min: 1, max: 5, default: null | Điểm sao người dùng chấm cho sản phẩm kèm bình luận. `null` = chỉ bình luận không đánh giá |

> **Lưu ý:** Khi người dùng gửi đánh giá, backend cần tính lại `rating_avg` và `rating_count` trong `ModelProducts` tương ứng.

---

### 1.4 Tạo mới `ModelProductVariant.js`

**File:** `server/src/model/ModelProductVariant.js` *(file mới)*

```js
const ModelProductVariant = new Schema({
    product_id: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    color: { type: String, default: '' },
    color_hex: { type: String, default: '' },
    size: { type: String, default: '' },
    size_note: { type: String, default: '' },
    stock_quantity: { type: Number, default: 0 },
    price_adjustment: { type: Number, default: 0 },
    img: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
});
```

#### Giải thích từng trường:

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `product_id` | ObjectId (ref: products) | Sản phẩm gốc mà biến thể này thuộc về |
| `color` | String | Tên màu (ví dụ: `"Đỏ phối Be"`, `"Hồng phối Be"`) |
| `color_hex` | String | Mã màu HEX để hiển thị ô màu (ví dụ: `"#FF6B6B"`) |
| `size` | String | Kích cỡ (ví dụ: `"S"`, `"M"`, `"L"`, `"XL"`) |
| `size_note` | String | Ghi chú kích cỡ (ví dụ: `"babytee nữ"`, `"unisex"`) |
| `stock_quantity` | Number | Số lượng tồn kho của biến thể này |
| `price_adjustment` | Number | Chênh lệch giá so với giá gốc (ví dụ: `+10000` hoặc `0`) |
| `img` | String | Ảnh riêng cho biến thể màu này |

#### Ví dụ dữ liệu thực tế (áo polo):
```json
[
  { "product_id": "...", "color": "Đỏ phối Be",            "size": "S", "size_note": "babytee nữ", "stock_quantity": 20 },
  { "product_id": "...", "color": "Đỏ phối Be",            "size": "M", "size_note": "babytee nữ", "stock_quantity": 15 },
  { "product_id": "...", "color": "Xanh da trời phối Trắng","size": "L", "size_note": "unisex",     "stock_quantity": 30 },
  { "product_id": "...", "color": "Xanh da trời phối Trắng","size": "XL","size_note": "unisex",     "stock_quantity": 10 }
]
```

---

### 1.5 Tạo mới `ModelWishlist.js`

**File:** `server/src/model/ModelWishlist.js` *(file mới)*

```js
const ModelWishlist = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    created_at: { type: Date, default: Date.now },
});

ModelWishlist.index({ user_id: 1, product_id: 1 }, { unique: true });
```

#### Giải thích từng trường:

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `user_id` | ObjectId (ref: user) | Người dùng đã thích sản phẩm |
| `product_id` | ObjectId (ref: products) | Sản phẩm được thích |
| `created_at` | Date | Thời điểm bấm thích |

> **Unique Index:** Cặp `(user_id, product_id)` là duy nhất — mỗi người dùng chỉ thích một sản phẩm một lần, tránh trùng lặp dữ liệu.

---

## 2. Sơ Đồ Quan Hệ Sau Khi Thay Đổi

```
category (phân cấp)
  ├── _id
  ├── name
  ├── parent_id ──────────────────► category._id  (tự tham chiếu)
  └── slug

products
  ├── _id
  ├── img, images[]
  ├── nameProducts, priceNew, priceOld
  ├── rating_avg, rating_count, like_count
  ├── free_shipping, shipping_note
  ├── return_days, has_fashion_insurance
  └── category_id ────────────────► category._id

product_variants  (MỚI)
  ├── product_id ─────────────────► products._id
  ├── color, color_hex
  ├── size, size_note
  ├── stock_quantity, price_adjustment
  └── img

comments
  ├── user_id ─────────────────────► user._id
  ├── product_id ──────────────────► products._id
  ├── comments
  └── rating (1–5)

wishlist  (MỚI)
  ├── user_id ─────────────────────► user._id
  └── product_id ──────────────────► products._id
```

---

## 3. Các Bước Tiếp Theo Cần Thực Hiện

### Backend
- [ ] Viết API `GET /api/variants/:product_id` — lấy danh sách biến thể theo sản phẩm
- [ ] Viết API `POST /api/wishlist/toggle` — thích / bỏ thích sản phẩm, cập nhật `like_count`
- [ ] Cập nhật API `POST /api/comments` — nhận thêm trường `rating`, tự động tính lại `rating_avg` và `rating_count` trong bảng products
- [ ] Cập nhật Admin API `addproduct` / `editproduct` — nhận thêm các trường mới của Products
- [ ] Viết API breadcrumb: dựa vào `parent_id` để trả về chuỗi danh mục cha → con

### Frontend
- [ ] Trang chi tiết sản phẩm: hiển thị gallery nhiều ảnh (`images[]`)
- [ ] Trang chi tiết sản phẩm: hiển thị bộ chọn màu sắc + kích thước từ `product_variants`
- [ ] Trang chi tiết sản phẩm: nút tim (thích) gọi API wishlist toggle
- [ ] Trang chi tiết sản phẩm: form đánh giá có chọn số sao (`rating`)
- [ ] Breadcrumb component: gọi API để lấy chuỗi phân cấp danh mục
- [ ] Admin: form thêm/sửa sản phẩm có tab quản lý biến thể (màu + size)

---

## 5. Tổng Kết

| Loại thay đổi | File | Số trường thêm |
|--------------|------|---------------|
| Sửa model | `ModelProducts.js` | +8 trường |
| Sửa model | `ModelCategory.js` | +2 trường |
| Sửa model | `ModelComments.js` | +1 trường |
| Tạo mới | `ModelProductVariant.js` | 8 trường |
| Tạo mới | `ModelWishlist.js` | 3 trường |

**Tổng cộng:** 3 file sửa, 2 file tạo mới, 22 trường dữ liệu mới.
