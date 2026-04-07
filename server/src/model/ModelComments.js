const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelComments = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    comments: { type: String, default: "" },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comments', ModelComments);
