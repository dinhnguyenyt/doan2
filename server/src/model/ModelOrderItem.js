const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelOrderItem = new Schema({
    order_id: { type: Schema.Types.ObjectId, ref: 'order', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    nameProduct: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

module.exports = mongoose.model('orderItem', ModelOrderItem);
