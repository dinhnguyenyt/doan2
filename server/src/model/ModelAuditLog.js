const mongoose = require('mongoose');

const ModelAuditLog = new mongoose.Schema({
    actor_email:  { type: String, default: '' },
    actor_role:   { type: String, default: '' },
    action_code:  { type: String, required: true },
    action_type:  { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    target_type:  { type: String, required: true },
    target_id:    { type: String, default: '' },
    target_label: { type: String, default: '' },
    data_before:  { type: mongoose.Schema.Types.Mixed, default: null },
    data_after:   { type: mongoose.Schema.Types.Mixed, default: null },
    ip_address:   { type: String, default: '' },
    user_agent:   { type: String, default: '' },
    created_at:   { type: Date, default: Date.now },
});

ModelAuditLog.index({ created_at: -1 });
ModelAuditLog.index({ actor_email: 1, created_at: -1 });
ModelAuditLog.index({ target_type: 1, target_id: 1, created_at: -1 });
ModelAuditLog.index({ action_code: 1 });

module.exports = mongoose.model('audit_log', ModelAuditLog);
