import { useEffect, useState, useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import request from '../../../../../config/Connect';
import { usePermission } from '../../../../../contexts/PermissionContext';

const STATUS_CONFIG = {
    PENDING_REVIEW: { label: 'Chờ xem xét',    color: '#6c757d', bg: '#f8f9fa' },
    CONTACTING:     { label: 'Đang liên hệ',   color: '#0d6efd', bg: '#e7f0ff' },
    WAITING_ITEM:   { label: 'Chờ nhận hàng',  color: '#fd7e14', bg: '#fff3e0' },
    ITEM_RECEIVED:  { label: 'Đã nhận hàng',   color: '#6f42c1', bg: '#f3e8ff' },
    APPROVED:       { label: 'Chấp nhận',       color: '#198754', bg: '#e6f4ea' },
    REJECTED:       { label: 'Từ chối',         color: '#dc3545', bg: '#fff3f3' },
    REFUNDED:       { label: 'Đã hoàn tiền',   color: '#198754', bg: '#e6f4ea' },
};

const TABS = [
    { key: '', label: 'Tất cả' },
    { key: 'PENDING_REVIEW', label: 'Mới' },
    { key: 'CONTACTING',     label: 'Đang liên hệ' },
    { key: 'WAITING_ITEM',   label: 'Chờ nhận hàng' },
    { key: 'ITEM_RECEIVED',  label: 'Đã nhận hàng' },
    { key: 'APPROVED',       label: 'Chấp nhận' },
    { key: 'REJECTED',       label: 'Từ chối' },
    { key: 'REFUNDED',       label: 'Đã hoàn tiền' },
];

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: '#888', bg: '#f0f0f0' };
    return (
        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {cfg.label}
        </span>
    );
}

