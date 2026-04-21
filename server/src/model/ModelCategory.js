const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelCategory = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});

module.exports = mongoose.model('category', ModelCategory);
