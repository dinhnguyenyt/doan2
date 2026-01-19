const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelCart = new Schema({
    id: { type: Number, default: 0 },
    email: { type: String, default: '' },
    products: [
        {
            nameProduct: { type: String, default: '' },
            quantity: { type: Number, default: 0 },
            price: { type: Number, default: 0 },
        },
    ],
    sumPrice: { type: Number, default: 0 },
});

module.exports = mongoose.model('Cart', ModelCart);
