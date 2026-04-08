import { useState, useEffect } from 'react';
import request from '../../../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { formatDateString } from '../../../../../utils/formatDate';

function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal Add/Edit
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form states
    const [currentId, setCurrentId] = useState('');
    const [code, setCode] = useState('');
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

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setCurrentId('');
        setCode('');
        setDiscount('');
        setExpiry('');
        setUsageLimit('');
        setAuditInfo({});
        setShowModal(true);
    };

    const handleOpenEdit = (coupon) => {
        setIsEditMode(true);
        setCurrentId(coupon._id);
        setCode(coupon.code);
        setDiscount(coupon.discount_percent);
        setExpiry(coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '');
        setUsageLimit(coupon.usage_limit);
        setAuditInfo({
            created_at: coupon.created_at,
            created_by: coupon.created_by,
            modified_at: coupon.modified_at,
            modified_by: coupon.modified_by
        });
        setShowModal(true);
    };

    const handleOpenView = (coupon) => {
        setCode(coupon.code);
        setDiscount(coupon.discount_percent);
        setExpiry(coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '');
        setUsageLimit(coupon.usage_limit);
        setAuditInfo({
            created_at: coupon.created_at,
            created_by: coupon.created_by,
            modified_at: coupon.modified_at,
            modified_by: coupon.modified_by
        });
        setShowViewModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code || !discount || !expiry || String(usageLimit).trim() === '') {
            return toast.error('Vui lòng điền đầy đủ thông tin');
        }

        try {
            if (isEditMode) {
                const res = await request.post('/api/editcoupon', {
                    id: currentId,
                    code,
                    discount_percent: Number(discount),
                    expiry_date: expiry,
                    usage_limit: Number(usageLimit)
                });
                toast.success(res.data.message);
            } else {
                const res = await request.post('/api/addcoupon', {
                    code,
                    discount_percent: Number(discount),
                    expiry_date: expiry,
                    usage_limit: Number(usageLimit)
                });
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
            } catch (error) {
                toast.error('Lỗi khi xóa mã!');
            }
        }
    };

    const filteredCoupons = coupons.filter((coupon) => 
        coupon.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <ToastContainer />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Quản Lý Mã Giảm Giá</h2>
                <Button variant="primary" onClick={handleOpenAdd}>
                    + Thêm Mã Khuyến Mãi
                </Button>
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
                <table className="table table-hover table-bordered border-primary align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Mã Code</th>
                            <th>Khuyến mãi</th>
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
                                <td>{coupon.discount_percent}%</td>
                                <td>{new Date(coupon.expiry_date).toLocaleDateString()}</td>
                                <td>{coupon.usage_limit}</td>
                                <td>{formatDateString(coupon.created_at)}</td>
                                <td>{coupon.created_by || '-'}</td>
                                <td>{formatDateString(coupon.modified_at)}</td>
                                <td>{coupon.modified_by || '-'}</td>
                                <td>
                                    <button 
                                        className="btn btn-info btn-sm text-white" 
                                        onClick={() => handleOpenView(coupon)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Xem
                                    </button>
                                    <button 
                                        className="btn btn-warning btn-sm" 
                                        onClick={() => handleOpenEdit(coupon)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Sửa
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => handleDeleteCoupon(coupon._id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredCoupons.length === 0 && (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy mã giảm giá nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                        <label className="form-label text-muted">Giảm giá (%)</label>
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
                    <div className="mt-4 p-3 bg-light border rounded">
                        <h6>Thông tin hệ thống</h6>
                        <div className="row">
                            <div className="col-md-6 mb-2">
                                <small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(auditInfo.created_at)}</small>
                            </div>
                            <div className="col-md-6 mb-2">
                                <small className="text-muted text-break"><strong>Người tạo:</strong> {auditInfo.created_by || '-'}</small>
                            </div>
                            <div className="col-md-6 mb-2">
                                <small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(auditInfo.modified_at)}</small>
                            </div>
                            <div className="col-md-6 mb-2">
                                <small className="text-muted text-break"><strong>Người sửa:</strong> {auditInfo.modified_by || '-'}</small>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

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
                            <label className="form-label">Giảm giá (%) (*)</label>
                            <input type="number" className="form-control" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Ngày Hết Hạn (*)</label>
                            <input type="date" className="form-control" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Số Lượt Phát (*)</label>
                            <input type="number" className="form-control" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} required />
                        </div>
                        {isEditMode && (
                            <div className="mt-4 p-3 bg-light border rounded">
                                <h6>Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(auditInfo.created_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người tạo:</strong> {auditInfo.created_by || '-'}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(auditInfo.modified_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người sửa:</strong> {auditInfo.modified_by || '-'}</small>
                                    </div>
                                </div>
                            </div>
                        )}
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
