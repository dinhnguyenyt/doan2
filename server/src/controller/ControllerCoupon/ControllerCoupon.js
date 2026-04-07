const ModelCoupon = require('../../model/ModelCoupon');

class ControllerCoupon {
    async GetCoupons(req, res) {
        try {
            const data = await ModelCoupon.find({});
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async AddCoupon(req, res) {
        const { code, discount_percent, expiry_date, usage_limit } = req.body;
        if (!code) return res.status(400).json({ message: 'Mã không được để trống' });

        try {
            const newCoupon = new ModelCoupon({
                code: code.toUpperCase(),
                discount_percent,
                expiry_date,
                usage_limit
            });
            await newCoupon.save();
            res.status(201).json({ message: 'Thêm Khuyến Mãi Thành Công', data: newCoupon });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error hoặc Mã đã tồn tại' });
        }
    }

    async DeleteCoupon(req, res) {
        try {
            const deleted = await ModelCoupon.findByIdAndDelete(req.body.id);
            if (deleted) {
                res.status(200).json({ message: 'Xóa khuyến mãi thành công' });
            } else {
                res.status(404).json({ message: 'Không tìm thấy mã' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async CheckCoupon(req, res) {
        const { code } = req.body;
        try {
            const coupon = await ModelCoupon.findOne({ code: code.toUpperCase() });
            if (!coupon) return res.status(404).json({ message: 'Mã không hợp lệ' });

            if (new Date() > new Date(coupon.expiry_date)) {
                return res.status(400).json({ message: 'Mã đã hết hạn' });
            }
            if (coupon.usage_limit <= 0) {
                return res.status(400).json({ message: 'Mã đã hết lượt sử dụng' });
            }

            return res.status(200).json({ message: 'Áp dụng mã thành công', discount_percent: coupon.discount_percent });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports = new ControllerCoupon();
