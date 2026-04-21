import classNames from 'classnames/bind';
import styles from './Modal.module.scss';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../../config/Connect';
import { toast, ToastContainer } from 'react-toastify';

const cx = classNames.bind(styles);

    export function ModalAddProduct({ show, setShow }) {
        const handleClose = () => setShow(false);

        const [nameProduct, setNameProduct] = useState('');
        const [imgProduct, setImgProduct] = useState('');
        const [priceProduct, setPriceProduct] = useState(Number);
        const [desProduct, setDesProduct] = useState('');
        const [categoryId, setCategoryId] = useState('');
        const [stockQuantity, setStockQuantity] = useState(100);
        const [categories, setCategories] = useState([]);
        const { useEffect } = require('react');

        useEffect(() => {
            if (show) {
                request.get('/api/categories').then((res) => {
                    setCategories(res.data);
                    if (res.data.length > 0) setCategoryId(res.data[0]._id);
                });
            }
        }, [show]);

        const handleAddProduct = async () => {
            const selectedCategory = categories.find((c) => c._id === categoryId);
            const checkProduct = selectedCategory ? selectedCategory.name : '';
            try {
                const res = await request.post('/api/addproduct', {
                    nameProduct,
                    imgProduct,
                    priceProduct,
                    desProduct,
                    checkProduct,
                    category_id: categoryId,
                    stock_quantity: Number(stockQuantity)
                });
                toast.success(res.data.message);
                await request.get('/api/products').then();
            } catch (error) {}
        };

        return (
            <>
                <Modal show={show} onHide={handleClose}>
                    <ToastContainer />
                    <Modal.Header closeButton>
                        <Modal.Title>Add Products</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="input-group mb-3">
                            <span className="input-group-text">Tên Danh Mục (*)</span>
                            <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Name Product</span>
                            <input type="text" className="form-control" onChange={(e) => setNameProduct(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <div className="input-group">
                                <span className="input-group-text" id="basic-addon1">Img Product</span>
                                <input type="text" className="form-control" placeholder="Nhập URL ảnh..." onChange={(e) => setImgProduct(e.target.value)} />
                            </div>
                            {imgProduct && (
                                <div className="mt-2 text-center">
                                    <img
                                        src={imgProduct}
                                        alt="preview"
                                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', border: '1px solid #dee2e6', borderRadius: '6px', padding: '4px' }}
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                        onLoad={(e) => { e.target.style.display = 'block'; e.target.nextSibling.style.display = 'none'; }}
                                    />
                                    <div style={{ display: 'none', color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                                        ⚠️ Không tải được ảnh — link bị chặn hoặc không hợp lệ
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Price Product</span>
                            <input type="number" className="form-control" onChange={(e) => setPriceProduct(e.target.value)} />
                        </div>
                        
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Stock Quantity</span>
                            <input type="number" className="form-control" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                        </div>

                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">Description Product</span>
                            <input type="text" className="form-control" onChange={(e) => setDesProduct(e.target.value)} />
                        </div>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                        <Button variant="primary" onClick={handleAddProduct}>Thêm Sản Phẩm</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

export function ModalDeleteProduct({ showModalDelete, setShowModalDelete, idProduct }) {
    const handleClose = () => setShowModalDelete(false);

    const handleDeleteProduct = async () => {
        try {
            const res = await request.post('/api/deleteproduct', { id: idProduct });
            toast.success(res.data.message);
        } catch (error) {}
    };

    return (
        <div>
            <Modal show={showModalDelete} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Xóa Sản Phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn Muốn Xóa Sản Phẩm Có ID : {idProduct}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleDeleteProduct}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export function ModalEditProduct({ setShowModalEdit, showModalEdit, idProduct }) {
    const handleClose = () => setShowModalEdit(false);
    const [nameProduct, setNameProduct] = useState('');
    const [imgProduct, setImgProduct] = useState('');
    const [priceProduct, setPriceProduct] = useState(Number);
    const [desProduct, setDesProduct] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stockQuantity, setStockQuantity] = useState(100);
    const [categories, setCategories] = useState([]);
    const [auditInfo, setAuditInfo] = useState({});
    const { useEffect } = require('react');

    useEffect(() => {
        if (showModalEdit && idProduct) {
            request.get('/api/categories').then((res) => setCategories(res.data));
            request.get(`/api/product/${idProduct}`).then((res) => {
                const p = res.data;
                if (p) {
                    setNameProduct(p.nameProducts || '');
                    setImgProduct(p.img || '');
                    setPriceProduct(p.priceNew || '');
                    setDesProduct(p.des || '');
                    setCategoryId(p.category_id || '');
                    setStockQuantity(p.stock_quantity ?? 100);
                    setAuditInfo({
                        created_by: p.created_by,
                        created_at: p.created_at,
                        modified_by: p.modified_by,
                        modified_at: p.modified_at,
                    });
                }
            });
        }
    }, [showModalEdit, idProduct]);

    const handleEditProduct = async () => {
        try {
            const res = await request.post('/api/editproduct', {
                nameProduct,
                imgProduct,
                priceProduct,
                desProduct,
                id: idProduct,
                category_id: categoryId,
                stock_quantity: Number(stockQuantity)
            });
            toast.success(res.data.message);
        } catch (error) {}
    };

    return (
        <div>
            <Modal show={showModalEdit} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Tên Danh Mục (*)</span>
                        <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="">Chọn danh mục</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="input-group mb-3">
                        <span className="input-group-text">Name Product</span>
                        <input type="text" className="form-control" value={nameProduct} onChange={(e) => setNameProduct(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <div className="input-group">
                            <span className="input-group-text">Img Product</span>
                            <input type="text" className="form-control" placeholder="Nhập URL ảnh..." value={imgProduct} onChange={(e) => setImgProduct(e.target.value)} />
                        </div>
                        {imgProduct && (
                            <div className="mt-2 text-center">
                                <img
                                    src={imgProduct}
                                    alt="preview"
                                    style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', border: '1px solid #dee2e6', borderRadius: '6px', padding: '4px' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                    onLoad={(e) => { e.target.style.display = 'block'; e.target.nextSibling.style.display = 'none'; }}
                                />
                                <div style={{ display: 'none', color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                                    ⚠️ Không tải được ảnh — link bị chặn hoặc không hợp lệ
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Price Product</span>
                        <input type="number" className="form-control" value={priceProduct} onChange={(e) => setPriceProduct(e.target.value)} />
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Stock Quantity</span>
                        <input type="number" className="form-control" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Description Product</span>
                        <input type="text" className="form-control" value={desProduct} onChange={(e) => setDesProduct(e.target.value)} />
                    </div>
                    <div className="mt-3 p-3 bg-light border rounded">
                        <h6 className="mb-2">Thông tin hệ thống</h6>
                        <div className="row">
                            <div className="col-md-6 mb-1">
                                <small className="text-muted text-break"><strong>Ngày tạo:</strong> {auditInfo.created_at ? new Date(auditInfo.created_at).toLocaleString('vi-VN') : '-'}</small>
                            </div>
                            <div className="col-md-6 mb-1">
                                <small className="text-muted text-break"><strong>Người tạo:</strong> {auditInfo.created_by || '-'}</small>
                            </div>
                            <div className="col-md-6 mb-1">
                                <small className="text-muted text-break"><strong>Ngày sửa:</strong> {auditInfo.modified_at ? new Date(auditInfo.modified_at).toLocaleString('vi-VN') : '-'}</small>
                            </div>
                            <div className="col-md-6 mb-1">
                                <small className="text-muted text-break"><strong>Người sửa:</strong> {auditInfo.modified_by || '-'}</small>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                    <Button variant="primary" onClick={handleEditProduct}>Lưu Lại</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export function ModalAddBlog({ show, setShow }) {
    const handleClose = () => setShow(false);

    const [img, setImg] = useState('');
    const [title, setTitle] = useState('');
    const [des, setDes] = useState('');

    const handleAddBlog = async () => {
        try {
            const res = await request.post('/api/addblog', { img, title, des });
            toast.success(res.data.message);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Thêm Bài Viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Img"
                            onChange={(e) => setImg(e.target.value)}
                        />
                    </div>

                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Name Blog"
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Description"
                            onChange={(e) => setDes(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAddBlog}>
                        Thêm Bài Viết
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export function CheckProduct({ show, setShow, idProduct }) {
    const handleClose = () => setShow(false);

    const handleCheckProduct = async () => {
        try {
            const res = await request.post('/api/checkproduct', { idProduct });
            toast.success(res.data.message);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <Modal show={show} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Duyệt Đơn Hàng </Modal.Title>
                </Modal.Header>
                <Modal.Body>Duyệt Đơn Hàng Cho : {idProduct}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleCheckProduct}>
                        Duyệt
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export function ModalEditOrder({ show, setShow, id }) {
    const handleClose = () => setShow(false);
    const [orderData, setOrderData] = useState(null);
    const [statusOrder, setStatusOrder] = useState(false);
    const [statusPayment, setStatusPayment] = useState(false);
    const { useEffect } = require('react');

    useEffect(() => {
        if (show && id) {
            request.get(`/api/order/${id}`).then((res) => {
                const data = res.data;
                setOrderData(data);
                setStatusOrder(data?.statusOrder || false);
                setStatusPayment(data?.statusPayment || false);
            });
        }
    }, [show, id]);

    const handleEditOrder = () => {
        request.post('/api/editorder', { id, statusOrder, statusPayment }).then((res) => {
            toast.success(res.data.message);
            handleClose();
        });
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh Sửa Đơn Hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {orderData && (
                        <div className="mb-3 p-3 bg-light border rounded">
                            <div className="mb-1"><strong>Mã đơn:</strong> <span className="text-muted" style={{ fontSize: '0.85em' }}>{orderData._id}</span></div>
                            <div className="mb-1"><strong>Email:</strong> {orderData.email}</div>
                            <div className="mb-1"><strong>Tổng tiền:</strong> ${orderData.sumPrice?.toLocaleString() || 0}</div>
                            <div className="mb-1">
                                <strong>Phương thức TT:</strong>{' '}
                                {orderData.statusPayment
                                    ? <span className="badge bg-info">VNPay</span>
                                    : <span className="badge bg-secondary">COD</span>}
                            </div>
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label fw-bold">Trạng thái giao hàng</label>
                        <select
                            value={statusOrder ? '2' : '1'}
                            onChange={(e) => setStatusOrder(e.target.value === '2')}
                            className="form-select"
                        >
                            <option value="1">Đang vận chuyển</option>
                            <option value="2">Đã giao hàng</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Trạng thái thanh toán</label>
                        <div
                            className={`form-select d-flex align-items-center justify-content-between ${statusPayment ? 'text-success' : 'text-danger'}`}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => setStatusPayment(!statusPayment)}
                        >
                            <span>{statusPayment ? '✓ Đã thanh toán' : '✗ Chưa thanh toán'}</span>
                            <span className={`badge ${statusPayment ? 'bg-success' : 'bg-danger'}`}>
                                {statusPayment ? 'ON' : 'OFF'}
                            </span>
                        </div>
                        {!orderData?.statusPayment && statusPayment && (
                            <small className="text-muted mt-1 d-block">Xác nhận khách đã thanh toán tiền mặt (COD)</small>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                    <Button variant="primary" onClick={handleEditOrder}>Lưu lại</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
