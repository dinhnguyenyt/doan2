import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../../config/Connect';
import { toast, ToastContainer } from 'react-toastify';

    export function ModalAddProduct({ show, setShow }) {
        const handleClose = () => setShow(false);

        const [nameProduct, setNameProduct] = useState('');
        const [imgProduct, setImgProduct] = useState('');
        const [imagesProduct, setImagesProduct] = useState('');
        const [priceProduct, setPriceProduct] = useState(Number);
        const [desProduct, setDesProduct] = useState('');
        const [categoryId, setCategoryId] = useState('');
        const [stockQuantity, setStockQuantity] = useState(100);
        const [categories, setCategories] = useState([]);
        const [freeShipping, setFreeShipping] = useState(false);
        const [shippingNote, setShippingNote] = useState('');
        const [returnDays, setReturnDays] = useState(15);
        const [hasFashionInsurance, setHasFashionInsurance] = useState(false);
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
                    nameProduct, imgProduct,
                    images: imagesProduct,
                    priceProduct, desProduct, checkProduct,
                    category_id: categoryId,
                    stock_quantity: Number(stockQuantity),
                    free_shipping: freeShipping,
                    shipping_note: shippingNote,
                    return_days: Number(returnDays),
                    has_fashion_insurance: hasFashionInsurance,
                });
                toast.success(res.data.message);
            } catch (error) {}
        };

        return (
            <>
                <Modal show={show} onHide={handleClose} size="lg">
                    <ToastContainer />
                    <Modal.Header closeButton>
                        <Modal.Title>Thêm Sản Phẩm</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Danh mục (*)</span>
                                    <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Tên sản phẩm</span>
                                    <input type="text" className="form-control" onChange={(e) => setNameProduct(e.target.value)} />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Giá</span>
                                    <input type="number" className="form-control" onChange={(e) => setPriceProduct(e.target.value)} />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Tồn kho</span>
                                    <input type="number" className="form-control" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Mô tả</span>
                                    <input type="text" className="form-control" onChange={(e) => setDesProduct(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text">Ảnh chính</span>
                                        <input type="text" className="form-control" placeholder="URL ảnh chính..." onChange={(e) => setImgProduct(e.target.value)} />
                                    </div>
                                    {imgProduct && (
                                        <img src={imgProduct} alt="preview" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', marginTop: '6px', border: '1px solid #dee2e6', borderRadius: '4px' }}
                                            onError={(e) => { e.target.style.display = 'none'; }} />
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Ảnh phụ (nhiều URL, cách nhau bằng dấu phẩy)</label>
                                    <textarea className="form-control" rows={2} placeholder="https://..., https://..." onChange={(e) => setImagesProduct(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <hr />
                        <h6 className="mb-3">Chính sách & Vận chuyển</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-check form-switch mb-2">
                                    <input className="form-check-input" type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} />
                                    <label className="form-check-label">Miễn phí vận chuyển</label>
                                </div>
                                {!freeShipping && (
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Ghi chú VC</span>
                                        <input type="text" className="form-control" placeholder="VD: Không hỗ trợ vận chuyển" value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} />
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6">
                                <div className="input-group mb-2">
                                    <span className="input-group-text">Đổi trả (ngày)</span>
                                    <input type="number" className="form-control" value={returnDays} onChange={(e) => setReturnDays(e.target.value)} />
                                </div>
                                <div className="form-check form-switch mb-2">
                                    <input className="form-check-input" type="checkbox" checked={hasFashionInsurance} onChange={(e) => setHasFashionInsurance(e.target.checked)} />
                                    <label className="form-check-label">Bảo hiểm thời trang</label>
                                </div>
                            </div>
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
    const [imagesProduct, setImagesProduct] = useState('');
    const [priceProduct, setPriceProduct] = useState(Number);
    const [desProduct, setDesProduct] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stockQuantity, setStockQuantity] = useState(100);
    const [categories, setCategories] = useState([]);
    const [auditInfo, setAuditInfo] = useState({});
    const [freeShipping, setFreeShipping] = useState(false);
    const [shippingNote, setShippingNote] = useState('');
    const [returnDays, setReturnDays] = useState(15);
    const [hasFashionInsurance, setHasFashionInsurance] = useState(false);
    const [variants, setVariants] = useState([]);
    const [productMongoId, setProductMongoId] = useState('');
    const [newVariant, setNewVariant] = useState({ color: '', color_hex: '', size: '', size_note: '', stock_quantity: 0, price_adjustment: 0, img: '' });
    const [activeTab, setActiveTab] = useState('info');
    const { useEffect } = require('react');

    useEffect(() => {
        if (showModalEdit && idProduct) {
            request.get('/api/categories').then((res) => setCategories(res.data));
            request.get(`/api/product/${idProduct}`).then((res) => {
                const p = res.data;
                if (p) {
                    setProductMongoId(p._id);
                    setNameProduct(p.nameProducts || '');
                    setImgProduct(p.img || '');
                    setImagesProduct((p.images || []).join(', '));
                    setPriceProduct(p.priceNew || '');
                    setDesProduct(p.des || '');
                    setCategoryId(p.category_id || '');
                    setStockQuantity(p.stock_quantity ?? 100);
                    setFreeShipping(p.free_shipping || false);
                    setShippingNote(p.shipping_note || '');
                    setReturnDays(p.return_days ?? 15);
                    setHasFashionInsurance(p.has_fashion_insurance || false);
                    setAuditInfo({ created_by: p.created_by, created_at: p.created_at, modified_by: p.modified_by, modified_at: p.modified_at });
                    if (p._id) request.get(`/api/variants/${p._id}`).then((r) => setVariants(r.data || []));
                }
            });
        }
    }, [showModalEdit, idProduct]);

    const handleEditProduct = async () => {
        try {
            const res = await request.post('/api/editproduct', {
                nameProduct, imgProduct,
                images: imagesProduct,
                priceProduct, desProduct, id: idProduct,
                category_id: categoryId,
                stock_quantity: Number(stockQuantity),
                free_shipping: freeShipping,
                shipping_note: shippingNote,
                return_days: Number(returnDays),
                has_fashion_insurance: hasFashionInsurance,
            });
            toast.success(res.data.message);
        } catch (error) {}
    };

    const handleAddVariant = async () => {
        try {
            const res = await request.post('/api/addvariant', { ...newVariant, product_id: productMongoId });
            toast.success(res.data.message);
            request.get(`/api/variants/${productMongoId}`).then((r) => setVariants(r.data || []));
            setNewVariant({ color: '', color_hex: '', size: '', size_note: '', stock_quantity: 0, price_adjustment: 0, img: '' });
        } catch {}
    };

    const handleDeleteVariant = async (id) => {
        await request.post('/api/deletevariant', { id });
        setVariants((prev) => prev.filter((v) => v._id !== id));
    };

    const tabStyle = (tab) => ({
        padding: '8px 16px', cursor: 'pointer', border: 'none',
        borderBottom: activeTab === tab ? '2px solid #0d6efd' : '2px solid transparent',
        background: 'none', color: activeTab === tab ? '#0d6efd' : '#555', fontWeight: activeTab === tab ? 600 : 400,
    });

    return (
        <div>
            <Modal show={showModalEdit} onHide={handleClose} size="lg">
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Sửa Sản Phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '16px' }}>
                        <button style={tabStyle('info')} onClick={() => setActiveTab('info')}>Thông tin chung</button>
                        <button style={tabStyle('variants')} onClick={() => setActiveTab('variants')}>Biến thể ({variants.length})</button>
                    </div>

                    {activeTab === 'info' && (
                        <>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Danh mục</span>
                                        <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Tên SP</span>
                                        <input type="text" className="form-control" value={nameProduct} onChange={(e) => setNameProduct(e.target.value)} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Giá</span>
                                        <input type="number" className="form-control" value={priceProduct} onChange={(e) => setPriceProduct(e.target.value)} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Tồn kho</span>
                                        <input type="number" className="form-control" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Mô tả</span>
                                        <input type="text" className="form-control" value={desProduct} onChange={(e) => setDesProduct(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <div className="input-group">
                                            <span className="input-group-text">Ảnh chính</span>
                                            <input type="text" className="form-control" value={imgProduct} onChange={(e) => setImgProduct(e.target.value)} />
                                        </div>
                                        {imgProduct && <img src={imgProduct} alt="" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain', marginTop: '6px', border: '1px solid #dee2e6', borderRadius: '4px' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Ảnh phụ (cách nhau bằng dấu phẩy)</label>
                                        <textarea className="form-control" rows={2} value={imagesProduct} onChange={(e) => setImagesProduct(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <hr />
                            <h6 className="mb-3">Chính sách & Vận chuyển</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} />
                                        <label className="form-check-label">Miễn phí vận chuyển</label>
                                    </div>
                                    {!freeShipping && (
                                        <div className="input-group mb-2">
                                            <span className="input-group-text">Ghi chú VC</span>
                                            <input type="text" className="form-control" value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} />
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group mb-2">
                                        <span className="input-group-text">Đổi trả (ngày)</span>
                                        <input type="number" className="form-control" value={returnDays} onChange={(e) => setReturnDays(e.target.value)} />
                                    </div>
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" checked={hasFashionInsurance} onChange={(e) => setHasFashionInsurance(e.target.checked)} />
                                        <label className="form-check-label">Bảo hiểm thời trang</label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 p-3 bg-light border rounded">
                                <h6 className="mb-2">Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-1"><small className="text-muted"><strong>Ngày tạo:</strong> {auditInfo.created_at ? new Date(auditInfo.created_at).toLocaleString('vi-VN') : '-'}</small></div>
                                    <div className="col-md-6 mb-1"><small className="text-muted"><strong>Người tạo:</strong> {auditInfo.created_by || '-'}</small></div>
                                    <div className="col-md-6 mb-1"><small className="text-muted"><strong>Ngày sửa:</strong> {auditInfo.modified_at ? new Date(auditInfo.modified_at).toLocaleString('vi-VN') : '-'}</small></div>
                                    <div className="col-md-6 mb-1"><small className="text-muted"><strong>Người sửa:</strong> {auditInfo.modified_by || '-'}</small></div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'variants' && (
                        <div>
                            {/* Danh sách biến thể hiện có */}
                            {variants.length > 0 ? (
                                <table className="table table-sm table-bordered mb-3">
                                    <thead className="table-light">
                                        <tr><th>Màu</th><th>Size</th><th>Ghi chú</th><th>Tồn kho</th><th></th></tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((v) => (
                                            <tr key={v._id}>
                                                <td>
                                                    {v.color_hex && <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: v.color_hex, border: '1px solid #ccc', marginRight: 4, verticalAlign: 'middle' }} />}
                                                    {v.color}
                                                </td>
                                                <td>{v.size}</td>
                                                <td><small className="text-muted">{v.size_note}</small></td>
                                                <td>{v.stock_quantity}</td>
                                                <td>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteVariant(v._id)}>Xóa</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-muted text-center">Chưa có biến thể nào.</p>
                            )}

                            {/* Form thêm biến thể mới */}
                            <div className="border rounded p-3 bg-light">
                                <h6 className="mb-3">Thêm biến thể mới</h6>
                                <div className="row g-2">
                                    <div className="col-md-4">
                                        <input type="text" className="form-control form-control-sm" placeholder="Màu (VD: Đỏ phối Be)" value={newVariant.color} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="color" className="form-control form-control-sm form-control-color" title="Mã màu" value={newVariant.color_hex || '#ffffff'} onChange={(e) => setNewVariant({ ...newVariant, color_hex: e.target.value })} />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="text" className="form-control form-control-sm" placeholder="Size (S/M/L/XL)" value={newVariant.size} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} />
                                    </div>
                                    <div className="col-md-4">
                                        <input type="text" className="form-control form-control-sm" placeholder="Ghi chú (unisex, babytee nữ...)" value={newVariant.size_note} onChange={(e) => setNewVariant({ ...newVariant, size_note: e.target.value })} />
                                    </div>
                                    <div className="col-md-3">
                                        <input type="number" className="form-control form-control-sm" placeholder="Tồn kho" value={newVariant.stock_quantity} onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: e.target.value })} />
                                    </div>
                                    <div className="col-md-3">
                                        <input type="number" className="form-control form-control-sm" placeholder="Chênh lệch giá" value={newVariant.price_adjustment} onChange={(e) => setNewVariant({ ...newVariant, price_adjustment: e.target.value })} />
                                    </div>
                                    <div className="col-md-4">
                                        <input type="text" className="form-control form-control-sm" placeholder="URL ảnh màu này" value={newVariant.img} onChange={(e) => setNewVariant({ ...newVariant, img: e.target.value })} />
                                    </div>
                                    <div className="col-md-2">
                                        <button className="btn btn-primary btn-sm w-100" onClick={handleAddVariant}>+ Thêm</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                    {activeTab === 'info' && <Button variant="primary" onClick={handleEditProduct}>Lưu Lại</Button>}
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
