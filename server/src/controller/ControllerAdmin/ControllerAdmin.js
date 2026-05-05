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
        const decoded = jwtDecode(req.cookies.Token);
        try {
            const updatedUser = await ModelUser.findByIdAndUpdate(
                userId,
                { role, modified_by: decoded.email, modified_at: new Date() },
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

    async EditUser(req, res) {
        const { userId, fullname, email, phone, surplus } = req.body;
        const decoded = jwtDecode(req.cookies.Token);
        try {
            const updatedUser = await ModelUser.findByIdAndUpdate(
                userId,
                {
                    fullname,
                    email,
                    phone,
                    surplus: surplus ? Number(surplus) : 0,
                    modified_by: decoded.email,
                    modified_at: new Date(),
                },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'Sửa thông tin user thành công!' });
        } catch (error) {
            console.error('Error editing user:', error);
            if (error.code === 11000) {
                 return res.status(400).json({ message: 'Email đã tồn tại' });
            }
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
        const { nameProduct, imgProduct, images, priceProduct, desProduct, checkProduct, category_id, stock_quantity, free_shipping, shipping_note, return_days, has_fashion_insurance } = req.body;
        const decoded = jwtDecode(req.cookies.Token);
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
                images: Array.isArray(images) ? images : (images ? images.split(',').map(s => s.trim()).filter(Boolean) : []),
                priceNew: priceProduct,
                des: desProduct,
                checkProducts: checkProduct,
                category_id: category_id || null,
                stock_quantity: stock_quantity || 100,
                free_shipping: free_shipping || false,
                shipping_note: shipping_note || '',
                return_days: return_days !== undefined ? Number(return_days) : 15,
                has_fashion_insurance: has_fashion_insurance || false,
                created_by: decoded.email,
                created_at: new Date(),
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
        const { nameProduct, imgProduct, images, priceProduct, desProduct, category_id, stock_quantity, free_shipping, shipping_note, return_days, has_fashion_insurance } = req.body;
        const decoded = jwtDecode(req.cookies.Token);

        ModelProducts.findOne({ id: req.body.id }).then((dataProduct) => {
            if (dataProduct) {
                dataProduct
                    .updateOne({
                        nameProducts: nameProduct || dataProduct.nameProducts,
                        img: imgProduct || dataProduct.img,
                        images: images !== undefined ? (Array.isArray(images) ? images : images.split(',').map(s => s.trim()).filter(Boolean)) : dataProduct.images,
                        priceNew: priceProduct || dataProduct.priceNew,
                        des: desProduct || dataProduct.des,
                        category_id: category_id || dataProduct.category_id,
                        stock_quantity: stock_quantity !== undefined ? stock_quantity : dataProduct.stock_quantity,
                        free_shipping: free_shipping !== undefined ? free_shipping : dataProduct.free_shipping,
                        shipping_note: shipping_note !== undefined ? shipping_note : dataProduct.shipping_note,
                        return_days: return_days !== undefined ? Number(return_days) : dataProduct.return_days,
                        has_fashion_insurance: has_fashion_insurance !== undefined ? has_fashion_insurance : dataProduct.has_fashion_insurance,
                        modified_by: decoded.email,
                        modified_at: new Date(),
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
        const decoded = jwtDecode(req.cookies.Token);
        const { id, statusOrder, statusPayment } = req.body;
        ModelOrder.findOne({ _id: id }).then((data) => {
            if (data) {
                data.updateOne({
                    statusOrder: statusOrder !== undefined ? statusOrder : data.statusOrder,
                    statusPayment: statusPayment !== undefined ? statusPayment : data.statusPayment,
                    modified_by: decoded.email,
                    modified_at: new Date(),
                }).then(() => res.status(200).json({ message: 'Chỉnh Sửa Thành Công !!!' }));
            }
        });
    }

    async GetCategoryById(req, res) {
        try {
            const ModelCategory = require('../../model/ModelCategory');
            const data = await ModelCategory.findById(req.params.id);
            res.json(data);
        } catch (error) { res.status(500).json({ error: error.message }); }
    }
    
    async GetProductById(req, res) {
        try {
            const ModelProducts = require('../../model/ModelProducts');
            let data = null;
            if (!isNaN(req.params.id)) {
                data = await ModelProducts.findOne({ id: Number(req.params.id) });
            }
            if (!data) data = await ModelProducts.findById(req.params.id);
            res.json(data);
        } catch (error) { res.status(500).json({ error: error.message }); }
    }
    
    async GetOrderById(req, res) {
        try {
            const ModelOrder = require('../../model/ModelOrder');
            const data = await ModelOrder.findById(req.params.id);
            res.json(data);
        } catch (error) { res.status(500).json({ error: error.message }); }
    }
    
    async GetCouponById(req, res) {
        try {
            const ModelCoupon = require('../../model/ModelCoupon');
            const data = await ModelCoupon.findById(req.params.id);
            res.json(data);
        } catch (error) { res.status(500).json({ error: error.message }); }
    }
    
    async GetBlogById(req, res) {
        try {
            const ModelBlog = require('../../model/ModelBlog');
            let data = null;
            if (!isNaN(req.params.id)) {
                data = await ModelBlog.findOne({ id: Number(req.params.id) });
            }
            if (!data) data = await ModelBlog.findById(req.params.id);
            res.json(data);
        } catch (error) { res.status(500).json({ error: error.message }); }
    }
    
    async GetCustomerById(req, res) {
        try {
            const ModelUser = require('../../model/ModelUser');
            const data = await ModelUser.findById(req.params.id);
            res.json(data);
        } catch (error) { res.status(500).json({ error: error.message }); }
    }
}

module.exports = new ControllerAdmin();
