import { useState, useEffect } from 'react';
import request from '../../../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { formatDateString } from '../../../../../utils/formatDate';
import { usePermission } from '../../../../../contexts/PermissionContext';

const COUPON_TYPES = {
    product:  { label: 'Giảm giá sản phẩm', color: '#0d6efd', bg: '#e7f0ff' },
    shipping: { label: 'Giảm phí vận chuyển', color: '#198754', bg: '#e6f4ea' },
};

function TypeBadge({ type }) {
    const t = COUPON_TYPES[type] || COUPON_TYPES.product;
    return (
        <span style={{ background: t.bg, color: t.color, border: `1px solid ${t.color}`, borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {t.label}
        </span>
    );
}

function Coupons() {
    const { actions } = usePermission();
    const [coupons, setCoupons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [currentId, setCurrentId] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('product');
    const [discount, setDiscount] = useState('');
    const [expiry, setExpiry] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [auditInfo, setAuditInfo] = useState({});

    const fetchCoupons = async () => {
        try {
            const res = await request.get('/api/coupons');
            setCoupons(res.data);
        } catch (error) {
            console.error('Error fetching coupons', error);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const resetForm = () => {
        setCurrentId('');
        setCode('');
        setType('product');
        setDiscount('');
        setExpiry('');
        setUsageLimit('');
        setAuditInfo({});
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        resetForm();
        setShowModal(true);
    };

    const handleOpenEdit = (coupon) => {
        setIsEditMode(true);
        setCurrentId(coupon._id);
        setCode(coupon.code);
        setType(coupon.type || 'product');
        setDiscount(coupon.discount_percent);
        setExpiry(coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '');
        setUsageLimit(coupon.usage_limit);
        setAuditInfo({ created_at: coupon.created_at, created_by: coupon.created_by, modified_at: coupon.modified_at, modified_by: coupon.modified_by });
        setShowModal(true);
    };

    const handleOpenView = (coupon) => {
        setCode(coupon.code);
        setType(coupon.type || 'product');
        setDiscount(coupon.discount_percent);
        setExpiry(coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '');
        setUsageLimit(coupon.usage_limit);
        setAuditInfo({ created_at: coupon.created_at, created_by: coupon.created_by, modified_at: coupon.modified_at, modified_by: coupon.modified_by });
        setShowViewModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code || !discount || !expiry || String(usageLimit).trim() === '') {
            return toast.error('Vui lòng điền đầy đủ thông tin');
        }
        try {
            if (isEditMode) {
                const res = await request.post('/api/editcoupon', { id: currentId, code, type, discount_percent: Number(discount), expiry_date: expiry, usage_limit: Number(usageLimit) });
                toast.success(res.data.message);
            } else {
                const res = await request.post('/api/addcoupon', { code, type, discount_percent: Number(discount), expiry_date: expiry, usage_limit: Number(usageLimit) });
                toast.success(res.data.message);
            }
            setShowModal(false);
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
            try {
                const res = await request.post('/api/deletecoupon', { id });
                toast.success(res.data.message);
                fetchCoupons();
            } catch {
                toast.error('Lỗi khi xóa mã!');
            }
        }
    };

    const filteredCoupons = coupons.filter((c) => {
        const matchSearch = c.code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'all' || (c.type || 'product') === filterType;
        return matchSearch && matchType;
    });

    const counts = {
        all: coupons.length,
        product: coupons.filter((c) => (c.type || 'product') === 'product').length,
        shipping: coupons.filter((c) => c.type === 'shipping').length,
    };

    const auditBlock = (
        <div className="mt-4 p-3 bg-light border rounded">
            <h6>Thông tin hệ thống</h6>
            <div className="row">
                <div className="col-md-6 mb-2"><small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(auditInfo.created_at)}</small></div>
                <div className="col-md-6 mb-2"><small className="text-muted text-break"><strong>Người tạo:</strong> {auditInfo.created_by || '-'}</small></div>
                <div className="col-md-6 mb-2"><small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(auditInfo.modified_at)}</small></div>
                <div className="col-md-6 mb-2"><small className="text-muted text-break"><strong>Người sửa:</strong> {auditInfo.modified_by || '-'}</small></div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <ToastContainer />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Quản Lý Mã Giảm Giá</h2>
                {actions.includes('coupon:create') && (
                    <Button variant="primary" onClick={handleOpenAdd}>+ Thêm Mã Khuyến Mãi</Button>
                )}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[['all', 'Tất cả'], ['product', 'Giảm giá sản phẩm'], ['shipping', 'Giảm phí vận chuyển']].map(([val, lbl]) => (
                    <button
                        key={val}
                        onClick={() => setFilterType(val)}
                        className={`btn btn-sm ${filterType === val ? 'btn-dark' : 'btn-outline-secondary'}`}
                    >
                        {lbl} <span className="badge bg-secondary ms-1">{counts[val]}</span>
                    </button>
                ))}
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo mã code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px' }}>
                <table className="table table-hover table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Mã Code</th>
                            <th>Loại</th>
                            <th>Mức giảm</th>
                            <th>Ngày hết hạn</th>
                            <th>Lượt dùng còn lại</th>
                            <th>Ngày tạo</th>
                            <th>Người tạo</th>
                            <th>Ngày sửa</th>
                            <th>Người sửa</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoupons.map((coupon) => (
                            <tr key={coupon._id}>
                                <td><strong style={{ color: '#0d6efd' }}>{coupon.code}</strong></td>
                                <td><TypeBadge type={coupon.type || 'product'} /></td>
                                <td>{coupon.discount_percent}%</td>
                                <td>{new Date(coupon.expiry_date).toLocaleDateString('vi-VN')}</td>
                                <td>{coupon.usage_limit}</td>
                                <td>{formatDateString(coupon.created_at)}</td>
                                <td>{coupon.created_by || '-'}</td>
                                <td>{formatDateString(coupon.modified_at)}</td>
                                <td>{coupon.modified_by || '-'}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                    <button className="btn btn-info btn-sm text-white me-1" onClick={() => handleOpenView(coupon)}>Xem</button>
                                    {actions.includes('coupon:edit') && (
                                        <button className="btn btn-warning btn-sm me-1" onClick={() => handleOpenEdit(coupon)}>Sửa</button>
                                    )}
                                    {actions.includes('coupon:delete') && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCoupon(coupon._id)}>Xóa</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredCoupons.length === 0 && (
                            <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy mã giảm giá nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Xem */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xem Chi Tiết Mã Giảm Giá</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label text-muted">Mã Code</label>
                        <p className="fw-bold fs-5 text-primary">{code}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted">Loại coupon</label>
                        <div><TypeBadge type={type} /></div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted">Mức giảm</label>
                        <p className="fw-bold">{discount}%</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted">Ngày Hết Hạn</label>
                        <p>{expiry ? new Date(expiry).toLocaleDateString('vi-VN') : '-'}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted">Số Lượt Phát</label>
                        <p>{usageLimit}</p>
                    </div>
                    {auditBlock}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Thêm/Sửa */}
            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Sửa Mã Khuyến Mãi' : 'Thêm Mã Khuyến Mãi Mới'}</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="mb-3">
                            <label className="form-label">Mã Code (vd: SALE50) (*)</label>
                            <input type="text" className="form-control" value={code} onChange={(e) => setCode(e.target.value)} required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Loại coupon (*)</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {Object.entries(COUPON_TYPES).map(([val, info]) => (
                                    <label
                                        key={val}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                            border: `2px solid ${type === val ? info.color : '#dee2e6'}`,
                                            borderRadius: 8, padding: '8px 14px', flex: 1,
                                            background: type === val ? info.bg : '#fff',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <input type="radio" name="couponType" value={val} checked={type === val} onChange={() => setType(val)} style={{ accentColor: info.color }} />
                                        <span style={{ fontWeight: 600, color: type === val ? info.color : '#555', fontSize: 13 }}>{info.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                {type === 'shipping' ? 'Giảm phí vận chuyển (%)' : 'Giảm giá sản phẩm (%)'} (*)
                            </label>
                            <div className="input-group">
                                <input type="number" min="1" max="100" className="form-control" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
                                <span className="input-group-text">%</span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Ngày Hết Hạn (*)</label>
                            <input type="date" className="form-control" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Số Lượt Phát (*)</label>
                            <input type="number" min="1" className="form-control" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} required />
                        </div>

                        {isEditMode && auditBlock}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                        <Button type="submit" variant="primary">{isEditMode ? 'Cập Nhật' : 'Thêm Mới'}</Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

export default Coupons;
