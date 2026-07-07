# Thiết kế banner trang chủ gắn với sản phẩm

## Tổng quan hiện tại

- Banner trang chủ (`NEW TREND`, `UP TO 50% OFF`...) là **ảnh tĩnh PNG** đã thiết kế sẵn chữ, nằm ở:
  `client/src/Layouts/Main/Slide/img/imgBanner1.png`, `imgBanner2.png`, `imgBanner3.png`
- Component [Slide.js](client/src/Layouts/Main/Slide/Slide.js) chỉ `import` 3 file ảnh cứng vào mảng `slideImages`, không đọc từ API, không có link, không click được.
- Muốn đổi ảnh/đổi khuyến mãi → phải sửa file ảnh bằng Photoshop/Canva rồi **build lại và deploy lại code**. Không ai (kể cả admin) có thể tự đổi banner mà không đụng vào code.
- Trong thực tế (Shopee, Tiki, Lazada...), banner luôn là một **entity dữ liệu độc lập**: có ảnh, có link đích (sản phẩm / danh mục / trang khuyến mãi), có thời gian hiệu lực, và admin toàn quyền bật/tắt/sắp xếp mà không cần dev.

Dự án đã có sẵn nền tảng phù hợp để làm việc này:
- `ModelProducts` có `_id`, `category_id` → banner có thể trỏ thẳng tới 1 sản phẩm hoặc 1 category.
- `AdminRoutes.js` đã có pattern CRUD chuẩn (add/edit/delete + verifyRole) cho category, coupon, variant... → banner có thể làm theo đúng khuôn mẫu này.
- `ModelAuditLog` đã ghi lại mọi thay đổi CREATE/UPDATE/DELETE → banner mới có thể tận dụng luôn, không cần xây lại cơ chế audit.
- Hệ thống role sẵn có (`admin`, `manager`, `staff`) → gán quyền sửa banner cho `admin/manager` là hợp lý, giống category/coupon.

---

## 3 phương án để chọn

---

### Phương án A — Banner tĩnh nhưng thêm link (nhanh, ít rủi ro)

Giữ nguyên cách quản lý ảnh hiện tại (ảnh PNG do dev/thiết kế cung cấp, nằm trong code), chỉ thêm khả năng **click vào banner → điều hướng tới sản phẩm/danh mục**.

**Cần làm:**
- Sửa mảng `slideImages` trong `Slide.js` thêm field `linkTo` (ví dụ `/products/64f...` hoặc `/category/ao-khoac`)
- Bọc mỗi slide bằng `<Link to={slideImage.linkTo}>`

**Ưu điểm:** 30 phút làm xong, không đụng server, không có rủi ro dữ liệu.
**Nhược điểm:** Vẫn phải sửa code + deploy mỗi khi đổi banner hoặc đổi sản phẩm khuyến mãi. Không phải giải pháp lâu dài.

---

### Phương án B — Banner quản lý qua Admin, gắn `product_id`/`category_id` ⭐ (Khuyến nghị)

Biến banner thành dữ liệu thật trong MongoDB, admin tự thêm/sửa/xoá/sắp xếp qua trang quản trị, ảnh upload trực tiếp (dùng lại cơ chế `uploads/` sẵn có cho avatar).

**Model mới — `ModelBanner`:**
```js
const ModelBanner = new Schema({
    title: { type: String, default: '' },        // ghi chú nội bộ, không hiển thị
    image: { type: String, required: true },      // ảnh banner (đã có chữ thiết kế sẵn, hoặc ảnh sản phẩm + overlay CSS)
    link_type: { type: String, enum: ['product', 'category', 'url', 'none'], default: 'none' },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', default: null },
    category_id: { type: Schema.Types.ObjectId, ref: 'category', default: null },
    external_url: { type: String, default: '' },  // dùng khi link_type = 'url'
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    start_at: { type: Date, default: null },       // tuỳ chọn: banner có thời hạn (VD: sale 7 ngày)
    end_at: { type: Date, default: null },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});
```

**Cần làm:**
1. Server: `ModelBanner.js`, `ControllerBanner.js` (Add/Edit/Delete/GetAll — copy pattern từ `ControllerCategory`), route `GET /api/banners` (public, chỉ trả banner `is_active=true` và còn hạn), route admin `/api/addbanner`, `/api/editbanner`, `/api/deletebanner` (theo `verifyRole(ADMIN_MANAGER)` giống category)
2. Admin UI: 1 trang danh sách + form thêm/sửa (upload ảnh, chọn loại link, nếu chọn "product" thì hiện dropdown search sản phẩm, nếu "category" thì dropdown category)
3. Client: `Slide.js` đổi từ `import` ảnh tĩnh sang `useEffect` gọi `GET /api/banners`, mỗi slide bọc `<Link to={...})` tuỳ theo `link_type`
4. Ghi audit log khi thêm/sửa/xoá banner (tận dụng `ModelAuditLog` sẵn có, giống category/coupon)

**Ưu điểm:** Admin tự chủ hoàn toàn, không cần dev can thiệp mỗi lần đổi khuyến mãi; banner có thể lên lịch tự bật/tắt theo `start_at`/`end_at`; tận dụng 100% hạ tầng sẵn có (role, audit log, upload).
**Nhược điểm:** Cần thêm 1 model + 1 bộ CRUD + 1 màn admin (~2-3 ngày công), cần thiết kế lại ảnh banner (ảnh phải để chỗ trống cho phần chữ nếu muốn overlay bằng CSS thay vì vẽ chữ trong ảnh).

