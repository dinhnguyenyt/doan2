const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelRole = new Schema({
    name:         { type: String, required: true, unique: true },
    label:        { type: String, required: true },
    description:  { type: String, default: '' },
    server_level: { type: String, enum: ['admin', 'manager', 'staff', 'none'], default: 'none' },
    menus:        [{ type: String }],
    actions:      [{ type: String }],
    is_system:    { type: Boolean, default: false },
    created_by:   { type: String, default: 'system' },
    modified_by:  { type: String, default: '' },
    created_at:   { type: Date, default: Date.now },
    modified_at:  { type: Date, default: null },
});

module.exports = mongoose.model('role', ModelRole);
