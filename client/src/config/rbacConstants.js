import { faBlog, faCartPlus, faFile, faHome, faUser, faComment, faTag, faShield, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

export const ALL_MENUS = [
    { key: 'dash',     label: 'Dashboard',    icon: faHome },
    { key: 'order',    label: 'Đơn hàng',     icon: faFile },
    { key: 'product',  label: 'Sản phẩm',     icon: faCartPlus },
    { key: 'category', label: 'Danh mục',     icon: faTag },
    { key: 'coupon',   label: 'Mã giảm giá',  icon: faTag },
    { key: 'customer', label: 'Khách hàng',   icon: faUser },
    { key: 'blog',     label: 'Blog',         icon: faBlog },
    { key: 'comment',  label: 'Bình luận',    icon: faComment },
    { key: 'role',     label: 'Phân quyền',   icon: faShield },
    { key: 'history',  label: 'Lịch sử',      icon: faClockRotateLeft },
];

export const ALL_ACTIONS = [
    { key: 'order:edit',           label: 'Cập nhật trạng thái đơn hàng', group: 'Đơn hàng' },
    { key: 'order:delete',         label: 'Xóa đơn hàng',                 group: 'Đơn hàng' },
    { key: 'product:create',       label: 'Thêm sản phẩm',                group: 'Sản phẩm' },
    { key: 'product:edit',         label: 'Sửa sản phẩm',                 group: 'Sản phẩm' },
    { key: 'product:delete',       label: 'Xóa sản phẩm',                 group: 'Sản phẩm' },
    { key: 'category:create',      label: 'Thêm danh mục',                group: 'Danh mục' },
    { key: 'category:edit',        label: 'Sửa danh mục',                 group: 'Danh mục' },
    { key: 'category:delete',      label: 'Xóa danh mục',                 group: 'Danh mục' },
    { key: 'coupon:create',        label: 'Thêm mã giảm giá',             group: 'Mã giảm giá' },
    { key: 'coupon:edit',          label: 'Sửa mã giảm giá',              group: 'Mã giảm giá' },
    { key: 'coupon:delete',        label: 'Xóa mã giảm giá',              group: 'Mã giảm giá' },
    { key: 'customer:edit',        label: 'Sửa thông tin khách hàng',     group: 'Khách hàng' },
    { key: 'customer:delete',      label: 'Xóa khách hàng',               group: 'Khách hàng' },
    { key: 'customer:change_role', label: 'Đổi quyền khách hàng',         group: 'Khách hàng' },
    { key: 'blog:create',          label: 'Thêm bài viết',                group: 'Blog' },
    { key: 'blog:edit',            label: 'Sửa bài viết',                 group: 'Blog' },
    { key: 'blog:delete',          label: 'Xóa bài viết',                 group: 'Blog' },
    { key: 'comment:delete',       label: 'Xóa bình luận',                group: 'Bình luận' },
    { key: 'role:manage',          label: 'Quản lý phân quyền',           group: 'Phân quyền' },
];

export const ACTION_GROUPS = [...new Set(ALL_ACTIONS.map((a) => a.group))];
