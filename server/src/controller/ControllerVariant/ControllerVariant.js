const ModelProductVariant = require('../../model/ModelProductVariant');

class ControllerVariant {
    async GetVariants(req, res) {
        try {
            const data = await ModelProductVariant.find({ product_id: req.params.product_id });
            res.status(200).json(data);
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Tạo mới một màu với mảng sizes ban đầu
    async AddVariant(req, res) {
        try {
            const { product_id, color, color_hex, img, sizes } = req.body;
            const variant = new ModelProductVariant({
                product_id,
                color,
                color_hex: color_hex || '',
                img: img || '',
                sizes: Array.isArray(sizes) ? sizes : [],
            });
            await variant.save();
            res.status(200).json({ message: 'Thêm màu biến thể thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Sửa thông tin màu (color name, hex, img) — không sửa sizes ở đây
    async EditVariant(req, res) {
        try {
            const { id, color, color_hex, img } = req.body;
            await ModelProductVariant.findByIdAndUpdate(id, { color, color_hex, img });
            res.status(200).json({ message: 'Cập nhật màu thành công' });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Xóa toàn bộ màu (và tất cả sizes của nó)
    async DeleteVariant(req, res) {
        try {
            await ModelProductVariant.findByIdAndDelete(req.body.id);
            res.status(200).json({ message: 'Xóa màu thành công' });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Thêm size vào một màu đã có
    async AddVariantSize(req, res) {
        try {
            const { variant_id, size, size_note, stock_quantity, price_adjustment } = req.body;
            const variant = await ModelProductVariant.findById(variant_id);
            if (!variant) return res.status(404).json({ message: 'Không tìm thấy màu' });
            variant.sizes.push({ size, size_note: size_note || '', stock_quantity: Number(stock_quantity) || 0, price_adjustment: Number(price_adjustment) || 0 });
            await variant.save();
            res.status(200).json({ message: 'Thêm size thành công', variant });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Xóa một size khỏi màu
    async DeleteVariantSize(req, res) {
        try {
            const { variant_id, size_id } = req.body;
            const variant = await ModelProductVariant.findById(variant_id);
            if (!variant) return res.status(404).json({ message: 'Không tìm thấy màu' });
            variant.sizes = variant.sizes.filter((s) => s._id.toString() !== size_id);
            await variant.save();
            res.status(200).json({ message: 'Xóa size thành công', variant });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = new ControllerVariant();
