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
    const [dataCart, setDataCart] = useState([]);

    const token = document.cookie;
    const dataToken = jwtDecode(token);

    useEffect(() => {
        request.get('/api/successPayment').then((res) => res.data.map((item) => setDataCart(item)));
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

                        <>
                            <h3>Thank You For Your Order !</h3>
                            <p>
                                Dear {dataToken?.email}, I would like to express my sincere gratitude for the successful
                                purchase transaction. Your assistance and professionalism throughout the process were
                                greatly appreciated. Thank you for providing excellent service and ensuring a smooth
                                transaction. I am delighted with my purchase and look forward to future interactions
                                with your company.
                            </p>
                        </>
                    </header>

                    <main>
                        <div>
                            <table className={cx('table table-hover')}>
                                <thead>
                                    <tr>
                                        <th scope="col">Product</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataCart?.map((item) =>
                                        item?.products?.map((item2) => (
                                            <tr key={item2?._id}>
                                                <td>{item2?.nameProduct}</td>
                                                <td>x {item2?.quantity}</td>
                                                <td>$ {item2.price?.toLocaleString()}</td>
                                            </tr>
                                        )),
                                    )}
                                </tbody>

                                <tbody>
                                    <tr>
                                        <td>Sub Total</td>
                                        <td></td>
                                        {dataCart?.map((item) => (
                                            <td key={item._id}>${item.sumPrice.toLocaleString()} </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
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
