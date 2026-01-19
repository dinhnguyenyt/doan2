import classNames from 'classnames/bind';
import styles from './Products.module.scss';
import { ModalAddProduct, ModalDeleteProduct, ModalEditProduct } from '../../../Modal/Modal';

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
    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-product')}>
                <h1>Products</h1>
                <div>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        onChange={(e) => setValueType(e.target.value)}
                    >
                        <>
                            <option value="" selected>
                                Type
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
                    style={{ margin: '20px' }}
                    type="button"
                    className="btn btn-primary"
                >
                    Add Products
                </button>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name Product</th>
                        <th scope="col">Img Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Handle</th>
                    </tr>
                </thead>
                <tbody>
                    {dataProducts
                        .filter((item) => valueType === '' || item.checkProducts === valueType)
                        .map((item) => (
                            <>
                                <tr key={item._id}>
                                    <th scope="row">{item.id}</th>
                                    <td>{item.nameProducts}</td>
                                    <td>
                                        <img style={{ width: '120px' }} src={item.img} alt="." />
                                    </td>
                                    <td>$ {item.priceNew.toLocaleString()}</td>
                                    <td>
                                        <button
                                            onClick={() => handleShowModalEditProduct(item.id)}
                                            type="button"
                                            className="btn btn-warning"
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
                            </>
                        ))}
                </tbody>
            </table>
            <ModalAddProduct show={show} setShow={setShow} />
            <ModalDeleteProduct
                showModalDelete={showModalDelete}
                setShowModalDelete={setShowModalDelete}
                idProduct={idProduct}
            />
            <ModalEditProduct showModalEdit={showModalEdit} setShowModalEdit={setShowModalEdit} idProduct={idProduct} />
        </div>
    );
}

export default Products;
