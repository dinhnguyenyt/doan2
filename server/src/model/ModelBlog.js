const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelBlog = new Schema({
    id: { type: Number, default: 0 },
    img: { type: String, default: '' },
    title: { type: String, default: '' },
    des: { type: String, default: '' },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});

module.exports = mongoose.model('blog', ModelBlog);
