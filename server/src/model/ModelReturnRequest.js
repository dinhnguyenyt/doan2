const mongoose = require('mongoose');

const ModelReturnRequest = new mongoose.Schema({
    order_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
    customer_email: { type: String, required: true },
    reason:         { type: String, required: true },
    description:    { type: String, default: '' },
    images:         [{ type: String }],
    status: {
        type: String,
        enum: ['PENDING_REVIEW', 'CONTACTING', 'WAITING_ITEM', 'ITEM_RECEIVED', 'APPROVED', 'REJECTED', 'REFUNDED'],
        default: 'PENDING_REVIEW',
    },
    staff_note:     { type: String, default: '' },
    reject_reason:  { type: String, default: '' },
    refund_amount:  { type: Number, default: 0 },
    refunded_by:    { type: String, default: '' },
    refunded_at:    { type: Date, default: null },
    created_at:     { type: Date, default: Date.now },
    modified_at:    { type: Date, default: null },
    modified_by:    { type: String, default: '' },
});

module.exports = mongoose.model('return_request', ModelReturnRequest);
