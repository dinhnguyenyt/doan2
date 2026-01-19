const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelBlog = new Schema({
    id: { type: Number, default: 0 },
    img: { type: String, default: '' },
    title: { type: String, default: '' },
    des: { type: String, default: '' },
});

module.exports = mongoose.model('blog', ModelBlog);