function Returns() {
    const { menus } = usePermission();
    const isManager = menus.includes('role');   // role menu = manager+
    const isAdmin   = menus.includes('returns') && menus.includes('role') && menus.includes('shipping');

    const [activeTab, setActiveTab] = useState('');
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [detail, setDetail] = useState(null);
    const [detailOrder, setDetailOrder] = useState(null);
    const [detailItems, setDetailItems] = useState([]);
    const [showDetail, setShowDetail] = useState(false);

    const [staffNote, setStaffNote] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const limit = 15;

    const fetchData = useCallback(() => {
        const params = new URLSearchParams({ page, limit });
        if (activeTab) params.set('status', activeTab);
        request.get(`/api/admin/return-requests?${params}`)
            .then(res => { setData(res.data.data || []); setTotal(res.data.total || 0); })
            .catch(() => {});
    }, [activeTab, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openDetail = async (id) => {
        try {
            const res = await request.get(`/api/admin/return-requests/${id}`);
            setDetail(res.data.request);
            setDetailOrder(res.data.order);
            setDetailItems(res.data.items || []);
            setStaffNote('');
            setRejectReason('');
            setShowDetail(true);
        } catch { toast.error('Không tải được chi tiết'); }
    };

    const act = async (path, body, successMsg) => {
        try {
            await request.post(`/api/admin/return-requests/${detail._id}/${path}`, body);
            toast.success(successMsg);
            setShowDetail(false);
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div style={{ padding: 20 }}>
            <ToastContainer />
            <h3 style={{ marginBottom: 20 }}>Quản Lý Đổi Trả Hàng</h3>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {TABS.map(t => (
                    <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
                        className={`btn btn-sm ${activeTab === t.key ? 'btn-dark' : 'btn-outline-secondary'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Bảng */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: 10, color: '#6c757d', fontSize: 13 }}>Tổng: <b>{total}</b></div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-hover align-middle" style={{ fontSize: 13 }}>
                        <thead className="table-light">
                            <tr>
                                <th>Mã yêu cầu</th>
                                <th>Khách hàng</th>
                                <th>Mã đơn hàng</th>
                                <th>Lý do</th>
                                <th>Số tiền hoàn</th>
                                <th>Ngày gửi</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(r => (
                                <tr key={r._id}>
                                    <td><code style={{ fontSize: 11 }}>#{String(r._id).slice(-8)}</code></td>
                                    <td>{r.customer_email}</td>
                                    <td><code style={{ fontSize: 11 }}>#{String(r.order_id).slice(-8)}</code></td>
                                    <td>{r.reason}</td>
                                    <td>{r.refund_amount?.toLocaleString('vi-VN')} VNĐ</td>
                                    <td style={{ whiteSpace: 'nowrap', color: '#888' }}>
                                        {new Date(r.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td><StatusBadge status={r.status} /></td>
                                    <td>
                                        <button className="btn btn-outline-primary btn-sm" onClick={() => openDetail(r._id)}>
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan="8" style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>Không có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                        <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&laquo;</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(p)}>{p}</button>
                        ))}
                        <button className="btn btn-outline-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>&raquo;</button>
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg" scrollable>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: 16 }}>Chi Tiết Yêu Cầu Trả Hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: 20 }}>
                    {detail && (
                        <>
                            {/* Thông tin yêu cầu */}
                            <div style={{ background: '#f8f9fa', borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
                                <div className="row g-2">
                                    <div className="col-6"><b>Mã yêu cầu:</b> #{String(detail._id).slice(-8)}</div>
                                    <div className="col-6"><b>Trạng thái:</b> <StatusBadge status={detail.status} /></div>
                                    <div className="col-6"><b>Khách hàng:</b> {detail.customer_email}</div>
                                    <div className="col-6"><b>Ngày gửi:</b> {new Date(detail.created_at).toLocaleString('vi-VN')}</div>
                                    <div className="col-6"><b>Lý do:</b> {detail.reason}</div>
                                    <div className="col-6"><b>Số tiền hoàn:</b> <span style={{ color: '#dc3545', fontWeight: 700 }}>{detail.refund_amount?.toLocaleString('vi-VN')} VNĐ</span></div>
                                    {detail.description && <div className="col-12"><b>Mô tả:</b> {detail.description}</div>}
                                    {detail.staff_note && <div className="col-12"><b>Ghi chú NV:</b> {detail.staff_note}</div>}
                                    {detail.reject_reason && <div className="col-12" style={{ color: '#dc3545' }}><b>Lý do từ chối:</b> {detail.reject_reason}</div>}
                                </div>
                            </div>

                            {/* Thông tin đơn hàng */}
                            {detailOrder && (
                                <div style={{ marginBottom: 16 }}>
                                    <h6 style={{ marginBottom: 8 }}>Thông tin đơn hàng</h6>
                                    <table className="table table-sm table-bordered" style={{ fontSize: 12 }}>
                                        <thead className="table-light">
                                            <tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th></tr>
                                        </thead>
                                        <tbody>
                                            {detailItems.map(i => (
                                                <tr key={i._id}>
                                                    <td>{i.nameProduct}</td>
                                                    <td>x{i.quantity}</td>
                                                    <td>{i.price?.toLocaleString('vi-VN')} VNĐ</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan="2"><b>Tổng đơn hàng</b></td>
                                                <td><b>{detailOrder.sumPrice?.toLocaleString('vi-VN')} VNĐ</b></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div style={{ fontSize: 12, color: '#888' }}>
                                        Thanh toán: <b>{detailOrder.payment_method === 'vnpay' ? 'VNPay' : 'COD'}</b>
                                        {' · '}Đặt lúc: {new Date(detailOrder.created_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            )}

                            {/* Khu vực hành động */}
                            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: 16 }}>
                                {/* Nhân viên cập nhật trạng thái */}
                                {['PENDING_REVIEW', 'CONTACTING', 'WAITING_ITEM'].includes(detail.status) && (
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Ghi chú (hiện với khách)</label>
                                        <textarea className="form-control form-control-sm mb-2" rows={2} value={staffNote} onChange={e => setStaffNote(e.target.value)} placeholder="Ghi chú cho khách hàng..." />
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {detail.status === 'PENDING_REVIEW' && (
                                                <button className="btn btn-primary btn-sm" onClick={() => act('status', { status: 'CONTACTING', staff_note: staffNote }, 'Đã chuyển sang "Đang liên hệ"')}>
                                                    Liên hệ khách hàng
                                                </button>
                                            )}
                                            {detail.status === 'CONTACTING' && (
                                                <button className="btn btn-warning btn-sm" onClick={() => act('status', { status: 'WAITING_ITEM', staff_note: staffNote }, 'Đã chuyển sang "Chờ nhận hàng"')}>
                                                    Khách đồng ý gửi hàng về
                                                </button>
                                            )}
                                            {detail.status === 'WAITING_ITEM' && (
                                                <button className="btn btn-success btn-sm" onClick={() => act('status', { status: 'ITEM_RECEIVED', staff_note: staffNote }, 'Đã xác nhận nhận hàng')}>
                                                    Đã nhận hàng từ khách
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Manager/Admin: Duyệt hoặc Từ chối */}
                                {detail.status === 'ITEM_RECEIVED' && isManager && (
                                    <div className="mb-3">
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                            <button className="btn btn-success btn-sm" onClick={() => act('approve', {}, 'Đã chấp nhận trả hàng')}>
                                                ✓ Chấp nhận trả hàng
                                            </button>
                                            <button className="btn btn-outline-danger btn-sm" onClick={() => {
                                                const reason = window.prompt('Lý do từ chối:');
                                                if (reason !== null) act('reject', { reject_reason: reason }, 'Đã từ chối yêu cầu');
                                            }}>
                                                ✕ Từ chối
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Admin: Hoàn tiền */}
                                {detail.status === 'APPROVED' && isAdmin && (
                                    <div>
                                        <div style={{ fontSize: 13, marginBottom: 8, color: '#555' }}>
                                            Xác nhận hoàn <b>{detail.refund_amount?.toLocaleString('vi-VN')} VNĐ</b> cho khách
                                            {detailOrder?.payment_method === 'vnpay' ? ' qua VNPay' : ' (COD — hoàn thủ công)'}
                                        </div>
                                        <button className="btn btn-danger btn-sm" onClick={() => {
                                            if (window.confirm(`Xác nhận hoàn tiền ${detail.refund_amount?.toLocaleString('vi-VN')} VNĐ?`))
                                                act('refund', {}, 'Đã xử lý hoàn tiền');
                                        }}>
                                            Xác nhận hoàn tiền
                                        </button>
                                    </div>
                                )}

                                {['REJECTED', 'REFUNDED'].includes(detail.status) && (
                                    <p className="text-muted" style={{ fontSize: 13 }}>
                                        {detail.status === 'REFUNDED' ? 'Yêu cầu đã hoàn tất.' : 'Yêu cầu đã bị từ chối.'}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Returns;
