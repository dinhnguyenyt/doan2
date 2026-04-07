const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelCoupon = new Schema({
    code: { type: String, required: true, unique: true },
    discount_percent: { type: Number, required: true },
    expiry_date: { type: Date, required: true },
    usage_limit: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('coupon', ModelCoupon);
