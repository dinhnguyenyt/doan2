const ModelProducts = require('../../model/ModelProducts');
const ModelCart = require('../../model/ModelCart');
const ModelProductVariant = require('../../model/ModelProductVariant');

const { jwtDecode } = require('jwt-decode');

require('dotenv').config();

const { getAllDescendantIds } = require('../ControllerCategory/ControllerCategory');
const ModelCategory = require('../../model/ModelCategory');

class ControllerProducts {
    async GetProducts(req, res) {
        try {
            const { category_id } = req.query;
            let filter = {};
            if (category_id) {
                const allCats = await ModelCategory.find({}).lean();
                const descendantIds = getAllDescendantIds(category_id, allCats);
                const ids = [category_id, ...descendantIds];
                filter = { category_id: { $in: ids } };
            }
            const dataProducts = await ModelProducts.find(filter);
            return res.status(200).json(dataProducts.sort((a, b) => a.priceNew - b.priceNew));
        } catch (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    GetOneProduct(req, res) {
        const id = req.query.id;
        ModelProducts.findOne({ id: id }).then((dataProducts) => res.status(200).json(dataProducts));
    }
    async PostCart(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);

        try {
            const data = req.body;
            let total = 0;
            const products = [];

            for (const item of data) {
                const dataProducts = await ModelProducts.findOne({ id: item.id });

                if (dataProducts) {
                    let price = dataProducts.priceNew;

                    // Tính giá theo variant nếu có chọn size/color
                    if (item.size || item.color) {
                        const filter = { product_id: dataProducts._id };
                        if (item.size)  filter.size  = item.size;
                        if (item.color) filter.color = item.color;
                        const variant = await ModelProductVariant.findOne(filter);
                        if (variant) price = dataProducts.priceNew + (variant.price_adjustment || 0);
                    }

                    products.push({
                        nameProduct: dataProducts.nameProducts,
                        quantity: item.quantity,
                        price,
                        size:  item.size  || '',
                        color: item.color || '',
                    });
                }
            }

            products.reduce((acc, item) => {
                total += item.price * item.quantity;
            }, 0);

            // Luôn thay thế toàn bộ giỏ hàng (không cộng dồn)
            await ModelCart.findOneAndUpdate(
                { email: decoded.email },
                { email: decoded.email, products, sumPrice: total, couponCode: '' },
                { upsert: true, new: true }
            );

            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async GetCart(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);
        ModelCart.findOne({ email: decoded.email }).then((dataCart) => {
            return res.status(200).json([dataCart]);
        });
    }

    async ClearCart(req, res) {
        try {
            const token = req.cookies;
            const decoded = jwtDecode(token.Token);
            await ModelCart.findOneAndDelete({ email: decoded.email });
            return res.status(200).json({ message: 'Cart cleared' });
        } catch (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    async SearchProduct(req, res) {
        const keyword = req.query.nameProduct;
        ModelProducts.find({ nameProducts: { $regex: keyword, $options: 'i' } }).then((dataProducts) => {
            //
            if (dataProducts.length <= 0) {
                return res.status(200).json([
                    {
                        img: 'https://st3.depositphotos.com/23594922/31822/v/450/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg',
                        nameProducts: 'Không Tìm Thấy Sản Phẩm !!!',
                        price: 0,
                    },
                ]);
            } else {
                return res.status(200).json(dataProducts);
            }
        });
    }
}

module.exports = new ControllerProducts();
