import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import request from '../../config/Connect';

const REASONS = [
    'Hàng bị lỗi / hư hỏng',
    'Không đúng mô tả sản phẩm',
    'Sai size / màu sắc',
    'Hàng bị thiếu phụ kiện',
    'Không vừa ý',
    'Khác',
];

const STATUS_CONFIG = {
    PENDING_REVIEW: { label: 'Chờ xem xét',       color: '#6c757d' },
    CONTACTING:     { label: 'Đang liên hệ',       color: '#0d6efd' },
    WAITING_ITEM:   { label: 'Chờ nhận hàng',      color: '#fd7e14' },
    ITEM_RECEIVED:  { label: 'Đã nhận hàng',       color: '#6f42c1' },
    APPROVED:       { label: 'Đã chấp nhận',       color: '#198754' },
    REJECTED:       { label: 'Từ chối',            color: '#dc3545' },
    REFUNDED:       { label: 'Đã hoàn tiền',       color: '#198754' },
};

const TIMELINE_STEPS = [
    { key: 'PENDING_REVIEW', label: 'Gửi yêu cầu' },
    { key: 'CONTACTING',     label: 'Liên hệ xác nhận' },
    { key: 'WAITING_ITEM',   label: 'Gửi hàng về shop' },
    { key: 'ITEM_RECEIVED',  label: 'Shop nhận hàng' },
    { key: 'APPROVED',       label: 'Chấp nhận' },
    { key: 'REFUNDED',       label: 'Hoàn tiền' },
];

const STEP_ORDER = TIMELINE_STEPS.map(s => s.key);

function StatusTimeline({ status }) {
    if (status === 'REJECTED') {
        return (
            <div style={{ padding: '8px 12px', background: '#fff3f3', border: '1px solid #dc3545', borderRadius: 6, color: '#dc3545', fontSize: 13 }}>
                Yêu cầu trả hàng đã bị từ chối
            </div>
        );
    }
    const currentIdx = STEP_ORDER.indexOf(status);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', rowGap: 8 }}>
            {TIMELINE_STEPS.map((step, idx) => {
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', margin: '0 auto 4px',
                                background: done ? '#198754' : '#dee2e6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, color: done ? '#fff' : '#aaa',
                                fontWeight: 700, border: active ? '3px solid #198754' : 'none',
                            }}>
                                {done ? '✓' : idx + 1}
                            </div>
                            <div style={{ fontSize: 11, color: done ? '#198754' : '#aaa', fontWeight: active ? 700 : 400 }}>
                                {step.label}
                            </div>
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                            <div style={{ height: 2, width: 24, background: idx < currentIdx ? '#198754' : '#dee2e6', marginBottom: 18 }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Modal tạo yêu cầu mới
export function CreateReturnModal({ show, onHide, order, onCreated }) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return toast.error('Vui lòng chọn lý do');
        setSubmitting(true);
        try {
            await request.post('/api/return-request', { order_id: order._id, reason, description });
            toast.success('Đã gửi yêu cầu trả hàng');
            onCreated();
            onHide();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi gửi yêu cầu');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title style={{ fontSize: 16 }}>Yêu cầu trả hàng</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="mb-3" style={{ background: '#f8f9fa', borderRadius: 6, padding: '10px 14px', fontSize: 13 }}>
                        <div><b>Đơn hàng:</b> #{order._id.slice(-8)}</div>
                        <div><b>Số tiền:</b> {order.sumPrice?.toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Lý do trả hàng *</label>
                        <select className="form-select" value={reason} onChange={e => setReason(e.target.value)} required>
                            <option value="">-- Chọn lý do --</option>
                            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Mô tả thêm</label>
                        <textarea className="form-control" rows={3} placeholder="Mô tả chi tiết vấn đề (không bắt buộc)" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div style={{ fontSize: 12, color: '#888', background: '#fff8e1', padding: '8px 12px', borderRadius: 6 }}>
                        Sau khi gửi, nhân viên sẽ liên hệ với bạn qua số điện thoại để hướng dẫn gửi hàng về.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Hủy</Button>
                    <Button variant="danger" type="submit" disabled={submitting}>
                        {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

// Modal xem trạng thái yêu cầu
export function ReturnStatusModal({ show, onHide, returnRequest }) {
    if (!returnRequest) return null;
    const cfg = STATUS_CONFIG[returnRequest.status] || {};
    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title style={{ fontSize: 16 }}>Trạng thái yêu cầu trả hàng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-4">
                    <StatusTimeline status={returnRequest.status} />
                </div>
                <div style={{ background: '#f8f9fa', borderRadius: 6, padding: '12px 16px', fontSize: 13 }}>
                    <div className="row g-2">
                        <div className="col-6"><b>Mã yêu cầu:</b> #{String(returnRequest._id).slice(-8)}</div>
                        <div className="col-6">
                            <b>Trạng thái:</b>{' '}
                            <span style={{ color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
                        </div>
                        <div className="col-6"><b>Lý do:</b> {returnRequest.reason}</div>
                        <div className="col-6"><b>Số tiền hoàn:</b> {returnRequest.refund_amount?.toLocaleString('vi-VN')} VNĐ</div>
                        {returnRequest.description && <div className="col-12"><b>Mô tả:</b> {returnRequest.description}</div>}
                        {returnRequest.staff_note && <div className="col-12"><b>Ghi chú nhân viên:</b> {returnRequest.staff_note}</div>}
                        {returnRequest.reject_reason && (
                            <div className="col-12" style={{ color: '#dc3545' }}><b>Lý do từ chối:</b> {returnRequest.reject_reason}</div>
                        )}
                        {returnRequest.status === 'REFUNDED' && (
                            <div className="col-12" style={{ color: '#198754' }}>
                                <b>Đã hoàn tiền lúc:</b> {new Date(returnRequest.refunded_at).toLocaleString('vi-VN')}
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Đóng</Button>
            </Modal.Footer>
        </Modal>
    );
}
