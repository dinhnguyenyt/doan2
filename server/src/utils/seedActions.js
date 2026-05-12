const ModelAction = require('../model/ModelAction');

const ACTIONS = [
    // ── USER ────────────────────────────────────────────────────────────────────
    { code: 'USER_REGISTER',       label: 'Đăng ký tài khoản',            target_type: 'User',     action_type: 'CREATE', description: 'User tự đăng ký tài khoản mới' },
    { code: 'USER_CREATE',         label: 'Tạo tài khoản (admin)',         target_type: 'User',     action_type: 'CREATE', description: 'Admin/manager tạo tài khoản người dùng' },
    { code: 'USER_UPDATE',         label: 'Cập nhật thông tin tài khoản',  target_type: 'User',     action_type: 'UPDATE', description: 'Chỉnh sửa thông tin cá nhân (fullname, phone, email...)' },
    { code: 'USER_UPDATE_ROLE',    label: 'Thay đổi phân quyền',           target_type: 'User',     action_type: 'UPDATE', description: 'Thay đổi role của người dùng' },
    { code: 'USER_CHANGE_PASS',    label: 'Đổi mật khẩu',                  target_type: 'User',     action_type: 'UPDATE', description: 'Thay đổi mật khẩu (không lưu giá trị hash)' },
    { code: 'USER_DELETE',         label: 'Xoá tài khoản',                 target_type: 'User',     action_type: 'DELETE', description: 'Xoá tài khoản người dùng khỏi hệ thống' },

    // ── PRODUCT ──────────────────────────────────────────────────────────────────
    { code: 'PRODUCT_CREATE',      label: 'Thêm sản phẩm',                 target_type: 'Product',  action_type: 'CREATE', description: 'Thêm sản phẩm mới vào danh mục' },
    { code: 'PRODUCT_UPDATE',      label: 'Cập nhật sản phẩm',             target_type: 'Product',  action_type: 'UPDATE', description: 'Chỉnh sửa thông tin sản phẩm (giá, mô tả, tồn kho...)' },
    { code: 'PRODUCT_DELETE',      label: 'Xoá sản phẩm',                  target_type: 'Product',  action_type: 'DELETE', description: 'Xoá sản phẩm khỏi hệ thống' },

    // ── VARIANT ──────────────────────────────────────────────────────────────────
    { code: 'VARIANT_CREATE',      label: 'Thêm biến thể màu',             target_type: 'Variant',  action_type: 'CREATE', description: 'Thêm biến thể màu sắc cho sản phẩm' },
    { code: 'VARIANT_UPDATE',      label: 'Cập nhật biến thể màu',         target_type: 'Variant',  action_type: 'UPDATE', description: 'Chỉnh sửa thông tin biến thể màu sắc' },
    { code: 'VARIANT_DELETE',      label: 'Xoá biến thể màu',              target_type: 'Variant',  action_type: 'DELETE', description: 'Xoá biến thể màu sắc khỏi sản phẩm' },
    { code: 'VARIANT_SIZE_ADD',    label: 'Thêm kích thước biến thể',      target_type: 'Variant',  action_type: 'CREATE', description: 'Thêm size mới vào biến thể của sản phẩm' },
    { code: 'VARIANT_SIZE_DELETE', label: 'Xoá kích thước biến thể',       target_type: 'Variant',  action_type: 'DELETE', description: 'Xoá size khỏi biến thể của sản phẩm' },

    // ── CATEGORY ─────────────────────────────────────────────────────────────────
    { code: 'CATEGORY_CREATE',     label: 'Thêm danh mục',                 target_type: 'Category', action_type: 'CREATE', description: 'Tạo danh mục sản phẩm mới' },
    { code: 'CATEGORY_UPDATE',     label: 'Cập nhật danh mục',             target_type: 'Category', action_type: 'UPDATE', description: 'Chỉnh sửa thông tin danh mục sản phẩm' },
    { code: 'CATEGORY_DELETE',     label: 'Xoá danh mục',                  target_type: 'Category', action_type: 'DELETE', description: 'Xoá danh mục sản phẩm khỏi hệ thống' },

    // ── ORDER ─────────────────────────────────────────────────────────────────────
    { code: 'ORDER_CREATE_COD',    label: 'Đặt hàng (COD)',                target_type: 'Order',    action_type: 'CREATE', description: 'Khách hàng đặt hàng thanh toán khi nhận hàng' },
    { code: 'ORDER_CREATE_VNPAY',  label: 'Đặt hàng (VNPay)',              target_type: 'Order',    action_type: 'CREATE', description: 'Khách hàng đặt hàng qua cổng VNPay' },
    { code: 'ORDER_UPDATE_STATUS', label: 'Cập nhật trạng thái đơn hàng',  target_type: 'Order',    action_type: 'UPDATE', description: 'Thay đổi trạng thái xử lý hoặc thanh toán đơn hàng' },

    // ── COUPON ───────────────────────────────────────────────────────────────────
    { code: 'COUPON_CREATE',       label: 'Tạo mã giảm giá',               target_type: 'Coupon',   action_type: 'CREATE', description: 'Tạo coupon giảm giá mới' },
    { code: 'COUPON_UPDATE',       label: 'Cập nhật mã giảm giá',          target_type: 'Coupon',   action_type: 'UPDATE', description: 'Chỉnh sửa thông tin coupon' },
    { code: 'COUPON_DELETE',       label: 'Xoá mã giảm giá',               target_type: 'Coupon',   action_type: 'DELETE', description: 'Xoá coupon khỏi hệ thống' },

    // ── BLOG ─────────────────────────────────────────────────────────────────────
    { code: 'BLOG_CREATE',         label: 'Thêm bài viết',                 target_type: 'Blog',     action_type: 'CREATE', description: 'Tạo bài viết blog mới' },
    { code: 'BLOG_DELETE',         label: 'Xoá bài viết',                  target_type: 'Blog',     action_type: 'DELETE', description: 'Xoá bài viết blog khỏi hệ thống' },

    // ── COMMENT ──────────────────────────────────────────────────────────────────
    { code: 'COMMENT_DELETE',      label: 'Xoá bình luận',                 target_type: 'Comment',  action_type: 'DELETE', description: 'Admin xoá bình luận của người dùng' },

    // ── ROLE ─────────────────────────────────────────────────────────────────────
    { code: 'ROLE_CREATE',         label: 'Tạo vai trò mới',               target_type: 'Role',     action_type: 'CREATE', description: 'Tạo vai trò phân quyền mới trong hệ thống' },
    { code: 'ROLE_UPDATE',         label: 'Cập nhật vai trò',              target_type: 'Role',     action_type: 'UPDATE', description: 'Chỉnh sửa quyền hạn của vai trò' },
    { code: 'ROLE_DELETE',         label: 'Xoá vai trò',                   target_type: 'Role',     action_type: 'DELETE', description: 'Xoá vai trò khỏi hệ thống' },
];

async function seedActions() {
    const count = await ModelAction.countDocuments();
    if (count === 0) {
        await ModelAction.insertMany(ACTIONS);
        console.log(`[Seed] ${ACTIONS.length} actions seeded successfully`);
    }
}

module.exports = seedActions;
