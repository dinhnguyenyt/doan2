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

function CouponPicker({ title, coupons, selected, onSelect, accentColor }) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ marginBottom: 10 }}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: selected ? `${accentColor}12` : '#f8f9fa',
                    border: `1px solid ${selected ? accentColor : '#dee2e6'}`,
                    borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                    color: selected ? accentColor : '#555', fontWeight: 600, fontSize: 13,
                }}
            >
                <span>
                    {selected
                        ? `✓ ${selected.code} — Giảm ${selected.discount_percent}%`
                        : title}
                </span>
                <span style={{ fontSize: 11, fontWeight: 400, color: '#888' }}>
                    {coupons.length > 0 ? `${coupons.length} mã khả dụng` : 'Không có mã'} {open ? '▲' : '▼'}
                </span>
            </button>

            {open && (
                <div style={{ border: `1px solid ${accentColor}`, borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#fff', maxHeight: 240, overflowY: 'auto' }}>
                    {coupons.length === 0 ? (
                        <div style={{ padding: '14px', color: '#aaa', fontSize: 13, textAlign: 'center' }}>
                            Hiện không có mã nào khả dụng
                        </div>
                    ) : (
                        <>
                            {selected && (
                                <div
                                    onClick={() => { onSelect(null); setOpen(false); }}
                                    style={{ padding: '10px 14px', fontSize: 12, color: '#dc3545', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                                >
                                    ✕ Bỏ chọn mã
                                </div>
                            )}
                            {coupons.map((c) => {
                                const isSelected = selected?._id === c._id;
                                return (
                                    <div
                                        key={c._id}
                                        onClick={() => { onSelect(c); setOpen(false); }}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 14px', cursor: 'pointer',
                                            background: isSelected ? `${accentColor}10` : '#fff',
                                            borderLeft: isSelected ? `3px solid ${accentColor}` : '3px solid transparent',
                                            borderBottom: '1px solid #f5f5f5',
                                        }}
                                    >
                                        <div>
                                            <span style={{ fontWeight: 700, color: accentColor, fontSize: 14, marginRight: 8 }}>{c.code}</span>
                                            <span style={{ fontSize: 12, background: `${accentColor}18`, color: accentColor, borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
                                                -{c.discount_percent}%
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 11, color: '#888' }}>
                                            HSD: {new Date(c.expiry_date).toLocaleDateString('vi-VN')}
                                            {isSelected && <span style={{ color: accentColor, fontWeight: 700, marginLeft: 8 }}>✓</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function Checkout() {
    const [dataCart, setDataCart] = useState({});
    const [checkBox, setCheckBox] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedProductCoupon, setSelectedProductCoupon] = useState(null);
    const [selectedShippingCoupon, setSelectedShippingCoupon] = useState(null);
    const [shippingFee, setShippingFee] = useState(0); // sẽ cập nhật khi triển khai vận chuyển

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
                const cart = res.data?.[0];
                if (cart && cart.products && cart.products.length > 0) {
                    setDataCart(cart);
                } else {
                    setDataCart(null);
                }
            }).catch(() => setDataCart(null));
            request.get('/api/address').then((res) => setSavedAddress(res.data)).catch(() => {});
        }
        request.get('/api/available-coupons').then((res) => setAvailableCoupons(res.data || [])).catch(() => {});
    }, [token]);

    const productCoupons = availableCoupons.filter((c) => (c.type || 'product') === 'product');
    const shippingCoupons = availableCoupons.filter((c) => c.type === 'shipping');

    const productDiscount = selectedProductCoupon ? (dataCart?.sumPrice || 0) * selectedProductCoupon.discount_percent / 100 : 0;
    const shippingDiscount = selectedShippingCoupon ? shippingFee * selectedShippingCoupon.discount_percent / 100 : 0;
    const finalShipping = shippingFee - shippingDiscount;
    const finalTotal = (dataCart?.sumPrice || 0) - productDiscount + finalShipping;

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
                    productCouponCode: selectedProductCoupon?.code || '',
                    shippingCouponCode: selectedShippingCoupon?.code || '',
                    shippingFee,
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
                    productCouponCode: selectedProductCoupon?.code || '',
                    shippingCouponCode: selectedShippingCoupon?.code || '',
                    shippingFee,
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
                                            <td>Tạm tính</td>
                                            <td></td>
                                            <td>{dataCart?.sumPrice?.toLocaleString()} VNĐ</td>
                                        </tr>
                                        {selectedProductCoupon && (
                                            <tr style={{ color: '#198754' }}>
                                                <td>Giảm giá sản phẩm ({selectedProductCoupon.discount_percent}%)</td>
                                                <td></td>
                                                <td>- {productDiscount.toLocaleString()} VNĐ</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td>Phí vận chuyển</td>
                                            <td></td>
                                            <td>
                                                {shippingFee === 0 ? (
                                                    <span style={{ color: '#198754' }}>Miễn phí</span>
                                                ) : selectedShippingCoupon ? (
                                                    <>
                                                        <span style={{ textDecoration: 'line-through', color: '#aaa', marginRight: 6 }}>
                                                            {shippingFee.toLocaleString()} VNĐ
                                                        </span>
                                                        <span style={{ color: '#198754' }}>
                                                            {finalShipping === 0 ? 'Miễn phí' : `${finalShipping.toLocaleString()} VNĐ`}
                                                        </span>
                                                    </>
                                                ) : (
                                                    `${shippingFee.toLocaleString()} VNĐ`
                                                )}
                                            </td>
                                        </tr>
                                        <tr style={{ fontWeight: 700 }}>
                                            <td>Tổng cộng</td>
                                            <td></td>
                                            <td>{finalTotal.toLocaleString()} VNĐ</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Chọn mã giảm giá */}
                            <div className="px-3 mb-3">
                                <CouponPicker
                                    title="Mã giảm giá sản phẩm"
                                    coupons={productCoupons}
                                    selected={selectedProductCoupon}
                                    onSelect={setSelectedProductCoupon}
                                    accentColor="#0d6efd"
                                />
                                <CouponPicker
                                    title="Mã giảm phí vận chuyển"
                                    coupons={shippingCoupons}
                                    selected={selectedShippingCoupon}
                                    onSelect={setSelectedShippingCoupon}
                                    accentColor="#198754"
                                />
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
