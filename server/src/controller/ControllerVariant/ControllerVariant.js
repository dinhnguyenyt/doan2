const ModelProductVariant = require('../../model/ModelProductVariant');

class ControllerVariant {
    async GetVariants(req, res) {
        try {
            const data = await ModelProductVariant.find({ product_id: req.params.product_id });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async AddVariant(req, res) {
        try {
            const { product_id, color, color_hex, size, size_note, stock_quantity, price_adjustment, img } = req.body;
            const variant = new ModelProductVariant({ product_id, color, color_hex, size, size_note, stock_quantity: Number(stock_quantity) || 0, price_adjustment: Number(price_adjustment) || 0, img });
            await variant.save();
            res.status(200).json({ message: 'Thêm biến thể thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async EditVariant(req, res) {
        try {
            const { id, color, color_hex, size, size_note, stock_quantity, price_adjustment, img } = req.body;
            await ModelProductVariant.findByIdAndUpdate(id, { color, color_hex, size, size_note, stock_quantity: Number(stock_quantity), price_adjustment: Number(price_adjustment), img });
            res.status(200).json({ message: 'Cập nhật biến thể thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async DeleteVariant(req, res) {
        try {
            await ModelProductVariant.findByIdAndDelete(req.body.id);
            res.status(200).json({ message: 'Xóa biến thể thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = new ControllerVariant();
