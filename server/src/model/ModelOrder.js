const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelOrder = new Schema({
    email: { type: String, required: true },
    sumPrice: { type: Number, default: 0 },
    statusOrder: { type: Boolean, default: false }, // false: Đang vận chuyển, true: Đã giao
    statusPayment: { type: Boolean, default: false }, // false: Chưa thanh toán / COD, true: Đã thanh toán (Momo/VNPay)
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});

module.exports = mongoose.model('order', ModelOrder);
