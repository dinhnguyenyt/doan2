const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelAddress = new Schema({
    email:        { type: String, required: true, unique: true },
    fullname:     { type: String, default: '' },
    phone:        { type: String, default: '' },
    company:      { type: String, default: '' },
    country:      { type: String, default: '' },
    address_line1:{ type: String, default: '' },
    address_line2:{ type: String, default: '' },
    city:         { type: String, default: '' },
    zip:          { type: String, default: '' },
    created_at:   { type: Date, default: Date.now },
    modified_at:  { type: Date, default: null },
});

module.exports = mongoose.model('address', ModelAddress);
