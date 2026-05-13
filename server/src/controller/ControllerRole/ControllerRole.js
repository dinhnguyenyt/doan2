const ModelRole = require('../../model/ModelRole');
const { jwtDecode } = require('jwt-decode');
const createAuditLog = require('../../utils/auditLog');

const ALL_MENUS = ['dash', 'order', 'product', 'category', 'coupon', 'customer', 'blog', 'comment', 'role', 'history'];

const ALL_ACTIONS = [
    'order:edit', 'order:delete',
    'product:create', 'product:edit', 'product:delete',
    'category:create', 'category:edit', 'category:delete',
    'coupon:create', 'coupon:edit', 'coupon:delete',
    'customer:edit', 'customer:delete', 'customer:change_role',
    'blog:create', 'blog:edit', 'blog:delete',
    'comment:delete',
    'role:manage',
];

const INITIAL_ROLES = [
    {
        name: 'admin',
        label: 'Quản trị viên',
        description: 'Toàn quyền hệ thống',
        server_level: 'admin',
        menus: ALL_MENUS,
        actions: ALL_ACTIONS,
        is_system: true,
    },
    {
        name: 'manager',
        label: 'Quản lý',
        description: 'Quản lý vận hành: đơn hàng, sản phẩm, danh mục, mã giảm giá',
        server_level: 'manager',
        menus: ['dash', 'order', 'product', 'category', 'coupon', 'customer', 'blog', 'comment'],
        actions: [
            'order:edit',
            'product:create', 'product:edit',
            'category:create', 'category:edit',
            'coupon:create', 'coupon:edit',
            'blog:create', 'blog:edit', 'blog:delete',
            'comment:delete',
        ],
        is_system: true,
    },
    {
        name: 'staff',
        label: 'Nhân viên',
        description: 'Xử lý đơn hàng, quản lý blog và bình luận',
        server_level: 'staff',
        menus: ['dash', 'order', 'product', 'category', 'blog', 'comment'],
        actions: ['order:edit', 'blog:create', 'blog:edit', 'comment:delete'],
        is_system: true,
    },
    {
        name: 'user',
        label: 'Người dùng',
        description: 'Không có quyền vào trang admin',
        server_level: 'none',
        menus: [],
        actions: [],
        is_system: true,
    },
];

const ControllerRole = {
    async SeedRoles() {
        const count = await ModelRole.countDocuments();
        if (count === 0) {
            await ModelRole.insertMany(INITIAL_ROLES);
            console.log('Roles seeded successfully');
        } else {
            // Đồng bộ menus/actions cho system roles khi có thay đổi
            for (const role of INITIAL_ROLES.filter((r) => r.is_system)) {
                await ModelRole.updateOne(
                    { name: role.name, is_system: true },
                    { $set: { menus: role.menus, actions: role.actions } },
                );
            }
        }
    },

    async GetRoles(req, res) {
        try {
            const roles = await ModelRole.find().sort({ created_at: 1 });
            res.status(200).json(roles);
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    async GetMyPermissions(req, res) {
        try {
            const token = req.cookies?.Token;
            if (!token) return res.status(200).json({ menus: [], actions: [] });
            const decoded = jwtDecode(token);
            const userRole = decoded.role || (decoded.admin ? 'admin' : 'user');
            const roleDoc = await ModelRole.findOne({ name: userRole });
            res.status(200).json({
                menus: roleDoc?.menus || [],
                actions: roleDoc?.actions || [],
            });
        } catch {
            res.status(200).json({ menus: [], actions: [] });
        }
    },

    async GetMetadata(req, res) {
        res.status(200).json({ menus: ALL_MENUS, actions: ALL_ACTIONS });
    },

    async AddRole(req, res) {
        try {
            const token = req.cookies?.Token;
            const decoded = jwtDecode(token);
            const { name, label, description, server_level, menus, actions } = req.body;

            if (!name || !label) return res.status(400).json({ message: 'Thiếu tên hoặc nhãn role' });
            const existing = await ModelRole.findOne({ name });
            if (existing) return res.status(400).json({ message: 'Tên role đã tồn tại' });

            const newRole = await ModelRole.create({
                name: name.toLowerCase().replace(/\s+/g, '_'),
                label,
                description: description || '',
                server_level: server_level || 'none',
                menus: menus || [],
                actions: actions || [],
                is_system: false,
                created_by: decoded.email,
            });

            createAuditLog(req, {
                action_code: 'ROLE_CREATE',
                target_id: newRole._id,
                target_label: `Role: ${newRole.name}`,
                data_before: null,
                data_after: newRole,
            });

            res.status(201).json({ message: 'Tạo role thành công', role: newRole });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    },

    async EditRole(req, res) {
        try {
            const token = req.cookies?.Token;
            const decoded = jwtDecode(token);
            const { id, label, description, server_level, menus, actions } = req.body;

            const roleDoc = await ModelRole.findById(id);
            if (!roleDoc) return res.status(404).json({ message: 'Không tìm thấy role' });

            const dataBefore = roleDoc.toObject();

            if (label !== undefined) roleDoc.label = label;
            if (description !== undefined) roleDoc.description = description;
            if (server_level !== undefined && !roleDoc.is_system) roleDoc.server_level = server_level;
            if (menus !== undefined) roleDoc.menus = menus;
            if (actions !== undefined) roleDoc.actions = actions;
            roleDoc.modified_by = decoded.email;
            roleDoc.modified_at = new Date();

            await roleDoc.save();

            createAuditLog(req, {
                action_code: 'ROLE_UPDATE',
                target_id: id,
                target_label: `Role: ${roleDoc.name}`,
                data_before: dataBefore,
                data_after: roleDoc,
            });

            res.status(200).json({ message: 'Cập nhật role thành công', role: roleDoc });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    },

    async DeleteRole(req, res) {
        try {
            const { id } = req.body;
            const roleDoc = await ModelRole.findById(id);
            if (!roleDoc) return res.status(404).json({ message: 'Không tìm thấy role' });
            if (roleDoc.is_system) return res.status(400).json({ message: 'Không thể xóa role hệ thống' });

            await ModelRole.findByIdAndDelete(id);

            createAuditLog(req, {
                action_code: 'ROLE_DELETE',
                target_id: id,
                target_label: `Role: ${roleDoc.name}`,
                data_before: roleDoc,
                data_after: null,
            });

            res.status(200).json({ message: 'Xóa role thành công' });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    },
};

module.exports = ControllerRole;
