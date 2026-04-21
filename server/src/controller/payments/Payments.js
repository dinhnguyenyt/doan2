const ModelCart = require('../../model/ModelCart');
const ModelOrder = require('../../model/ModelOrder');
const ModelOrderItem = require('../../model/ModelOrderItem');
const ModelProducts = require('../../model/ModelProducts');
const ModelCoupon = require('../../model/ModelCoupon');
const { jwtDecode } = require('jwt-decode');

const { VNPay, ignoreLogger, ProductCode, VnpLocale } = require('vnpay');

class ControllerPayments {
    async PaymentsMomo(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);
        const email = decoded.email;
        const couponCode = req.body.couponCode;

        ModelCart.findOne({ email: email }).then(async (dataCart) => {
            if (dataCart) {
                let finalPrice = dataCart.sumPrice;
                let appliedCoupon = '';

                if (couponCode) {
                    const coupon = await ModelCoupon.findOne({ code: couponCode.toUpperCase() });
                    if (coupon && coupon.usage_limit > 0) {
                        const expiryEnd = new Date(coupon.expiry_date);
                        expiryEnd.setHours(23, 59, 59, 999);
                        if (new Date() <= expiryEnd) {
                            finalPrice = finalPrice * (1 - coupon.discount_percent / 100);
                            appliedCoupon = coupon.code;
                        }
                    }
                }

                // Lưu lại mã coupon vào cart để checkData sử dụng
                dataCart.couponCode = appliedCoupon;
                dataCart.sumPrice = finalPrice; // cập nhật giá luôn trong cart tạm thời
                await dataCart.save();

                const vnpay = new VNPay({
                    tmnCode: '7N2SECJJ',
                    secureSecret: '65W8KAP5EEC7F6E7WOL38QTF96XWWLTN',
                    vnpayHost: 'https://sandbox.vnpayment.vn',
                    testMode: true, // tùy chọn
                    hashAlgorithm: 'SHA512', // tùy chọn
                    enableLog: true, // tùy chọn
                    loggerFn: ignoreLogger, // tùy chọn
                });
                const paymentUrl = vnpay.buildPaymentUrl({
                    vnp_Amount: finalPrice,
                    vnp_IpAddr: '13.160.92.202',
                    vnp_TxnRef: dataCart._id.toString(),
                    vnp_OrderInfo: `Thanh toan don hang ${dataCart._id}`,
                    vnp_OrderType: ProductCode.Other,
                    vnp_ReturnUrl: 'http://localhost:5000/vnpay-return',
                    vnp_Locale: VnpLocale.VN,
                });
                return res.status(200).json(paymentUrl);
            }
        });
    }

    async checkData(req, res, next) {
        if (req.query.vnp_ResponseCode === '00') {
            const token = req.cookies;
            const decoded = jwtDecode(token.Token);
            ModelCart.findOne({ email: decoded.email }).then(async (dataCart) => {
                if (dataCart) {
                    const newOrder = new ModelOrder({
                        email: decoded.email,
                        sumPrice: dataCart.sumPrice, // Giá này đã được giảm bên PaymentsMomo
                        statusPayment: true,
                        statusOrder: false,
                    });
                    const savedOrder = await newOrder.save();

                    for (const item of dataCart.products) {
                        try {
                            const foundProduct = await ModelProducts.findOne({ nameProducts: item.nameProduct });
                            if (foundProduct) {
                                await ModelProducts.findByIdAndUpdate(foundProduct._id, {
                                    $inc: { stock_quantity: -item.quantity }
                                });
                                
                                const newOrderItem = new ModelOrderItem({
                                    order_id: savedOrder._id,
                                    product_id: foundProduct._id,
                                    nameProduct: item.nameProduct,
                                    quantity: item.quantity,
                                    price: item.price
                                });
                                await newOrderItem.save();
                            }
                        } catch (e) {
                            console.error('Error saving order item:', e);
                        }
                    }

                    // Tự động trừ lượt dùng Coupon nếu có mã
                    if (dataCart.couponCode) {
                        const coupon = await ModelCoupon.findOne({ code: dataCart.couponCode });
                        if (coupon && coupon.usage_limit > 0) {
                            coupon.usage_limit -= 1;
                            await coupon.save();
                        }
                    }

                    await dataCart.deleteOne({ _id: dataCart._id });
                    return res.status(200).json({ message: 'Thanh toan thanh cong !!!' });
                }
            });
        }
    }

    async GetProductsSuccess(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);
        
        try {
            const orders = await ModelOrder.find({ email: decoded.email }).sort({ created_at: -1 }).lean();
            const populatedOrders = await Promise.all(orders.map(async (order) => {
                const items = await ModelOrderItem.find({ order_id: order._id }).lean();
                return { ...order, products: items };
            }));
            return res.status(200).json(populatedOrders);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server Error' });
        }
    }

    async Payments(req, res) {
        try {
            const token = req.cookies;
            if (!token || !token.Token) {
                return res.status(403).json({ message: 'Bạn Cần Đăng Nhập Lại !!!' });
            }

            const decoded = jwtDecode(token.Token);
            if (!decoded.email) {
                return res.status(403).json({ message: 'Bạn Cần Đăng Nhập Lại !!!' });
            }

            const dataCart = await ModelCart.findOne({ email: decoded.email });
            if (!dataCart) {
                return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
            }

            let finalPrice = dataCart.sumPrice;
            const couponCode = req.body.couponCode;
            if (couponCode) {
                const coupon = await ModelCoupon.findOne({ code: couponCode.toUpperCase() });
                if (coupon && coupon.usage_limit > 0) {
                    const expiryEnd = new Date(coupon.expiry_date);
                    expiryEnd.setHours(23, 59, 59, 999);
                    if (new Date() <= expiryEnd) {
                        finalPrice = finalPrice * (1 - coupon.discount_percent / 100);
                        coupon.usage_limit -= 1;
                        await coupon.save();
                    }
                }
            }

            const newOrder = new ModelOrder({
                email: decoded.email,
                sumPrice: finalPrice,
                statusPayment: false,
                statusOrder: false,
            });
            const savedOrder = await newOrder.save();

            for (const item of dataCart.products) {
                const foundProduct = await ModelProducts.findOne({ nameProducts: item.nameProduct });
                if (foundProduct) {
                    await ModelProducts.findByIdAndUpdate(foundProduct._id, {
                        $inc: { stock_quantity: -item.quantity }
                    });

                    const newOrderItem = new ModelOrderItem({
                        order_id: savedOrder._id,
                        product_id: foundProduct._id,
                        nameProduct: item.nameProduct,
                        quantity: item.quantity,
                        price: item.price
                    });
                    await newOrderItem.save();
                }
            }

            await dataCart.deleteOne({ _id: dataCart._id });
            return res.status(200).json({ message: 'Payment successful', dataCart });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi', error: error.message });
        }
    }
}

module.exports = new ControllerPayments();
