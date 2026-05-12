const ModelProductVariant = require('../../model/ModelProductVariant');
const createAuditLog = require('../../utils/auditLog');

class ControllerVariant {
    async GetVariants(req, res) {
        try {
            const data = await ModelProductVariant.find({ product_id: req.params.product_id });
            res.status(200).json(data);
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

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

            createAuditLog(req, {
                action_code: 'VARIANT_CREATE',
                target_id: variant._id,
                target_label: `Biến thể: ${color} (product: ${product_id})`,
                data_before: null,
                data_after: variant,
            });

            res.status(200).json({ message: 'Thêm màu biến thể thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async EditVariant(req, res) {
        try {
            const { id, color, color_hex, img } = req.body;
            const oldVariant = await ModelProductVariant.findById(id);
            if (!oldVariant) return res.status(404).json({ message: 'Không tìm thấy biến thể' });

            await ModelProductVariant.findByIdAndUpdate(id, { color, color_hex, img });
            const updatedVariant = await ModelProductVariant.findById(id);

            createAuditLog(req, {
                action_code: 'VARIANT_UPDATE',
                target_id: id,
                target_label: `Biến thể: ${oldVariant.color}`,
                data_before: oldVariant,
                data_after: updatedVariant,
            });

            res.status(200).json({ message: 'Cập nhật màu thành công' });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async DeleteVariant(req, res) {
        try {
            const deleted = await ModelProductVariant.findByIdAndDelete(req.body.id);
            if (!deleted) return res.status(404).json({ message: 'Không tìm thấy biến thể' });

            createAuditLog(req, {
                action_code: 'VARIANT_DELETE',
                target_id: req.body.id,
                target_label: `Biến thể: ${deleted.color}`,
                data_before: deleted,
                data_after: null,
            });

            res.status(200).json({ message: 'Xóa màu thành công' });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async AddVariantSize(req, res) {
        try {
            const { variant_id, size, size_note, stock_quantity, price_adjustment } = req.body;
            const variant = await ModelProductVariant.findById(variant_id);
            if (!variant) return res.status(404).json({ message: 'Không tìm thấy màu' });

            const dataBefore = variant.toObject();
            variant.sizes.push({ size, size_note: size_note || '', stock_quantity: Number(stock_quantity) || 0, price_adjustment: Number(price_adjustment) || 0 });
            await variant.save();

            createAuditLog(req, {
                action_code: 'VARIANT_SIZE_ADD',
                target_id: variant_id,
                target_label: `Biến thể: ${variant.color} — thêm size ${size}`,
                data_before: dataBefore,
                data_after: variant,
            });

            res.status(200).json({ message: 'Thêm size thành công', variant });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async DeleteVariantSize(req, res) {
        try {
            const { variant_id, size_id } = req.body;
            const variant = await ModelProductVariant.findById(variant_id);
            if (!variant) return res.status(404).json({ message: 'Không tìm thấy màu' });

            const dataBefore = variant.toObject();
            const removedSize = variant.sizes.find((s) => s._id.toString() === size_id);
            variant.sizes = variant.sizes.filter((s) => s._id.toString() !== size_id);
            await variant.save();

            createAuditLog(req, {
                action_code: 'VARIANT_SIZE_DELETE',
                target_id: variant_id,
                target_label: `Biến thể: ${variant.color} — xoá size ${removedSize?.size || size_id}`,
                data_before: dataBefore,
                data_after: variant,
            });

            res.status(200).json({ message: 'Xóa size thành công', variant });
        } catch {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = new ControllerVariant();
