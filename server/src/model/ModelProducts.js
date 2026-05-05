const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelProducts = new Schema({
    id: { type: Number, default: 0 },
    img: { type: String, default: '' },
    images: [{ type: String }],
    nameProducts: { type: String, default: '' },
    priceNew: { type: Number, default: 0 },
    priceOld: { type: Number, default: 0 },
    des: { type: String, default: '' },
    checkProducts: { type: String, default: '' },
    category_id: { type: Schema.Types.ObjectId, ref: 'category' },
    stock_quantity: { type: Number, default: 100 },
    rating_avg: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    like_count: { type: Number, default: 0 },
    free_shipping: { type: Boolean, default: false },
    shipping_note: { type: String, default: '' },
    return_days: { type: Number, default: 15 },
    has_fashion_insurance: { type: Boolean, default: false },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});

module.exports = mongoose.model('products', ModelProducts);
