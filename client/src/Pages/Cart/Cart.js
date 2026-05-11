import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Cart.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import Banner from '../Layouts/Banner/Banner';
import request from '../../config/Connect';

import { removeProduct } from '../../redux/actions';
import { useDispatch } from 'react-redux';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

// Key duy nhất cho mỗi dòng giỏ hàng: id + size + color
const cartKey = (item) => `${item.id}_${item.selectedSize || ''}_${item.selectedColor || ''}`;

function CartUser() {
    const [cartItems, setCartItems] = useState([]);
    const [quantity, setQuantity] = useState({});
    const token = document.cookie;
    const dispatch = useDispatch();

    useEffect(() => {
        const parsedCart = JSON.parse(localStorage.getItem('products') || '[]');
        setCartItems(parsedCart);
        // Khởi tạo quantity mặc định = 1 cho mỗi dòng
        const initQty = {};
        parsedCart.forEach((item) => { initQty[cartKey(item)] = 1; });
        setQuantity(initQty);
    }, []);

    const total = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.priceNew * (quantity[cartKey(item)] || 1), 0);
    }, [cartItems, quantity]);

    const handleIncreaseQuantity = (key) => {
        setQuantity((prev) => ({ ...prev, [key]: (prev[key] || 1) + 1 }));
    };

    const handleDecreaseQuantity = (key) => {
        setQuantity((prev) => ({ ...prev, [key]: Math.max((prev[key] || 1) - 1, 1) }));
    };

    const handleDeleteProduct = (item) => {
        const key = cartKey(item);
        const updated = cartItems.filter((c) => cartKey(c) !== key);
        setCartItems(updated);
        localStorage.setItem('products', JSON.stringify(updated));
        setQuantity((prev) => { const n = { ...prev }; delete n[key]; return n; });
    };

    const handlePostCart = async () => {
        if (!token) {
            toast.error('Bạn Cần Đăng Nhập !!!');
            return;
        }
        if (cartItems.length <= 0) {
            toast.error('Vui lòng thêm sản phẩm vào giỏ hàng');
            return;
        }
        try {
            const dataToSend = cartItems.map((item) => ({
                id:       item.id,
                quantity: quantity[cartKey(item)] || 1,
                size:     item.selectedSize  || '',
                color:    item.selectedColor || '',
            }));
            const res = await request.post('/api/cart', dataToSend);
            dispatch(removeProduct([]));
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi xử lý giỏ hàng');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header><Header /></header>
            <div><Banner /></div>
            <main>
                <div className={cx('inner')}>
                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Sản phẩm</th>
                                    <th scope="col">Size / Màu</th>
                                    <th scope="col">Đơn giá</th>
                                    <th scope="col">Số lượng</th>
                                    <th scope="col">Thành tiền</th>
                                    <th scope="col">Xoá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => {
                                    const key = cartKey(item);
                                    const qty = quantity[key] || 1;
                                    return (
                                        <tr key={key}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <img src={item.img} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                                                    <span>{item.nameProducts}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {item.selectedSize && (
                                                    <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4, fontSize: 13, marginRight: 4 }}>
                                                        {item.selectedSize}
                                                    </span>
                                                )}
                                                {item.selectedColor && (
                                                    <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>
                                                        {item.selectedColor}
                                                    </span>
                                                )}
                                                {!item.selectedSize && !item.selectedColor && <span style={{ color: '#aaa', fontSize: 12 }}>—</span>}
                                            </td>
                                            <td>{item?.priceNew?.toLocaleString()} VNĐ</td>
                                            <td>
                                                <div className={cx('btn-value-products')}>
                                                    <button onClick={() => handleDecreaseQuantity(key)}>-</button>
                                                    <span>{qty}</span>
                                                    <button onClick={() => handleIncreaseQuantity(key)}>+</button>
                                                </div>
                                            </td>
                                            <td>{(item.priceNew * qty).toLocaleString()} VNĐ</td>
                                            <td>
                                                <button onClick={() => handleDeleteProduct(item)} type="button" className="btn btn-danger btn-sm">
                                                    Xoá
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td colSpan="4"><strong>Tổng cộng</strong></td>
                                    <td><strong>{total.toLocaleString()} VNĐ</strong></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className={cx('btn-cart')}>
                        <Link to="/category"><button>Tiếp tục mua sắm</button></Link>
                        <Link to="/checkout"><button onClick={handlePostCart}>Tiến hành thanh toán</button></Link>
                    </div>
                </div>
            </main>
            <footer><Footer /></footer>
        </div>
    );
}

export default CartUser;
