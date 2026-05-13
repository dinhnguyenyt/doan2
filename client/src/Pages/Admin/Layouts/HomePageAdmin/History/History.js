import { useEffect, useState, useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import request from '../../../../../config/Connect';
import { formatDateString } from '../../../../../utils/formatDate';

// ─── Hằng số ──────────────────────────────────────────────────────────────────

const ACTION_TYPE_LABELS = {
    CREATE: { label: 'Tạo mới', color: '#198754' },
    UPDATE: { label: 'Cập nhật', color: '#0d6efd' },
    DELETE: { label: 'Xóa', color: '#dc3545' },
};

const TARGET_TYPE_OPTIONS = [
    { value: '', label: 'Tất cả đối tượng' },
    { value: 'product', label: 'Sản phẩm' },
    { value: 'category', label: 'Danh mục' },
    { value: 'coupon', label: 'Mã giảm giá' },
    { value: 'user', label: 'Người dùng' },
    { value: 'order', label: 'Đơn hàng' },
    { value: 'blog', label: 'Blog' },
    { value: 'comment', label: 'Bình luận' },
    { value: 'role', label: 'Phân quyền' },
    { value: 'variant', label: 'Biến thể' },
    { value: 'payment', label: 'Thanh toán' },
];

const TARGET_TYPE_LABELS = Object.fromEntries(TARGET_TYPE_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]));

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = {
    currency: (v) => (v != null ? Number(v).toLocaleString('vi-VN') + ' ₫' : '—'),
    bool: (v) => (v ? 'Có' : 'Không'),
    percent: (v) => (v != null ? `${v}%` : '—'),
    date: (v) => formatDateString(v),
    rating: (v) => (v != null ? `${v}/5 ⭐` : '—'),
    truncate: (n) => (v) => (v ? (String(v).length > n ? String(v).slice(0, n) + '…' : String(v)) : '—'),
    plain: (v) => (v != null && v !== '' ? String(v) : '—'),
    array: (v) =>
        Array.isArray(v) && v.length > 0
            ? v.map((item, i) => (
                  <span key={i} className="badge bg-secondary me-1 mb-1" style={{ fontSize: '11px' }}>
                      {typeof item === 'object' ? JSON.stringify(item) : item}
                  </span>
              ))
            : <span className="text-muted">—</span>,
    img: (v) =>
        v ? (
            <img src={v} alt="" style={{ maxHeight: 80, maxWidth: 120, objectFit: 'cover', borderRadius: 4, border: '1px solid #dee2e6' }} />
        ) : (
            '—'
        ),
    colorHex: (v) =>
        v ? (
            <span>
                <span
                    style={{
                        display: 'inline-block',
                        width: 16,
                        height: 16,
                        background: v,
                        border: '1px solid #ccc',
                        borderRadius: 3,
                        verticalAlign: 'middle',
                        marginRight: 6,
                    }}
                />
                {v}
            </span>
        ) : (
            '—'
        ),
    orderStatus: (v) => (v ? 'Đã giao' : 'Đang giao/chờ xử lý'),
    paymentStatus: (v) => (v ? 'Đã thanh toán' : 'Chưa thanh toán (COD)'),
    sizes: (v) => {
        if (!Array.isArray(v) || v.length === 0) return '—';
        return (
            <table className="table table-sm table-bordered mb-0" style={{ fontSize: '12px' }}>
                <thead className="table-light">
                    <tr>
                        <th>Size</th>
                        <th>Ghi chú</th>
                        <th>Tồn kho</th>
                        <th>Chênh lệch giá</th>
                    </tr>
                </thead>
                <tbody>
                    {v.map((s, i) => (
                        <tr key={i}>
                            <td>{s.size || '—'}</td>
                            <td>{s.size_note || '—'}</td>
                            <td>{s.stock_quantity ?? '—'}</td>
                            <td>{s.price_adjustment != null ? fmt.currency(s.price_adjustment) : '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    },
};

// ─── Cấu hình fields theo entity type ─────────────────────────────────────────

const ENTITY_CONFIGS = {
    product: [
        { key: 'nameProducts', label: 'Tên sản phẩm' },
        { key: 'img', label: 'Ảnh đại diện', format: fmt.img },
        { key: 'priceNew', label: 'Giá hiện tại', format: fmt.currency },
        { key: 'priceOld', label: 'Giá gốc', format: fmt.currency },
        { key: 'checkProducts', label: 'Loại sản phẩm' },
        { key: 'stock_quantity', label: 'Tồn kho' },
        { key: 'category_id', label: 'ID danh mục', format: (v) => v ? String(v) : '—' },
        { key: 'rating_avg', label: 'Đánh giá trung bình' },
        { key: 'rating_count', label: 'Số lượt đánh giá' },
        { key: 'like_count', label: 'Lượt thích' },
        { key: 'free_shipping', label: 'Miễn phí vận chuyển', format: fmt.bool },
        { key: 'shipping_note', label: 'Ghi chú vận chuyển', format: fmt.plain },
        { key: 'return_days', label: 'Số ngày đổi trả' },
        { key: 'has_fashion_insurance', label: 'Bảo hiểm thời trang', format: fmt.bool },
        { key: 'des', label: 'Mô tả', format: fmt.truncate(300) },
    ],
    category: [
        { key: 'name', label: 'Tên danh mục' },
        { key: 'description', label: 'Mô tả', format: fmt.plain },
        { key: 'slug', label: 'Slug', format: fmt.plain },
        {
            key: 'parent_ids',
            label: 'Danh mục cha',
            format: (v) =>
                Array.isArray(v) && v.length > 0 ? (
                    v.map((id, i) => (
                        <span key={i} className="badge bg-secondary me-1" style={{ fontSize: '11px' }}>
                            {String(id)}
                        </span>
                    ))
                ) : (
                    <span className="text-muted">Danh mục gốc</span>
                ),
        },
    ],
    coupon: [
        { key: 'code', label: 'Mã giảm giá' },
        {
            key: 'type',
            label: 'Loại coupon',
            format: (v) => v === 'shipping'
                ? <span style={{ background: '#e6f4ea', color: '#198754', border: '1px solid #198754', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>Giảm phí vận chuyển</span>
                : <span style={{ background: '#e7f0ff', color: '#0d6efd', border: '1px solid #0d6efd', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>Giảm giá sản phẩm</span>,
        },
        { key: 'discount_percent', label: 'Mức giảm', format: fmt.percent },
        { key: 'expiry_date', label: 'Ngày hết hạn', format: fmt.date },
        {
            key: 'usage_limit',
            label: 'Giới hạn sử dụng',
            format: (v) => (v != null ? String(v) : <span className="text-muted">Không giới hạn</span>),
        },
    ],
    user: [
        { key: 'fullname', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'avatar', label: 'Ảnh đại diện', format: fmt.img },
        { key: 'role', label: 'Vai trò' },
        { key: 'phone', label: 'Số điện thoại', format: fmt.plain },
        { key: 'isAdmin', label: 'Là Admin', format: fmt.bool },
        { key: 'surplus', label: 'Số dư tài khoản', format: fmt.currency },
    ],
    order: [
        { key: 'email', label: 'Email khách hàng' },
        { key: 'sumPrice', label: 'Tổng tiền', format: fmt.currency },
        { key: 'statusOrder', label: 'Trạng thái giao hàng', format: fmt.orderStatus },
        { key: 'statusPayment', label: 'Trạng thái thanh toán', format: fmt.paymentStatus },
    ],
    blog: [
        { key: 'title', label: 'Tiêu đề' },
        { key: 'img', label: 'Ảnh', format: fmt.img },
        { key: 'des', label: 'Mô tả', format: fmt.truncate(300) },
    ],
    comment: [
        { key: 'comments', label: 'Nội dung bình luận', format: fmt.plain },
        { key: 'rating', label: 'Đánh giá', format: fmt.rating },
        { key: 'user_id', label: 'ID người dùng', format: (v) => (v ? String(v) : '—') },
        { key: 'product_id', label: 'ID sản phẩm', format: (v) => (v ? String(v) : '—') },
        { key: 'blog_id', label: 'ID bài viết', format: (v) => (v ? String(v) : '—') },
    ],
    role: [
        { key: 'name', label: 'Tên role' },
        { key: 'label', label: 'Nhãn hiển thị' },
        { key: 'description', label: 'Mô tả', format: fmt.plain },
        { key: 'server_level', label: 'Cấp độ server' },
        { key: 'is_system', label: 'System role', format: fmt.bool },
        { key: 'menus', label: 'Menu được phép', format: fmt.array },
        { key: 'actions', label: 'Quyền hành động', format: fmt.array },
    ],
    variant: [
        { key: 'product_id', label: 'ID sản phẩm', format: (v) => (v ? String(v) : '—') },
        { key: 'color', label: 'Tên màu', format: fmt.plain },
        { key: 'color_hex', label: 'Mã màu HEX', format: fmt.colorHex },
        { key: 'img', label: 'Ảnh màu', format: fmt.img },
        { key: 'sizes', label: 'Danh sách size', format: fmt.sizes },
    ],
};

// Trường audit không hiển thị trong entity detail
const AUDIT_FIELDS = new Set(['created_by', 'modified_by', 'created_at', 'modified_at', '__v', '_id', 'password', 'id']);

// ─── Components nhỏ ───────────────────────────────────────────────────────────

function BadgeType({ type }) {
    const info = ACTION_TYPE_LABELS[type] || { label: type, color: '#6c757d' };
    return (
        <span
            style={{
                background: info.color,
                color: '#fff',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 600,
            }}
        >
            {info.label}
        </span>
    );
}

function EntityDataTable({ data, targetType }) {
    if (!data) return null;

    const config = ENTITY_CONFIGS[targetType];

    // Nếu có config riêng, dùng config
    if (config) {
        const rows = config.filter(({ key }) => data[key] !== undefined && !AUDIT_FIELDS.has(key));
        if (rows.length === 0) return <p className="text-muted">Không có dữ liệu.</p>;
        return (
            <table className="table table-sm table-bordered align-middle" style={{ fontSize: '13px' }}>
                <tbody>
                    {rows.map(({ key, label, format }) => {
                        const raw = data[key];
                        const rendered = format ? format(raw) : (raw != null && raw !== '' ? String(raw) : '—');
                        return (
                            <tr key={key}>
                                <td style={{ width: '38%', fontWeight: 500, background: '#f8f9fa', whiteSpace: 'nowrap' }}>
                                    {label}
                                </td>
                                <td style={{ wordBreak: 'break-word' }}>{rendered}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    // Fallback: hiển thị tất cả field không phải audit
    const entries = Object.entries(data).filter(([k]) => !AUDIT_FIELDS.has(k));
    if (entries.length === 0) return <p className="text-muted">Không có dữ liệu.</p>;
    return (
        <table className="table table-sm table-bordered" style={{ fontSize: '13px' }}>
            <tbody>
                {entries.map(([k, v]) => (
                    <tr key={k}>
                        <td style={{ width: '38%', fontWeight: 500, background: '#f8f9fa' }}>
                            <code>{k}</code>
                        </td>
                        <td style={{ wordBreak: 'break-word' }}>
                            {v == null ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function UpdateDiffSection({ diff, targetType }) {
    if (!diff || diff.length === 0) return <p className="text-muted">Không ghi nhận thay đổi cụ thể.</p>;

    const config = ENTITY_CONFIGS[targetType] || [];
    const labelMap = Object.fromEntries(config.map(({ key, label }) => [key, label]));

    // Bỏ qua các field audit trong diff
    const rows = diff.filter(({ field }) => !AUDIT_FIELDS.has(field));
    if (rows.length === 0) return <p className="text-muted">Không ghi nhận thay đổi cụ thể.</p>;

    return (
        <table className="table table-sm table-bordered align-middle" style={{ fontSize: '13px' }}>
            <thead className="table-light">
                <tr>
                    <th style={{ width: '30%' }}>Trường</th>
                    <th>Trước</th>
                    <th>Sau</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(({ field, before, after }) => {
                    const config = ENTITY_CONFIGS[targetType]?.find((c) => c.key === field);
                    const renderVal = (v) => {
                        if (v === null || v === undefined) return <em className="text-muted">—</em>;
                        if (config?.format) {
                            const r = config.format(v);
                            return typeof r === 'object' && r !== null ? r : String(r);
                        }
                        return typeof v === 'object' ? JSON.stringify(v) : String(v);
                    };
                    return (
                        <tr key={field}>
                            <td style={{ fontWeight: 500, background: '#f8f9fa' }}>
                                {labelMap[field] || <code>{field}</code>}
                            </td>
                            <td style={{ color: '#dc3545', wordBreak: 'break-word' }}>{renderVal(before)}</td>
                            <td style={{ color: '#198754', wordBreak: 'break-word' }}>{renderVal(after)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

// ─── Component chính ──────────────────────────────────────────────────────────

function History() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    const [filters, setFilters] = useState({ actor_email: '', action_type: '', target_type: '', from: '', to: '' });
    const [pending, setPending] = useState({ ...filters });

    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const fetchLogs = useCallback((f, p) => {
        const params = new URLSearchParams({ page: p, limit });
        if (f.actor_email) params.set('actor_email', f.actor_email);
        if (f.action_type) params.set('action_type', f.action_type);
        if (f.target_type) params.set('target_type', f.target_type);
        if (f.from) params.set('from', f.from);
        if (f.to) params.set('to', f.to);
        request.get(`/api/audit-logs?${params.toString()}`).then((res) => {
            setLogs(res.data.data || []);
            setTotal(res.data.total || 0);
        });
    }, []);

    useEffect(() => {
        fetchLogs(filters, page);
    }, [filters, page, fetchLogs]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...pending });
        setPage(1);
    };

    const handleReset = () => {
        const empty = { actor_email: '', action_type: '', target_type: '', from: '', to: '' };
        setPending(empty);
        setFilters(empty);
        setPage(1);
    };

    const openDetail = async (id) => {
        setLoadingDetail(true);
        setDetail(null);
        try {
            const res = await request.get(`/api/audit-logs/${id}`);
            setDetail(res.data);
        } finally {
            setLoadingDetail(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    // Dữ liệu entity cần hiển thị: CREATE/UPDATE → data_after, DELETE → data_before
    const entityData = detail
        ? detail.action_type === 'DELETE'
            ? detail.data_before
            : detail.data_after
        : null;

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Lịch Sử Hoạt Động</h3>

            {/* ── Bộ lọc ── */}
            <form
                onSubmit={handleSearch}
                style={{ background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
                <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label mb-1" style={{ fontSize: '13px' }}>Email người thực hiện</label>
                        <input
                            className="form-control form-control-sm"
                            placeholder="Tìm theo email..."
                            value={pending.actor_email}
                            onChange={(e) => setPending((p) => ({ ...p, actor_email: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label mb-1" style={{ fontSize: '13px' }}>Loại hành động</label>
                        <select
                            className="form-select form-select-sm"
                            value={pending.action_type}
                            onChange={(e) => setPending((p) => ({ ...p, action_type: e.target.value }))}
                        >
                            <option value="">Tất cả</option>
                            <option value="CREATE">Tạo mới</option>
                            <option value="UPDATE">Cập nhật</option>
                            <option value="DELETE">Xóa</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label mb-1" style={{ fontSize: '13px' }}>Đối tượng</label>
                        <select
                            className="form-select form-select-sm"
                            value={pending.target_type}
                            onChange={(e) => setPending((p) => ({ ...p, target_type: e.target.value }))}
                        >
                            {TARGET_TYPE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label mb-1" style={{ fontSize: '13px' }}>Từ ngày</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={pending.from}
                            onChange={(e) => setPending((p) => ({ ...p, from: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label mb-1" style={{ fontSize: '13px' }}>Đến ngày</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={pending.to}
                            onChange={(e) => setPending((p) => ({ ...p, to: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-1 d-flex gap-1">
                        <button type="submit" className="btn btn-primary btn-sm w-100">Lọc</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={handleReset}>Xóa</button>
                    </div>
                </div>
            </form>

            {/* ── Bảng log ── */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '15px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: '12px', color: '#6c757d', fontSize: '14px' }}>
                    Tổng: <strong>{total}</strong> bản ghi
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-hover align-middle" style={{ fontSize: '13px' }}>
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '150px' }}>Thời gian</th>
                                <th>Người thực hiện</th>
                                <th style={{ width: '100px' }}>Loại</th>
                                <th>Mô tả hành động</th>
                                <th>Đối tượng</th>
                                <th style={{ width: '80px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id}>
                                    <td style={{ whiteSpace: 'nowrap', color: '#6c757d' }}>{formatDateString(log.created_at)}</td>
                                    <td>
                                        <div>{log.actor_email}</div>
                                        <small className="text-muted">{log.actor_role}</small>
                                    </td>
                                    <td><BadgeType type={log.action_type} /></td>
                                    <td>{log.action_label || log.action_code}</td>
                                    <td>
                                        <div>{log.target_label}</div>
                                        <small className="text-muted">{TARGET_TYPE_LABELS[log.target_type] || log.target_type}</small>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline-primary btn-sm" onClick={() => openDetail(log._id)}>
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>&laquo;</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === '...' ? (
                                    <span key={`d${i}`} style={{ padding: '4px 8px' }}>…</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ),
                            )}
                        <button className="btn btn-outline-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>&raquo;</button>
                    </div>
                )}
            </div>

            {/* ── Modal chi tiết ── */}
            <Modal show={!!detail || loadingDetail} onHide={() => setDetail(null)} centered size="lg" scrollable>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '16px' }}>Chi Tiết Hoạt Động</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    {loadingDetail && <p className="text-center text-muted">Đang tải...</p>}

                    {detail && (
                        <>
                            {/* Thông tin audit */}
                            <div
                                className="p-3 mb-3 rounded"
                                style={{ background: '#f8f9fa', border: '1px solid #dee2e6', fontSize: '13px' }}
                            >
                                <div className="row g-2">
                                    <div className="col-6">
                                        <span className="text-muted">Thời gian:</span>{' '}
                                        <strong>{formatDateString(detail.created_at)}</strong>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">Người thực hiện:</span>{' '}
                                        <strong>{detail.actor_email}</strong>{' '}
                                        <span className="text-muted">({detail.actor_role})</span>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">Hành động:</span>{' '}
                                        <BadgeType type={detail.action_type} />{' '}
                                        <span className="ms-1">{detail.action_label || detail.action_code}</span>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">Đối tượng:</span>{' '}
                                        <strong>{detail.target_label}</strong>{' '}
                                        <span className="text-muted">
                                            ({TARGET_TYPE_LABELS[detail.target_type] || detail.target_type})
                                        </span>
                                    </div>
                                    {detail.ip_address && (
                                        <div className="col-6">
                                            <span className="text-muted">IP:</span> {detail.ip_address}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin entity */}
                            {entityData && (
                                <>
                                    <h6 className="mb-2" style={{ fontWeight: 600 }}>
                                        Thông tin{' '}
                                        {TARGET_TYPE_LABELS[detail.target_type] || detail.target_type}
                                        {detail.action_type === 'DELETE' && (
                                            <span className="text-danger ms-1" style={{ fontSize: '12px', fontWeight: 400 }}>
                                                (trước khi xóa)
                                            </span>
                                        )}
                                    </h6>
                                    <EntityDataTable data={entityData} targetType={detail.target_type} />
                                </>
                            )}

                            {/* Thay đổi (chỉ hiện với UPDATE) */}
                            {detail.action_type === 'UPDATE' && (
                                <>
                                    <h6 className="mb-2 mt-3" style={{ fontWeight: 600 }}>
                                        Các trường thay đổi
                                    </h6>
                                    <UpdateDiffSection diff={detail.diff} targetType={detail.target_type} />
                                </>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDetail(null)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default History;
