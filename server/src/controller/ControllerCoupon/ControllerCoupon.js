const ModelCoupon = require('../../model/ModelCoupon');
const { jwtDecode } = require('jwt-decode');

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

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const newCoupon = new ModelCoupon({
                code: code.toUpperCase(),
                discount_percent,
                expiry_date,
                usage_limit,
                created_by: decoded.email,
                created_at: new Date(),
            });
            await newCoupon.save();
            res.status(201).json({ message: 'Thêm Khuyến Mãi Thành Công', data: newCoupon });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error hoặc Mã đã tồn tại' });
        }
    }

    async EditCoupon(req, res) {
        const { id, code, discount_percent, expiry_date, usage_limit } = req.body;
        if (!id || !code) return res.status(400).json({ message: 'ID và Mã không được để trống' });

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const updatedCoupon = await ModelCoupon.findByIdAndUpdate(id, {
                code: code.toUpperCase(),
                discount_percent,
                expiry_date,
                usage_limit,
                modified_by: decoded.email,
                modified_at: new Date(),
            }, { new: true });
            if (updatedCoupon) {
                res.status(200).json({ message: 'Cập nhật mã thành công', data: updatedCoupon });
            } else {
                res.status(404).json({ message: 'Không tìm thấy mã' });
            }
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

            const expiryEnd = new Date(coupon.expiry_date);
            expiryEnd.setHours(23, 59, 59, 999);
            if (new Date() > expiryEnd) {
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
