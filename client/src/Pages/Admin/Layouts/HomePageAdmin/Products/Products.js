import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Products.module.scss';
import { ModalAddProduct, ModalDeleteProduct, ModalEditProduct } from '../../../Modal/Modal';
import { formatDateString } from '../../../../../utils/formatDate';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const cx = classNames.bind(styles);

function Products({
    dataProducts,
    show,
    setShow,
    handleShowModalAddProduct,
    showModalDelete,
    setShowModalDelete,
    handleShowModalDeleteProduct,
    idProduct,
    handleShowModalEditProduct,
    showModalEdit,
    setShowModalEdit,
    setValueType,
    valueType,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [productDetail, setProductDetail] = useState(null);

    const handleOpenView = (product) => {
        setProductDetail(product);
        setShowViewModal(true);
    };

    const filteredProducts = dataProducts.filter((item) => {
        const matchesType = valueType === '' || item.checkProducts === valueType;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            item.nameProducts?.toLowerCase().includes(searchLower) ||
            item.id?.toString().toLowerCase().includes(searchLower);
        return matchesType && matchesSearch;
    });

    return (
        <div className={cx('wrapper')} style={{ padding: '20px' }}>
            <div className={cx('header-product')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0 }}>Quản Lý Sản Phẩm</h3>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1, marginLeft: '20px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm theo tên, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        onChange={(e) => setValueType(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <>
                            <option value="" selected>
                                Tất cả (Type)
                            </option>
                            <option value="perfume">Perfume</option>
                            <option value="scentedCandles">Scented candles</option>
                            <option value="shoe">Shoe</option>
                            <option value="lipstick">Lipstick</option>
                        </>
                    </select>
                </div>

                <button
                    onClick={handleShowModalAddProduct}
                    type="button"
                    className="btn btn-primary"
                >
                    + Thêm Sản Phẩm
                </button>
            </div>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '15px' }}>
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name Product</th>
                        <th scope="col">Img Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Ngày tạo</th>
                        <th scope="col">Người tạo</th>
                        <th scope="col">Ngày sửa</th>
                        <th scope="col">Người sửa</th>
                        <th scope="col">Handle</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length === 0 ? (
                        <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '20px', fontWeight: 'bold' }}>
                                Không tìm thấy sản phẩm nào.
                            </td>
                        </tr>
                    ) : (
                        filteredProducts.map((item) => (
                                <tr key={item._id}>
                                    <th scope="row">{item.id}</th>
                                    <td>{item.nameProducts}</td>
                                    <td>
                                        <img style={{ width: '120px' }} src={item.img} alt="." />
                                    </td>
                                    <td>$ {item.priceNew ? item.priceNew.toLocaleString() : 0}</td>
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
                                            onClick={() => handleShowModalEditProduct(item.id)}
                                            type="button"
                                            className="btn btn-warning"
                                            style={{ marginRight: '10px' }}
                                        >
                                            Edit Product
                                        </button>
                                        <button
                                            onClick={() => handleShowModalDeleteProduct(item.id)}
                                            type="button"
                                            className="btn btn-danger"
                                        >
                                            Delete Product
                                        </button>
                                    </td>
                                </tr>
                            ))
                    )}
                </tbody>
            </table>
            </div>
            <ModalAddProduct show={show} setShow={setShow} />
            <ModalDeleteProduct
                showModalDelete={showModalDelete}
                setShowModalDelete={setShowModalDelete}
                idProduct={idProduct}
            />
            <ModalEditProduct showModalEdit={showModalEdit} setShowModalEdit={setShowModalEdit} idProduct={idProduct} />

            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Sản Phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {productDetail && (
                        <div className="row">
                            <div className="col-md-5 text-center">
                                <img src={productDetail.img} alt={productDetail.nameProducts} style={{ width: '100%', maxWidth: '250px', borderRadius: '8px' }} />
                            </div>
                            <div className="col-md-7">
                                <h5>{productDetail.nameProducts}</h5>
                                <p className="mb-1 text-muted"><strong>ID:</strong> {productDetail.id} | <strong>Danh mục loại:</strong> {productDetail.checkProducts || '-'}</p>
                                <p className="mb-1 text-muted"><strong>Giá mới:</strong> ${productDetail.priceNew?.toLocaleString() || 0} | <strong>Giá cũ:</strong> ${productDetail.priceOld?.toLocaleString() || '-'}</p>
                                <p className="mb-1 text-muted"><strong>Mô tả:</strong> {productDetail.des || '-'}</p>
                                <div className="mt-4 p-3 bg-light border rounded">
                                    <h6>Thông tin hệ thống</h6>
                                    <div className="row">
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(productDetail.created_at)}</small>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted text-break"><strong>Người tạo:</strong> {productDetail.created_by || '-'}</small>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(productDetail.modified_at)}</small>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted text-break"><strong>Người sửa:</strong> {productDetail.modified_by || '-'}</small>
                                        </div>
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

export default Products;
