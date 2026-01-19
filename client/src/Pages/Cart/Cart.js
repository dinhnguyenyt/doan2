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

function CartUser() {
    const [cartItems, setCartItems] = useState([]);
    const [quantity, setQuantity] = useState({});
    const token = document.cookie;
    const dispatch = useDispatch();

    useEffect(() => {
        const dataCart = localStorage.getItem('products');
        const parsedCart = JSON.parse(dataCart);
        setCartItems(parsedCart || []);
    }, []);

    const total = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.priceNew * (quantity[item.id] || 1), 0);
    }, [cartItems, quantity]);

    const handleIncreaseQuantity = (id) => {
        setQuantity((prevQuantity) => ({
            ...prevQuantity,
            [id]: (prevQuantity[id] || 0) + 1,
        }));
    };

    const handleDecreaseQuantity = (id) => {
        if (quantity[id] > 1) {
            setQuantity((prevQuantity) => ({
                ...prevQuantity,
                [id]: prevQuantity[id] - 1,
            }));
        }
    };

    const handleDeleteProduct = (id) => {
        const updatedCart = [...cartItems];
        const index = updatedCart.findIndex((item) => item.id === id);
        if (index !== -1) {
            updatedCart.splice(index, 1);
            setCartItems(updatedCart);
            localStorage.setItem('products', JSON.stringify(updatedCart));
        }
    };

    const handlePostCart = async () => {
        if (!token) {
            toast.error('Bạn Cần Đăng Nhập !!!');
            return;
        } else if (cartItems.length <= 0) {
            toast.error('Please add product to cart');
        } else {
            try {
                const dataToSend = cartItems.map((item) => ({
                    id: item.id,
                    quantity: quantity[item.id] || 1,
                }));
                const res = await request.post('/api/cart', dataToSend);
                dispatch(removeProduct([]));
                toast.success(res.data.message);
            } catch (error) {
                toast.error(error.response.data.message);
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header>
                <Header />
            </header>
            <div>
                <Banner />
            </div>
            <main>
                <div className={cx('inner')}>
                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Product</th>
                                    <th scope="col">Price</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Total</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nameProducts}</td>
                                        <td>$ {item?.priceNew?.toLocaleString()}</td>
                                        <td>
                                            <div className={cx('btn-value-products')}>
                                                <button onClick={() => handleDecreaseQuantity(item.id)}>-</button>
                                                <span>{quantity[item.id] || 1}</span>
                                                <button onClick={() => handleIncreaseQuantity(item.id)}>+</button>
                                            </div>
                                        </td>
                                        <td>$ {(item.priceNew * (quantity[item.id] || 1)).toLocaleString()}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteProduct(item.id)}
                                                type="button"
                                                className="btn btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="3">Sub Total</td>
                                    <td>$ {total.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className={cx('btn-cart')}>
                        <Link to="/category">
                            <button>Continue Shopping</button>
                        </Link>
                        <Link to="/checkout">
                            <button onClick={handlePostCart}>Proceed to checkout</button>
                        </Link>
                    </div>
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default CartUser;