---

### Phương án C — Banner tự động sinh từ sản phẩm nổi bật (nâng cao)

Không cần admin nhập tay: banner tự lấy sản phẩm có `like_count` cao nhất, hoặc sản phẩm đang có coupon giảm giá, ghép với ảnh sản phẩm (`img`/`images`) và overlay chữ bằng CSS (giá cũ/giá mới lấy từ `priceOld`/`priceNew`).

**Cần làm thêm so với PA B:**
- Vẫn cần `ModelBanner` (hoặc bỏ hẳn, thay bằng logic query trực tiếp `ModelProducts` sort theo `like_count`/coupon)
- Logic chọn "sản phẩm nổi bật" (query + cache, tránh query nặng mỗi lần load trang chủ)
- Thiết kế lại UI overlay chữ đè lên ảnh sản phẩm bằng CSS thay vì ảnh thiết kế sẵn

**Ưu điểm:** Banner luôn "tươi", tự cập nhật theo dữ liệu thực (giá, lượt thích), không cần ai thao tác thủ công.
**Nhược điểm:** Phức tạp nhất, phụ thuộc chất lượng ảnh sản phẩm (ảnh sản phẩm chụp không theo bố cục banner sẽ xấu), khó kiểm soát nội dung marketing (đội sale thường muốn tự chọn banner theo chiến dịch, không muốn để thuật toán quyết).

---

## Đề xuất

**Phương án B**, vì dự án đã có sẵn admin panel + role + audit log — chi phí thêm không lớn, và đây là cách các sàn TMĐT thực tế vẫn làm (banner là dữ liệu do đội marketing/admin quản lý tay, không tự động hoá).

---

## Ảnh hưởng đến dữ liệu cũ nếu sửa (rất quan trọng — đọc kỹ trước khi quyết định)

| Thành phần | Có bị ảnh hưởng không | Giải thích |
|---|---|---|
| `ModelProducts` (dữ liệu sản phẩm) | **Không** | Banner chỉ *tham chiếu* tới `product_id` qua `ref`, không sửa, không thêm field vào bảng sản phẩm. Toàn bộ sản phẩm hiện có giữ nguyên. |
| `ModelCategory` | **Không** | Tương tự, chỉ tham chiếu qua `category_id`. |
| Đơn hàng, giỏ hàng, user, coupon... | **Không** | Banner là collection hoàn toàn mới (`banners`), độc lập, không đụng tới bất kỳ collection nào đang chạy. |
| 3 ảnh PNG hiện tại (`imgBanner1/2/3.png`) | **Không mất** | Có thể tái sử dụng làm 3 bản ghi đầu tiên trong `ModelBanner` (`link_type: 'none'`) — tức là banner hiển thị y hệt bây giờ, chỉ khác là dữ liệu nằm trong DB thay vì hard-code. Không cần xoá file ảnh cũ. |
| Trang chủ khi vừa deploy (chưa có banner nào trong DB) | **Cần xử lý** | Nếu collection `banners` rỗng, `GET /api/banners` trả mảng rỗng → `Slide.js` phải có fallback (hiện ảnh mặc định hoặc ẩn slider) để tránh trang chủ bị "trống" ngay sau khi deploy. Đơn giản nhất: viết 1 script seed chèn sẵn 3 banner cũ vào DB trước khi deploy tính năng mới. |
| Code cũ `Slide.js` | **Thay đổi có kiểm soát** | Đây là thay đổi *cách lấy dữ liệu* (từ `import` tĩnh sang gọi API), không phải xoá tính năng. Rollback dễ: nếu API lỗi, giữ nguyên UI, chỉ cần catch lỗi và fallback về mảng ảnh tĩnh cũ. |
| Quyền hạn (role) | **Không phá vỡ gì** | Dùng lại `verifyRole(ADMIN_MANAGER)` đã có, không tạo role mới, không ảnh hưởng phân quyền hiện tại. |

**Kết luận về rủi ro:** Đây là tính năng **cộng thêm (additive)**, không phải **sửa đổi (destructive)** — không có migration nguy hiểm, không có bảng nào bị đổi schema, không có dữ liệu cũ nào bị xoá hay convert. Rủi ro duy nhất cần lưu ý là bước "deploy xong nhưng DB banner rỗng" — chỉ cần seed dữ liệu trước khi bật tính năng ở production là an toàn tuyệt đối.

---

## Câu hỏi cần quyết định trước khi làm

1. **Chọn PA A (nhanh, chỉ thêm link), PA B (khuyến nghị — admin tự quản lý), hay PA C (tự động theo sản phẩm nổi bật)?**
2. Nếu chọn PA B: banner có cần **thời hạn hiển thị** (`start_at`/`end_at`) để tự động chạy chiến dịch sale theo ngày không, hay chỉ cần bật/tắt tay (`is_active`)?
3. Ảnh banner nên tiếp tục **thiết kế sẵn chữ trong ảnh** (như hiện tại) hay chuyển sang **ảnh sản phẩm + overlay chữ bằng CSS** (linh hoạt hơn nhưng cần code thêm phần overlay)?
4. Có cần phân biệt nhiều **vị trí banner** không (VD: banner slider trang chủ khác với banner nhỏ trong trang category), hay chỉ cần 1 loại banner cho trang chủ trước?
