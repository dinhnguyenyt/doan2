const ModelUser = require('../../model/ModelUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');
const sendMail = require('../ControllerEmail/SendEmail');
const sendMailMessage = require('../ControllerEmail/SendMailMessage');
const fs = require('fs');
const ModelComments = require('../../model/ModelComments');
require('dotenv').config();

class ControllerUser {
    async Register(req, res) {
        const { fullname, password, email, phone } = req.body;
        const saltRounds = 10;
        const myPlaintextPassword = password;
        try {
            const dataUser = await ModelUser.findOne({ fullname: fullname, email: email });
            if (dataUser) {
                return res.status(403).json({ message: 'Người Dùng Đã Tồn Tại !!!' });
            } else {
                bcrypt.hash(myPlaintextPassword, saltRounds, async function (err, hash) {
                    const newUser = new ModelUser({
                        fullname,
                        password: hash,
                        email,
                        phone: phone,
                    });
                    await newUser.save();
                    return res.status(200).json({ message: 'Đăng Ký Thành Công !!!' });
                });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Đã xảy ra lỗi !!!' });
        }
    }

    async Login(req, res, next) {
        const { password, email } = req.body;
        const dataUser = await ModelUser.findOne({ email });
        if (!dataUser) {
            return res.status(401).json({ message: 'Email Hoặc Mật Không Chính Xác !!!' });
        }
        const match = await bcrypt.compare(password, dataUser.password);
        if (match) {
            const admin = dataUser.isAdmin;
            const role = dataUser.role || (admin ? 'admin' : 'user'); // Lấy role từ DB hoặc fallback
            const token = jwt.sign({ email, admin, role }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });
            res.setHeader('Set-Cookie', `Token=${token}  ; max-age=3600 ;path=/`).json({
                message: 'Đăng Nhập Thành Công !!!',
                role: role // Trả về role cho client dễ dàng lưu vào Redux
            });
        } else {
            return res.status(401).json({ message: 'Email Hoặc Mật Khẩu Không Chính Xác !!!' });
        }
    }
    async GetUser(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);
        if (decoded) {
            ModelUser.findOne({ email: decoded.email }).then((dataUser) => {
                return res.status(200).json(dataUser);
            });
        } else {
            return res.status(401).json({ message: 'Có Lỗi Xảy Ra !!!' });
        }
    }
    async ChangePass(req, res, next) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);
        const dataUser = await ModelUser.findOne({ email: decoded.email });
        if (dataUser) {
            const saltRounds = 10;
            const myPlaintextPassword = req.body.newPass;
            bcrypt.hash(myPlaintextPassword, saltRounds, async function (err, hash) {
                dataUser.updateOne({ password: hash }).then();
                return res.status(200).json({ message: 'Change Password Success' });
            });
        } else {
            return res.status(403).json({ message: 'error !!!' });
        }
    }
    Logout(req, res) {
        res.setHeader('Set-Cookie', `Token=${''};max-age=0 ;path=/`).json({});
    }
    async EditProfile(req, res) {
        try {
            const token = req.cookies.Token;
            const decoded = jwtDecode(token);
            const updateUser = await ModelUser.findOne({ email: decoded.email });

            if (updateUser) {
                const updatedUser = await ModelUser.updateOne(
                    { email: decoded.email },
                    {
                        email: req.body.email || updateUser.email,
                        phone: req.body.phone || updateUser.phone,
                    },
                );

                const admin = updateUser.isAdmin;
                const newToken = jwt.sign(
                    { email: req.body.email || updateUser.email, admin },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.EXPIRES_IN },
                );

                res.setHeader('Set-Cookie', `Token=${newToken}; Max-Age=3600; Path=/`);
                return res.status(200).json({ message: 'Cập nhật hồ sơ thành công' });
            } else {
                return res.status(403).json({ message: 'Lỗi !!!' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }
    async SendMessage(req, res) {
        const email = req.body.email;
        const message = req.body.message;
        sendMailMessage(email, message);
        return res.status(200).json({ message: 'Send Message Success' });
    }
    async ChangeAvatar(req, res, next) {
        try {
            const token = req.cookies.Token;
            const decoded = jwtDecode(token);
            const urlImg = req.file.filename;

            ModelUser.findOne({ email: decoded.email }).then((dataUser) => {
                if (!dataUser) {
                    return res.status(404).json({ error: 'User not found' });
                }
                if (dataUser.avatar === '1') {
                    ModelUser.updateOne({ email: decoded.email }, { avatar: urlImg, imageData: req.file.path })
                        .then(() => {
                            res.json({ imagePath: req.file.path });
                        })
                        .catch((error) => {
                            console.error('Error updating image:', error);
                            res.status(500).json({ error: 'Server error' });
                        });
                } else {
                    ModelUser.updateOne(
                        { email: decoded.email },
                        { avatar: req.file.filename, imageData: req.file.path },
                    )
                        .then(() => {
                            fs.unlinkSync(`uploads/avatars/${dataUser.avatar}`);
                            res.json({ imagePath: req.file.path });
                        })
                        .catch((error) => {
                            console.error('Error updating image:', error);
                            res.status(500).json({ error: 'Server error' });
                        });
                }
            });
        } catch (error) {
            console.error('Error saving image:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
    GetCommentProduct(req, res) {
        const { product_id, blog_id } = req.query;
        const filter = {};
        if (product_id) filter.product_id = product_id;
        if (blog_id) filter.blog_id = blog_id;
        ModelComments.find(filter).sort({ created_at: -1 }).populate('user_id', 'fullname email avatar').then((dataComments) => res.status(200).json(dataComments));
    }
    async PostComments(req, res) {
        const { comment, product_id, blog_id } = req.body;
        try {
            const token = req.cookies.Token;
            if (!token) return res.status(401).json({ message: 'Bạn cần đăng nhập để bình luận' });
            const decoded = jwtDecode(token);
            const user = await ModelUser.findOne({ email: decoded.email });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const newComments = new ModelComments({
                user_id: user._id,
                product_id: product_id || null,
                blog_id: blog_id || null,
                comments: comment,
            });
            await newComments.save();
            return res.status(200).json({ message: 'Success' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async GetOrder(req, res) {
        const token = req.cookies.Token;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const decoded = jwtDecode(token);
        if (decoded) {
            try {
                const ModelOrder = require('../../model/ModelOrder');
                const ModelOrderItem = require('../../model/ModelOrderItem');

                const orders = await ModelOrder.find({ email: decoded.email }).sort({ created_at: -1 }).lean();
                const populatedOrders = await Promise.all(orders.map(async (order) => {
                    const items = await ModelOrderItem.find({ order_id: order._id }).lean();
                    return { ...order, products: items };
                }));
                return res.status(200).json(populatedOrders);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    }
}

module.exports = new ControllerUser();
