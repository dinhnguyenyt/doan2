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
});

module.exports = mongoose.model('products', ModelProducts);
