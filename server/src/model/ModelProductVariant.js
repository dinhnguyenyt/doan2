const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelProductVariant = new Schema({
    product_id: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    color: { type: String, default: '' },
    color_hex: { type: String, default: '' },
    size: { type: String, default: '' },
    size_note: { type: String, default: '' },
    stock_quantity: { type: Number, default: 0 },
    price_adjustment: { type: Number, default: 0 },
    img: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('product_variants', ModelProductVariant);
