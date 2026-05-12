const ModelAuditLog = require('../model/ModelAuditLog');
const ModelAction = require('../model/ModelAction');
const { jwtDecode } = require('jwt-decode');

function sanitize(obj) {
    if (!obj) return null;
    const plain = typeof obj.toObject === 'function' ? obj.toObject() : { ...obj };
    delete plain.password;
    delete plain.__v;
    return plain;
}

function getActor(req) {
    // verifyToken middleware sets req.user = { email, admin, role }
    if (req.user) {
        return {
            actor_email: req.user.email || '',
            actor_role: req.user.role || (req.user.admin ? 'admin' : 'user'),
        };
    }
    try {
        const token = req.cookies?.Token;
        if (token) {
            const decoded = jwtDecode(token);
            return {
                actor_email: decoded.email || '',
                actor_role: decoded.role || (decoded.admin ? 'admin' : 'user'),
            };
        }
    } catch (_) {}
    return { actor_email: '', actor_role: '' };
}

async function createAuditLog(req, { action_code, target_id, target_label, data_before, data_after }) {
    try {
        const actionDoc = await ModelAction.findOne({ code: action_code }).lean();
        if (!actionDoc) return;

        const { actor_email, actor_role } = getActor(req);

        await ModelAuditLog.create({
            actor_email,
            actor_role,
            action_code,
            action_type: actionDoc.action_type,
            target_type: actionDoc.target_type,
            target_id: target_id ? String(target_id) : '',
            target_label: target_label || '',
            data_before: sanitize(data_before),
            data_after: sanitize(data_after),
            ip_address: req.headers['x-forwarded-for'] || req.ip || '',
            user_agent: req.headers['user-agent'] || '',
        });
    } catch (err) {
        console.error('[AuditLog] Error:', err.message);
    }
}

module.exports = createAuditLog;
