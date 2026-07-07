const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelBanner = new Schema({
    title: { type: String, default: '' },
    image: { type: String, required: true },
    link_type: { type: String, enum: ['product', 'category', 'url', 'none'], default: 'none' },
    product_id: { type: Schema.Types.ObjectId, ref: 'products', default: null },
    category_id: { type: Schema.Types.ObjectId, ref: 'category', default: null },
    external_url: { type: String, default: '' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    start_at: { type: Date, default: null },
    end_at: { type: Date, default: null },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});

module.exports = mongoose.model('banner', ModelBanner);
