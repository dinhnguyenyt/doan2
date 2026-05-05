const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelWishlist = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    created_at: { type: Date, default: Date.now },
});

ModelWishlist.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('wishlist', ModelWishlist);
