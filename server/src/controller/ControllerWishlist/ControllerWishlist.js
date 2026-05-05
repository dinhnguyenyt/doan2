const ModelWishlist = require('../../model/ModelWishlist');
const ModelProducts = require('../../model/ModelProducts');
const ModelUser = require('../../model/ModelUser');
const { jwtDecode } = require('jwt-decode');

class ControllerWishlist {
    async Toggle(req, res) {
        try {
            const token = req.cookies.Token;
            if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });
            const decoded = jwtDecode(token);
            const user = await ModelUser.findOne({ email: decoded.email });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const { product_id } = req.body;
            const existing = await ModelWishlist.findOne({ user_id: user._id, product_id });
            if (existing) {
                await ModelWishlist.findByIdAndDelete(existing._id);
                await ModelProducts.updateOne({ _id: product_id }, { $inc: { like_count: -1 } });
                return res.status(200).json({ liked: false, message: 'Đã bỏ thích' });
            } else {
                await ModelWishlist.create({ user_id: user._id, product_id });
                await ModelProducts.updateOne({ _id: product_id }, { $inc: { like_count: 1 } });
                return res.status(200).json({ liked: true, message: 'Đã thích' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async CheckLiked(req, res) {
        try {
            const token = req.cookies.Token;
            if (!token) return res.status(200).json({ liked: false });
            const decoded = jwtDecode(token);
            const user = await ModelUser.findOne({ email: decoded.email });
            if (!user) return res.status(200).json({ liked: false });
            const existing = await ModelWishlist.findOne({ user_id: user._id, product_id: req.query.product_id });
            return res.status(200).json({ liked: !!existing });
        } catch {
            return res.status(200).json({ liked: false });
        }
    }
}

module.exports = new ControllerWishlist();
