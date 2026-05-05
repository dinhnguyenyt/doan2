const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelComments = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', default: null },
    blog_id: { type: Schema.Types.ObjectId, ref: 'blogs', default: null },
    comments: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comments', ModelComments);
