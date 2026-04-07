const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelProducts = new Schema({
    id: { type: Number, default: 0 },
    img: { type: String, default: '' },
    nameProducts: { type: String, default: 0 },
    priceNew: { type: Number, default: 0 },
    priceOld: { type: Number, default: 0 },
    des: { type: String, default: '' },
    checkProducts: { type: String, default: '' },
    category_id: { type: Schema.Types.ObjectId, ref: 'category' },
    stock_quantity: { type: Number, default: 100 },
});

module.exports = mongoose.model('products', ModelProducts);
