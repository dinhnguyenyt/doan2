const ModelProducts = require('../../model/ModelProducts');

const { jwtDecode } = require('jwt-decode');
const ModelUser = require('../../model/ModelUser');
const sendMail = require('../ControllerEmail/SendEmail');

require('dotenv').config();

class ControllerAdmin {
    async GetDataOrder(req, res) {
        try {
            const ModelOrder = require('../../model/ModelOrder');
            const ModelOrderItem = require('../../model/ModelOrderItem');
            
            const orders = await ModelOrder.find({}).sort({ created_at: -1 }).lean();
            const populatedOrders = await Promise.all(orders.map(async (order) => {
                const items = await ModelOrderItem.find({ order_id: order._id }).lean();
                return { ...order, products: items };
            }));
            return res.status(200).json(populatedOrders);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async GetUser(req, res) {
        ModelUser.find({}).then((data) => res.status(200).json(data));
    }

    async UpdateUserRole(req, res) {
        const { userId, role } = req.body;
        try {
            const updatedUser = await ModelUser.findByIdAndUpdate(
                userId,
                { role: role },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'Cập nhật phân quyền thành công', data: updatedUser });
        } catch (error) {
            console.error('Error updating role:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    async DeleteUser(req, res) {
        const { userId } = req.body;
        try {
            const deletedUser = await ModelUser.findByIdAndDelete(userId);
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'Xóa user thành công' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    async AddProduct(req, res) {
        const { nameProduct, imgProduct, priceProduct, desProduct, checkProduct, category_id, stock_quantity } = req.body; //
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
                category_id: category_id || null,
                stock_quantity: stock_quantity || 100,
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
        const { nameProduct, imgProduct, priceProduct, desProduct, category_id, stock_quantity } = req.body;

        ModelProducts.findOne({ id: req.body.id }).then((dataProduct) => {
            if (dataProduct) {
                dataProduct
                    .updateOne({
                        nameProducts: nameProduct || dataProduct.nameProducts,
                        img: imgProduct || dataProduct.img,
                        priceNew: priceProduct || dataProduct.priceNew,
                        des: desProduct || dataProduct.des,
                        category_id: category_id || dataProduct.category_id,
                        stock_quantity: stock_quantity !== undefined ? stock_quantity : dataProduct.stock_quantity,
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
        const ModelOrder = require('../../model/ModelOrder');
        const dataProduct = await ModelOrder.deleteOne({ email: req.body.idProduct });
        if (dataProduct) {
            sendMail(req.body.idProduct);
            return res.status(200).json({ message: 'Success' });
        }
    }
    
    async DeleteComment(req, res) {
        try {
            const ModelComments = require('../../model/ModelComments');
            const result = await ModelComments.findByIdAndDelete(req.body.id);
            if (result) {
                return res.status(200).json({ message: 'Bình luận đã bị xóa' });
            } else {
                return res.status(404).json({ message: 'Không tìm thấy bình luận' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async EditOrder(req, res) {
        const ModelOrder = require('../../model/ModelOrder');
        ModelOrder.findOne({ _id: req.body.id }).then((data) => {
            if (data) {
                data.updateOne({ statusOrder: true }).then((data) =>
                    res.status(200).json({ message: 'Chỉnh Sửa Thành Công !!!' }),
                );
            }
        });
    }
}

module.exports = new ControllerAdmin();
