const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelCoupon = new Schema({
    code: { type: String, required: true, unique: true },
    discount_percent: { type: Number, required: true },
    expiry_date: { type: Date, required: true },
    usage_limit: { type: Number, default: 0 },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});

module.exports = mongoose.model('coupon', ModelCoupon);
