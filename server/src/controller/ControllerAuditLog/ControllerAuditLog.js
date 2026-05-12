const ModelAuditLog = require('../../model/ModelAuditLog');
const ModelAction = require('../../model/ModelAction');

function computeDiff(before, after) {
    if (!before || !after) return [];
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const diff = [];
    for (const key of allKeys) {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
            diff.push({ field: key, before: before[key], after: after[key] });
        }
    }
    return diff;
}

const ControllerAuditLog = {
    async GetAuditLogs(req, res) {
        try {
            const { page = 1, limit = 20, action_code, action_type, target_type, actor_email, from, to } = req.query;
            const filter = {};
            if (action_code) filter.action_code = action_code;
            if (action_type) filter.action_type = action_type;
            if (target_type) filter.target_type = target_type;
            if (actor_email) filter.actor_email = { $regex: actor_email, $options: 'i' };
            if (from || to) {
                filter.created_at = {};
                if (from) filter.created_at.$gte = new Date(from);
                if (to) filter.created_at.$lte = new Date(`${to}T23:59:59.999Z`);
            }

            const skip = (Number(page) - 1) * Number(limit);
            const [data, total] = await Promise.all([
                ModelAuditLog.find(filter).sort({ created_at: -1 }).skip(skip).limit(Number(limit)).lean(),
                ModelAuditLog.countDocuments(filter),
            ]);

            // Enrich với label từ actions collection
            const codes = [...new Set(data.map((d) => d.action_code))];
            const actions = await ModelAction.find({ code: { $in: codes } }).lean();
            const actionMap = {};
            for (const a of actions) actionMap[a.code] = a;

            const result = data.map((d) => ({
                ...d,
                action_label: actionMap[d.action_code]?.label || d.action_code,
            }));

            return res.status(200).json({ data: result, total, page: Number(page), limit: Number(limit) });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    async GetAuditLogById(req, res) {
        try {
            const log = await ModelAuditLog.findById(req.params.id).lean();
            if (!log) return res.status(404).json({ message: 'Không tìm thấy bản ghi' });

            const actionDoc = await ModelAction.findOne({ code: log.action_code }).lean();
            const diff = computeDiff(log.data_before, log.data_after);

            return res.status(200).json({
                ...log,
                action_label: actionDoc?.label || log.action_code,
                diff,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    async GetAuditLogsByTarget(req, res) {
        try {
            const { type, id } = req.params;
            const data = await ModelAuditLog.find({ target_type: type, target_id: id })
                .sort({ created_at: -1 })
                .lean();

            const codes = [...new Set(data.map((d) => d.action_code))];
            const actions = await ModelAction.find({ code: { $in: codes } }).lean();
            const actionMap = {};
            for (const a of actions) actionMap[a.code] = a;

            const result = data.map((d) => ({
                ...d,
                action_label: actionMap[d.action_code]?.label || d.action_code,
                diff: computeDiff(d.data_before, d.data_after),
            }));

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    async GetActions(req, res) {
        try {
            const data = await ModelAction.find({ is_active: true }).sort({ target_type: 1, action_type: 1 }).lean();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },
};

module.exports = ControllerAuditLog;
