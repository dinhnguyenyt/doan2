const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelUser = new Schema({
    fullname: { type: String, require },
    avatar: { type: String, default: '1' },
    email: { type: String, require },
    password: { type: String, require },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
    phone: { type: Number, default: 0 },
    surplus: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});

module.exports = mongoose.model('user', ModelUser);
