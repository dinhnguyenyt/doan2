import classNames from 'classnames/bind';
import styles from './InfoUser.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import EditInfo, { ChangePassword, AddressModal } from './modal/Modal';
import { CreateReturnModal, ReturnStatusModal } from './ReturnRequestModal';
import request from '../../config/Connect';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const RETURN_STATUS_LABELS = {
    PENDING_REVIEW: { label: 'Chờ xem xét',   color: '#6c757d' },
    CONTACTING:     { label: 'Đang liên hệ',  color: '#0d6efd' },
    WAITING_ITEM:   { label: 'Chờ nhận hàng', color: '#fd7e14' },
    ITEM_RECEIVED:  { label: 'Đã nhận hàng',  color: '#6f42c1' },
    APPROVED:       { label: 'Chấp nhận',      color: '#198754' },
    REJECTED:       { label: 'Từ chối',        color: '#dc3545' },
    REFUNDED:       { label: 'Đã hoàn tiền',  color: '#198754' },
};

function InfoUser() {
    const [dataUser, setDataUser]           = useState();
    const [show, setShow]                   = useState(false);
    const [selectedFile, setSelectedFile]   = useState(null);
    const [dataOrder, setDataOrder]         = useState([]);
    const [myReturns, setMyReturns]         = useState([]);

    const [showModalEdit, setShowModalEdit]       = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [savedAddress, setSavedAddress]         = useState(null);

    // Return modals
    const [showCreateReturn, setShowCreateReturn]   = useState(false);
    const [showReturnStatus, setShowReturnStatus]   = useState(false);
    const [selectedOrder, setSelectedOrder]         = useState(null);
    const [selectedReturn, setSelectedReturn]       = useState(null);

    const token   = document.cookie;
    const domain  = 'http://localhost:5000/avatars/';
    const navigate = useNavigate();

    const loadData = () => {
        request.get('/api/dataorder').then(res => setDataOrder(res.data));
        request.get('/api/return-request/my').then(res => setMyReturns(res.data || [])).catch(() => {});
        request.get('/api/address').then(res => setSavedAddress(res.data)).catch(() => {});
    };

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (token) {
            request.get('api/auth').then(res => setDataUser(res.data));
        } else {
            navigate('/login');
        }
    }, [navigate, token]);

    const handleLogout = () => {
        request.get('/api/logout');
        navigate('/');
        window.location.reload();
    };

    const handleChangeAvatar = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        try {
            await request.post('/api/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    // Tìm return request cho đơn hàng
    const getReturnForOrder = (orderId) =>
        myReturns.find(r => String(r.order_id) === String(orderId));

    // Kiểm tra đơn đủ điều kiện tạo yêu cầu trả
    const canReturn = (order) =>
        order.statusOrder && !order.has_return_request && !getReturnForOrder(order._id);

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header><Header /></header>

            <main className={cx('inner')}>
                <div className={cx('form-info-user')}>
                    <div className={cx('column-1')}>
                        <img src={domain + dataUser?.avatar} alt="..." />
                        <h3>{dataUser?.fullname}</h3>
                        <div className={cx('change-avatar')}>
                            <button onClick={handleChangeAvatar}>Change Avatar</button>
                        </div>
                        <button onClick={() => setShowModalEdit(!showModalEdit)}>Edit Profile</button>
                        <button onClick={handleLogout}>Log Out</button>
                    </div>

                    <div className={cx('column-2')}>
                        <h2>Information</h2>
                        <div className={cx('info-contact')}>
                            <div><h3>Email</h3><span>{dataUser?.email}</span></div>
                            <div><h3>Phone</h3><span>0{dataUser?.phone}</span></div>
                            <div><h3>Surplus</h3><span>{dataUser?.surplus?.toLocaleString('vi-VN')} VNĐ</span></div>
                        </div>

                        {/* Địa chỉ giao hàng */}
                        <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <h2 style={{ fontSize: 20 }}>Địa chỉ giao hàng</h2>
                                <button onClick={() => setShowAddressModal(true)}
                                    style={{ border: '1px solid #ff2020', background: 'none', color: '#ff2020', padding: '4px 14px', fontWeight: 600, borderRadius: 4, cursor: 'pointer' }}>
                                    {savedAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                                </button>
                            </div>
                            {savedAddress ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 14 }}>
                                    {[
                                        ['Họ tên',      savedAddress.fullname],
                                        ['SĐT',         savedAddress.phone],
                                        ['Công ty',     savedAddress.company],
                                        ['Địa chỉ',     savedAddress.address_line1],
                                        ['Phường/Xã',   savedAddress.ward],
                                        ['Quận/Huyện',  savedAddress.district],
                                        ['Tỉnh/Thành',  savedAddress.city],
                                        ['Mã bưu chính',savedAddress.zip],
                                    ].filter(([, v]) => v).map(([label, value]) => (
                                        <div key={label}>
                                            <span style={{ fontWeight: 700 }}>{label}: </span>
                                            <span style={{ color: '#555' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#aaa', fontSize: 13 }}>Chưa có địa chỉ giao hàng.</p>
                            )}
                        </div>

                        <div className={cx('input-change')}>
                            <>
                                <input type="file" name="file" id="file"
                                    onChange={e => setSelectedFile(e.target.files[0])}
                                    className={cx('inputfile')} />
                                <label htmlFor="file">Select Image</label>
                            </>
                            <button id={cx('btn-change')} onClick={() => setShow(!show)}>
                                Change PassWrod
                            </button>
                        </div>
                    </div>
                </div>

                <ChangePassword show={show} setShow={setShow} />
                <EditInfo showModalEdit={showModalEdit} setShowModalEdit={setShowModalEdit} />
                <AddressModal show={showAddressModal} setShow={setShowAddressModal} onSaved={addr => setSavedAddress(addr)} />
            </main>

            {/* Lịch sử đơn hàng */}
            <div className={cx('info-order')}>
                {dataOrder.map(item => {
                    const returnReq = getReturnForOrder(item._id);
                    return (
                        <div key={item._id} style={{ background: '#fff', borderRadius: 8, marginBottom: 16, border: '1px solid #dee2e6', overflow: 'hidden' }}>
                            {/* Header đơn hàng */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#f8f9fa', borderBottom: '1px solid #dee2e6', flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ fontSize: 13, color: '#555' }}>
                                    <span style={{ fontWeight: 700, marginRight: 12 }}>Đơn #{String(item._id).slice(-8)}</span>
                                    <span style={{ marginRight: 12 }}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                                    <span style={{ fontWeight: 700, color: '#ee4d2d' }}>{item.sumPrice?.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, background: item.statusOrder ? '#e6f4ea' : '#fff3e0', color: item.statusOrder ? '#198754' : '#fd7e14', border: `1px solid ${item.statusOrder ? '#198754' : '#fd7e14'}`, borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>
                                        {item.statusOrder ? 'Đã giao hàng' : 'Đang vận chuyển'}
                                    </span>
                                    <span style={{ fontSize: 12, background: item.statusPayment ? '#e6f4ea' : '#f8f9fa', color: item.statusPayment ? '#198754' : '#6c757d', border: `1px solid ${item.statusPayment ? '#198754' : '#dee2e6'}`, borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>
                                        {item.statusPayment ? 'Đã thanh toán' : 'COD'}
                                    </span>

                                    {/* Nút / trạng thái trả hàng */}
                                    {returnReq ? (
                                        <button
                                            onClick={() => { setSelectedReturn(returnReq); setShowReturnStatus(true); }}
                                            style={{ fontSize: 12, border: `1px solid ${RETURN_STATUS_LABELS[returnReq.status]?.color || '#888'}`, background: 'none', color: RETURN_STATUS_LABELS[returnReq.status]?.color, borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontWeight: 600 }}>
                                            Trả hàng: {RETURN_STATUS_LABELS[returnReq.status]?.label}
                                        </button>
                                    ) : canReturn(item) ? (
                                        <button
                                            onClick={() => { setSelectedOrder(item); setShowCreateReturn(true); }}
                                            style={{ fontSize: 12, border: '1px solid #dc3545', background: 'none', color: '#dc3545', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontWeight: 600 }}>
                                            Yêu cầu trả hàng
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            {/* Sản phẩm */}
                            <div style={{ padding: '10px 16px' }}>
                                {item?.products?.map((p, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: idx < item.products.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                                        <span>{p.nameProduct} <span style={{ color: '#888' }}>x{p.quantity}</span></span>
                                        <span style={{ color: '#555' }}>{p.price?.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {dataOrder.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>Chưa có đơn hàng nào.</p>
                )}
            </div>

            {/* Modals */}
            {selectedOrder && (
                <CreateReturnModal
                    show={showCreateReturn}
                    onHide={() => setShowCreateReturn(false)}
                    order={selectedOrder}
                    onCreated={loadData}
                />
            )}
            <ReturnStatusModal
                show={showReturnStatus}
                onHide={() => setShowReturnStatus(false)}
                returnRequest={selectedReturn}
            />

            <footer><Footer /></footer>
        </div>
    );
}

export default InfoUser;
