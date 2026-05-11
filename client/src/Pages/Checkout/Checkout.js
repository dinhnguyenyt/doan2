import classNames from 'classnames/bind';
import styles from './Checkout.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import Banner from '../Layouts/Banner/Banner';
import request from '../../config/Connect';

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../Layouts/Loading/Loading';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Checkout() {
    const [dataCart, setDataCart] = useState({});
    const [checkBox, setCheckBox] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);

    // Địa chỉ đã lưu
    const [savedAddress, setSavedAddress] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    // Form nhập mới (chỉ dùng khi useNewAddress = true)
    const [firstName, setFirsName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');

    const navigate = useNavigate();
    const token = document.cookie;

    // Địa chỉ thực sự dùng khi đặt hàng
    const dataAddress = useNewAddress || !savedAddress
        ? { firstName, lastName, phoneNumber, email, country, addressLine1, city }
        : {
            firstName: savedAddress.fullname?.split(' ')[0] || '',
            lastName:  savedAddress.fullname?.split(' ').slice(1).join(' ') || '',
            phoneNumber: savedAddress.phone || '',
            email: '',
            country: savedAddress.country || '',
            addressLine1: savedAddress.address_line1 || '',
            city: savedAddress.city || '',
          };

    useEffect(() => {
        if (token) {
            request.get('/api/getcart').then((res) => {
                // Chỉ hiển thị khi cart có sản phẩm thực sự
                const cart = res.data?.[0];
                if (cart && cart.products && cart.products.length > 0) {
                    setDataCart(cart);
                } else {
                    setDataCart(null);
                }
            }).catch(() => setDataCart(null));
            request.get('/api/address').then((res) => setSavedAddress(res.data)).catch(() => {});
        }
    }, [token]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return toast.error('Vui lòng nhập mã giảm giá');
        try {
            const res = await request.post('/api/check-coupon', { code: couponCode });
            setDiscountPercent(res.data.discount_percent);
            toast.success(res.data.message);
        } catch (error) {
            setDiscountPercent(0);
            toast.error(error.response?.data?.message || 'Lỗi áp dụng mã');
        }
    };

    const validateBeforePayment = () => {
        if (!checkBox) {
            toast.error('Vui lòng chấp nhận điều khoản & điều kiện');
            return false;
        }
        // Đã có địa chỉ mặc định và đang dùng nó → bỏ qua validate form
        if (savedAddress && !useNewAddress) return true;
        // Chưa có địa chỉ hoặc đang dùng địa chỉ khác → validate form billing
        const missing = [firstName, lastName, companyName, phoneNumber, email, country, addressLine1, addressLine2, city, zip].some(v => v === '');
        if (missing) {
            toast.error('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng');
            return false;
        }
        return true;
    };

    const handlePaymentMomo = async () => {
        if (!validateBeforePayment()) return;
        if (!dataCart) {
            toast.error('Giỏ hàng trống, vui lòng thêm sản phẩm');
        } else {
            try {
                setIsLoading(true);
                const res = await request.post('/api/paymentmomo', {
                    dataAddress,
                    couponCode: discountPercent > 0 ? couponCode : ''
                });
                if (res) {
                    setIsLoading(false);
                    toast.success(res.data.message);
                    await request.post('/api/clearcart');
                    window.open(res.data);
                    navigate('/thanks');
                }
            } catch (error) {
                toast.error(error.response.data.message);
            }
        }
    };

    const handlePayment = async () => {
        if (!validateBeforePayment()) return;
        if (!dataCart) {
            toast.error('Giỏ hàng trống, vui lòng thêm sản phẩm');
        } else {
            try {
                setIsLoading(true);
                await request.post('/api/payment', {
                    dataAddress,
                    couponCode: discountPercent > 0 ? couponCode : ''
                });
                await request.post('/api/clearcart');
                setIsLoading(false);
                navigate('/thanks');
            } catch (error) {
                setIsLoading(false);
                toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi thanh toán');
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header>
                <Header />
            </header>

            <Loading isLoading={isLoading} />

            <div>
                <Banner />
            </div>

            <main className={cx('inner')}>
                <div className={cx('inner-checkout')}>
                    <div className={cx('column-billing')}>
                        {/* Địa chỉ đã lưu */}
                        {savedAddress && (
                            <div style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <strong style={{ fontSize: 15 }}>📍 Địa chỉ giao hàng đã lưu</strong>
                                    <span style={{ fontSize: 12, color: useNewAddress ? '#aaa' : '#26aa99', fontWeight: 600 }}>
                                        {useNewAddress ? '' : '✓ Đang dùng'}
                                    </span>
                                </div>
                                <div style={{ fontSize: 13, color: '#444', lineHeight: 1.7 }}>
                                    <div><strong>{savedAddress.fullname}</strong> · {savedAddress.phone}</div>
                                    {savedAddress.company && <div>{savedAddress.company}</div>}
                                    <div>{savedAddress.address_line1}{savedAddress.address_line2 ? `, ${savedAddress.address_line2}` : ''}</div>
                                    <div>{savedAddress.city}{savedAddress.country ? `, ${savedAddress.country}` : ''} {savedAddress.zip}</div>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}>
                                        <input
                                            type="checkbox"
                                            checked={useNewAddress}
                                            onChange={(e) => setUseNewAddress(e.target.checked)}
                                        />
                                        Giao đến địa chỉ khác
                                    </label>
                                </div>
                            </div>
                        )}

                        <h1 id={cx('title-billing')} style={{ display: (!savedAddress || useNewAddress) ? 'block' : 'none' }}>Billing Details</h1>
                        <div style={{ display: (!savedAddress || useNewAddress) ? 'block' : 'none' }}>
                        <div className={cx('input-name')}>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="First name"
                                    onChange={(e) => setFirsName(e.target.value)}
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Last name"
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Company name"
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={cx('input-name')}>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Phone number"
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Email Address"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Country"
                            onChange={(e) => setCountry(e.target.value)}
                        />
                        <div></div>

                        <div className="mt-5">
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Address line 01"
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Address line 02"
                                    onChange={(e) => setAddressLine2(e.target.value)}
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Town/City"
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <div className="input-group mb-3 mt-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="PostCode/ZIP"
                                    onChange={(e) => setZip(e.target.value)}
                                />
                            </div>
                        </div>
                        </div>{/* end collapsible billing form */}
                    </div>

                    <div className={cx('form-order')}>
                        <div className={cx('inner-order')}>
                            <h1 id={cx('title-order')}>You Oder</h1>

                            <div>
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col">Sản phẩm</th>
                                            <th scope="col">Size</th>
                                            <th scope="col">SL</th>
                                            <th scope="col">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataCart?.products?.map((item) => (
                                            <tr key={item?._id}>
                                                <td>{item?.nameProduct}</td>
                                                <td>
                                                    {item?.size && (
                                                        <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: 3, fontSize: 12 }}>
                                                            {item.size}
                                                        </span>
                                                    )}
                                                    {item?.color && (
                                                        <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: 3, fontSize: 12, marginLeft: 4 }}>
                                                            {item.color}
                                                        </span>
                                                    )}
                                                    {!item?.size && !item?.color && <span style={{ color: '#aaa' }}>—</span>}
                                                </td>
                                                <td>x {item?.quantity}</td>
                                                <td>{item.price?.toLocaleString()} VNĐ</td>
                                            </tr>
                                        ))}
                                    </tbody>

                                    <tbody>
                                        <tr>
                                            <td>Subtotal</td>
                                            <td></td>
                                            <td>{dataCart?.sumPrice?.toLocaleString()} VNĐ</td>
                                        </tr>
                                        {discountPercent > 0 && (
                                            <tr>
                                                <td>Discount ({discountPercent}%)</td>
                                                <td></td>
                                                <td>- {(dataCart?.sumPrice * discountPercent / 100).toLocaleString()} VNĐ</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td>Total</td>
                                            <td></td>
                                            <td>{(dataCart?.sumPrice * (1 - discountPercent / 100)).toLocaleString()} VNĐ</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="input-group mb-3 px-3">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Gift card or discount code" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)} 
                                />
                                <button className="btn btn-outline-secondary" onClick={handleApplyCoupon} type="button">Apply</button>
                            </div>

                            <div className={cx('form-pay')}>
                                <div className={cx('checkbox-terms')}>
                                    <input onChange={(e) => setCheckBox(e.target.checked)} type="checkbox" />
                                    <label>I’ve read and accept the terms & conditions*</label>
                                </div>

                                <div className={cx('payment-momo')}>
                                    <button onClick={handlePaymentMomo}>
                                        <img
                                            src={
                                                'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png'
                                            }
                                            alt=""
                                        />
                                        <span>Payments in VNPAY</span>
                                    </button>
                                </div>

                                <div className={cx('continue')}>
                                    <button onClick={handlePayment}>
                                        <span>Payment on delivery</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Checkout;
