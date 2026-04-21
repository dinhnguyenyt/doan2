import classNames from 'classnames/bind';
import styles from './SuccessfulPaymentPage.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import request from '../../config/Connect';

import imgCheck from './img/imgCheck.png';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const cx = classNames.bind(styles);

function SuccessfulPaymentPage() {
    const [latestOrder, setLatestOrder] = useState(null);

    const token = document.cookie;
    const dataToken = jwtDecode(token);

    useEffect(() => {
        request.get('/api/successPayment').then((res) => {
            if (res.data && res.data.length > 0) {
                setLatestOrder(res.data[0]);
            }
        });
    }, []);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('inner')}>
                <div className={cx('form-thanks-order')}>
                    <header className={cx('header')}>
                        <img src={imgCheck} alt="" />
                        <h3>Thank You For Your Order !</h3>
                        <p>
                            Dear {dataToken?.email}, I would like to express my sincere gratitude for the successful
                            purchase transaction. Your assistance and professionalism throughout the process were
                            greatly appreciated. Thank you for providing excellent service and ensuring a smooth
                            transaction. I am delighted with my purchase and look forward to future interactions
                            with your company.
                        </p>
                    </header>

                    <main>
                        <div>
                            {latestOrder ? (
                                <table className={cx('table table-hover')}>
                                    <thead>
                                        <tr>
                                            <th scope="col">Product</th>
                                            <th scope="col">Quantity</th>
                                            <th scope="col">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestOrder.products?.map((item) => (
                                            <tr key={item._id}>
                                                <td>{item.nameProduct}</td>
                                                <td>x {item.quantity}</td>
                                                <td>${item.price?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td><strong>Total</strong></td>
                                            <td></td>
                                            <td><strong>${latestOrder.sumPrice?.toLocaleString()}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Payment</td>
                                            <td></td>
                                            <td>{latestOrder.statusPayment ? 'Đã thanh toán (VNPay)' : 'Thanh toán khi nhận hàng (COD)'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#888' }}>Đang tải thông tin đơn hàng...</p>
                            )}
                        </div>
                    </main>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default SuccessfulPaymentPage;
