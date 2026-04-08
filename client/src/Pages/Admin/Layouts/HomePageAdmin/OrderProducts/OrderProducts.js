import { useEffect, useState } from 'react';

import request from '../../../../../config/Connect';
import { CheckProduct, ModalEditOrder } from '../../../Modal/Modal';
import { formatDateString } from '../../../../../utils/formatDate';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function OrderProducts() {
    const [dataOrder, setDataOrder] = useState([]);
    const [show, setShow] = useState(false);
    const [idProduct, setIdProduct] = useState(false);
    const [id, setId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);

    const handleOpenView = (order) => {
        setOrderDetail(order);
        setShowViewModal(true);
    };

    useEffect(() => {
        request.get('/api/getorder').then((res) => setDataOrder(res.data));
    }, [show]);

    const handleShowModal = (id1) => {
        setShow(!show);
        setId(id1);
    };

    const filteredOrders = dataOrder.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            item.email?.toLowerCase().includes(searchLower) ||
            item._id?.toLowerCase().includes(searchLower) ||
            item.products?.some((prod) => prod.nameProduct?.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Quản Lý Đơn Hàng</h3>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo email, mã đơn, tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                    <h4>Không tìm thấy đơn hàng nào.</h4>
                </div>
            ) : (
                filteredOrders.map((item) => (
                    <table className="table table-bordered border-primary" key={item._id}>
                        <thead>
                            <tr className="table-light">
                                <th scope="col">Email Người Dùng</th>
                                <th scope="col">Tên Sản Phẩm</th>
                                <th scope="col">Trạng Thái</th>
                                <th scope="col">Ngày tạo</th>
                                <th scope="col">Người tạo</th>
                                <th scope="col">Ngày sửa</th>
                                <th scope="col">Người sửa</th>
                                <th scope="col">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{item.email}</td>
                                <td style={{ display: 'flex', flexDirection: 'column' }}>
                                    {item?.products?.map((item2, idx) => (
                                        <div key={idx} style={{ padding: '4px 0' }}>
                                            {item2.nameProduct} (x{item2.quantity})
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    <div><strong>ĐH:</strong> {item.statusOrder ? 'Đã giao' : 'Vận chuyển'}</div>
                                    <div><strong>TT:</strong> {item.statusPayment ? 'Đã TT' : 'Chưa TT'}</div>
                                </td>
                                <td>{formatDateString(item.created_at)}</td>
                                <td>{item.created_by || '-'}</td>
                                <td>{formatDateString(item.modified_at)}</td>
                                <td>{item.modified_by || '-'}</td>
                                <td>
                                    <button
                                        onClick={() => handleOpenView(item)}
                                        type="button"
                                        className="btn btn-info text-white"
                                        style={{ marginRight: '10px' }}
                                    >
                                        Xem
                                    </button>
                                    <button
                                        onClick={() => handleShowModal(item._id)}
                                        type="button"
                                        className="btn btn-warning"
                                    >
                                        Chỉnh sửa
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ))
            )}
            <CheckProduct show={show} setShow={setShow} idProduct={idProduct} />
            <ModalEditOrder show={show} setShow={setShow} id={id} />

            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Đơn Hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {orderDetail && (
                        <div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted">Mã Đơn</p>
                                    <p className="fw-bold">{orderDetail._id}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted">Email Người Dùng</p>
                                    <p className="fw-bold">{orderDetail.email}</p>
                                </div>
                            </div>
                            
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted">Tổng Tiền</p>
                                    <p className="fw-bold text-success">${orderDetail.sum_price?.toLocaleString() || 0}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted">Phương Thức Thanh Toán</p>
                                    <p className="fw-bold">{orderDetail.payment_method || 'Chưa rõ'}</p>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted">Tình Trạng Vận Chuyển</p>
                                    <p>{orderDetail.statusOrder ? <span className="badge bg-success">Đã giao</span> : <span className="badge bg-warning">Đang vận chuyển</span>}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted">Tình Trạng Thanh Toán</p>
                                    <p>{orderDetail.statusPayment ? <span className="badge bg-success">Đã thanh toán</span> : <span className="badge bg-danger">Chưa thanh toán</span>}</p>
                                </div>
                            </div>

                            <h6 className="mt-4 border-bottom pb-2">Danh Sách Sản Phẩm</h6>
                            <ul className="list-group mb-4">
                                {orderDetail.products?.map((prod, idx) => (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{prod.nameProduct}</strong>
                                            <div className="text-muted" style={{ fontSize: '0.9em' }}>
                                                ID: {prod.id_product}
                                            </div>
                                        </div>
                                        <span className="badge bg-primary rounded-pill">x{prod.quantity}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 p-3 bg-light border rounded">
                                <h6>Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(orderDetail.created_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người tạo:</strong> {orderDetail.created_by || '-'}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(orderDetail.modified_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người sửa:</strong> {orderDetail.modified_by || '-'}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default OrderProducts;
