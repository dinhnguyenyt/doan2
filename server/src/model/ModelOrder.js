const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelOrder = new Schema({
    email:              { type: String, required: true },
    sumPrice:           { type: Number, default: 0 },
    statusOrder:        { type: Boolean, default: false },
    statusPayment:      { type: Boolean, default: false },
    payment_method:     { type: String, enum: ['vnpay', 'cod'], default: 'cod' },
    vnp_txn_ref:        { type: String, default: '' },
    vnp_transaction_no: { type: String, default: '' },
    vnp_pay_date:       { type: String, default: '' },
    has_return_request: { type: Boolean, default: false },
    created_at:         { type: Date, default: Date.now },
    modified_by:        { type: String, default: '' },
    modified_at:        { type: Date, default: null },
});

module.exports = mongoose.model('order', ModelOrder);
