const ModelProducts = require('../../model/ModelProducts');
const ModelCart = require('../../model/ModelCart');

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
                    products.push({
                        nameProduct: dataProducts.nameProducts,
                        quantity: item.quantity,
                        price: dataProducts.priceNew,
                    });
                }
            }

            products.reduce((acc, item) => {
                total += item.price * item.quantity;
            }, 0);

            // Tìm kiếm giỏ hàng hiện tại dựa trên email
            let cart = await ModelCart.findOne({ email: decoded.email });
            let newProductId = 1;
            if (cart) {
                newProductId = cart.id + 1;
            }
            if (cart) {
                // Nếu giỏ hàng đã tồn tại, thêm sản phẩm vào mảng products và cập nhật sumPrice
                cart.products.push(...products);

                cart.sumPrice += total;
            } else {
                // Nếu giỏ hàng chưa tồn tại, tạo giỏ hàng mới
                cart = new ModelCart({
                    id: newProductId,
                    email: decoded.email,
                    products: products,
                    sumPrice: total,
                });
            }

            await cart.save();

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
