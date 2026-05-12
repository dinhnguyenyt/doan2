const mongoose = require('mongoose');

const ModelAction = new mongoose.Schema({
    code:        { type: String, required: true, unique: true },
    label:       { type: String, required: true },
    target_type: { type: String, required: true },
    action_type: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    description: { type: String, default: '' },
    is_active:   { type: Boolean, default: true },
    created_at:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('action', ModelAction);
