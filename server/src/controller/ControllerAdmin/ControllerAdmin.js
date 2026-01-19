const ModelPaymentsSuccess = require('../../model/ModelPaymentSuccess');
const ModelProducts = require('../../model/ModelProducts');

const { jwtDecode } = require('jwt-decode');
const ModelUser = require('../../model/ModelUser');
const sendMail = require('../ControllerEmail/SendEmail');

require('dotenv').config();

class ControllerAdmin {
    async GetDataOrder(req, res) {
        ModelPaymentsSuccess.find({}).then((data) => res.status(200).json(data));
    }

    async GetUser(req, res) {
        ModelUser.find({}).then((data) => res.status(200).json(data));
    }

    async AddProduct(req, res) {
        const { nameProduct, imgProduct, priceProduct, desProduct, checkProduct } = req.body; //
        try {
            let dataProduct = await ModelProducts.findOne({}).sort({ id: 'desc' }).exec();

            let newProductId = 1;
            if (dataProduct) {
                newProductId = dataProduct.id + 1;
            }

            const newProduct = new ModelProducts({
                id: newProductId,
                nameProducts: nameProduct,
                img: imgProduct,
                priceNew: priceProduct,
                des: desProduct,
                checkProducts: checkProduct,
            });

            await newProduct.save();
            return res.status(200).json({ message: 'Thêm Sản Phẩm Thành Công !!!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async DeleteProduct(req, res) {
        ModelProducts.deleteOne({ id: req.body.id }).then((dataProduct) =>
            res.status(200).json({ message: 'Xóa Sản Phẩm Thành Công !!!', dataProduct }),
        );
    }

    async EditProduct(req, res) {
        const { nameProduct, imgProduct, priceProduct, desProduct } = req.body;

        ModelProducts.findOne({ id: req.body.id }).then((dataProduct) => {
            if (dataProduct) {
                dataProduct
                    .updateOne({
                        nameProducts: nameProduct || dataProduct.nameProducts,
                        img: imgProduct || dataProduct.img,
                        priceNew: priceProduct || dataProduct.priceNew,
                        des: desProduct || dataProduct.des,
                    })
                    .then();
                return res.status(200).json({ message: 'Sửa Thành Công !!!' });
            } else {
                return;
            }
        });
    }

    async GetDataAuth(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);
        ModelUser.findOne({ email: decoded.email }).then((dataUser) => res.status(200).json({ dataUser }));
    }

    async checkProduct(req, res) {
        const dataProduct = await ModelPaymentsSuccess.deleteOne({ email: req.body.idProduct });
        if (dataProduct) {
            sendMail(req.body.idProduct);
            return res.status(200).json({ message: 'Success' });
        }
    }
    async EditOrder(req, res) {
        ModelPaymentsSuccess.findOne({ _id: req.body.id }).then((data) => {
            if (data) {
                data.updateOne({ statusOrder: true }).then((data) =>
                    res.status(200).json({ message: 'Chỉnh Sửa Thành Công !!!' }),
                );
            }
        });
    }
}

module.exports = new ControllerAdmin();
