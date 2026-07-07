const ModelBanner = require('../../model/ModelBanner');
const { jwtDecode } = require('jwt-decode');
const createAuditLog = require('../../utils/auditLog');

function validateLink(link_type, product_id, category_id, external_url) {
    if (link_type === 'product' && !product_id) return 'Vui lòng chọn sản phẩm để gắn banner';
    if (link_type === 'category' && !category_id) return 'Vui lòng chọn danh mục để gắn banner';
    if (link_type === 'url' && !external_url) return 'Vui lòng nhập đường dẫn';
    return null;
}

class ControllerBanner {
    // Public - chỉ trả banner đang bật và còn trong thời hạn hiển thị
    async GetBanners(req, res) {
        try {
            const now = new Date();
            const data = await ModelBanner.find({
                is_active: true,
                $and: [
                    { $or: [{ start_at: null }, { start_at: { $lte: now } }] },
                    { $or: [{ end_at: null }, { end_at: { $gte: now } }] },
                ],
            })
                .sort({ display_order: 1 })
                .populate('product_id', 'nameProducts id')
                .populate('category_id', 'name');
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Admin - trả tất cả banner (kể cả tắt/hết hạn) để quản lý
    async GetAllBanners(req, res) {
        try {
            const data = await ModelBanner.find({})
                .sort({ display_order: 1 })
                .populate('product_id', 'nameProducts id')
                .populate('category_id', 'name');
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async AddBanner(req, res) {
        const {
            title, image, link_type, product_id, category_id,
            external_url, display_order, is_active, start_at, end_at,
        } = req.body;

        if (!image) return res.status(400).json({ message: 'Ảnh banner không được để trống' });
        const linkError = validateLink(link_type, product_id, category_id, external_url);
        if (linkError) return res.status(400).json({ message: linkError });

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const newBanner = new ModelBanner({
                title: title || '',
                image,
                link_type: link_type || 'none',
                product_id: link_type === 'product' ? product_id : null,
                category_id: link_type === 'category' ? category_id : null,
                external_url: link_type === 'url' ? external_url : '',
                display_order: display_order || 0,
                is_active: is_active !== undefined ? is_active : true,
                start_at: start_at || null,
                end_at: end_at || null,
                created_by: decoded.email,
                created_at: new Date(),
            });
            await newBanner.save();
            createAuditLog(req, {
                action_code: 'BANNER_CREATE',
                target_id: newBanner._id,
                target_label: `Banner: ${title || newBanner._id}`,
                data_before: null,
                data_after: newBanner,
            });
            res.status(201).json({ message: 'Thêm banner thành công', data: newBanner });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async EditBanner(req, res) {
        const {
            id, title, image, link_type, product_id, category_id,
            external_url, display_order, is_active, start_at, end_at,
        } = req.body;

        if (!id || !image) return res.status(400).json({ message: 'ID và ảnh banner không được để trống' });
        const linkError = validateLink(link_type, product_id, category_id, external_url);
        if (linkError) return res.status(400).json({ message: linkError });

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const oldBanner = await ModelBanner.findById(id);
            if (!oldBanner) return res.status(404).json({ message: 'Không tìm thấy banner' });

            const updatedBanner = await ModelBanner.findByIdAndUpdate(
                id,
                {
                    title: title || '',
                    image,
                    link_type: link_type || 'none',
                    product_id: link_type === 'product' ? product_id : null,
                    category_id: link_type === 'category' ? category_id : null,
                    external_url: link_type === 'url' ? external_url : '',
                    display_order: display_order || 0,
                    is_active: is_active !== undefined ? is_active : true,
                    start_at: start_at || null,
                    end_at: end_at || null,
                    modified_by: decoded.email,
                    modified_at: new Date(),
                },
                { new: true },
            );

            createAuditLog(req, {
                action_code: 'BANNER_UPDATE',
                target_id: id,
                target_label: `Banner: ${oldBanner.title || id}`,
                data_before: oldBanner,
                data_after: updatedBanner,
            });

            res.status(200).json({ message: 'Cập nhật banner thành công', data: updatedBanner });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async DeleteBanner(req, res) {
        try {
            const deleted = await ModelBanner.findByIdAndDelete(req.body.id);
            if (!deleted) return res.status(404).json({ message: 'Không tìm thấy banner' });

            createAuditLog(req, {
                action_code: 'BANNER_DELETE',
                target_id: req.body.id,
                target_label: `Banner: ${deleted.title || req.body.id}`,
                data_before: deleted,
                data_after: null,
            });

            res.status(200).json({ message: 'Xóa banner thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports = new ControllerBanner();
