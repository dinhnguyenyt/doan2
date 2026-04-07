import { useState, useEffect } from 'react';
import request from '../../../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [expiry, setExpiry] = useState('');
    const [usageLimit, setUsageLimit] = useState('');

    const fetchCoupons = async () => {
        try {
            const res = await request.get('/api/coupons');
            setCoupons(res.data);
        } catch (error) {
            console.error('Error fetching coupons', error);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleAddCoupon = async () => {
        if (!code || !discount || !expiry || !usageLimit) {
            return toast.error('Vui lòng điền đầy đủ thông tin');
        }

        try {
            const res = await request.post('/api/addcoupon', {
                code,
                discount_percent: Number(discount),
                expiry_date: expiry,
                usage_limit: Number(usageLimit)
            });
            toast.success(res.data.message);
            fetchCoupons();
            setCode('');
            setDiscount('');
            setExpiry('');
            setUsageLimit('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
            try {
                const res = await request.post('/api/deletecoupon', { id });
                toast.success(res.data.message);
                fetchCoupons();
            } catch (error) {
                toast.error('Lỗi khi xóa mã!');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <ToastContainer />
            <h2>Quản Lý Mã Giảm Giá</h2>
            
            <div className="card mb-4">
                <div className="card-body">
                    <h5>Thêm Mã Mới</h5>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Mã Code (vd: SALE50)" value={code} onChange={(e) => setCode(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input type="number" className="form-control" placeholder="Giảm giá (%)" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input type="date" className="form-control" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <input type="number" className="form-control" placeholder="Số lượng phát" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
                        </div>
                        <div className="col-md-1">
                            <button className="btn btn-primary w-100" onClick={handleAddCoupon}>Thêm</button>
                        </div>
                    </div>
                </div>
            </div>

            <table className="table table-bordered border-primary">
                <thead>
                    <tr>
                        <th>Mã Code</th>
                        <th>Khuyến mãi</th>
                        <th>Ngày hết hạn</th>
                        <th>Lượt dùng còn lại</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map((coupon) => (
                        <tr key={coupon._id}>
                            <td><strong>{coupon.code}</strong></td>
                            <td>{coupon.discount_percent}%</td>
                            <td>{new Date(coupon.expiry_date).toLocaleDateString()}</td>
                            <td>{coupon.usage_limit}</td>
                            <td>
                                <button className="btn btn-danger" onClick={() => handleDeleteCoupon(coupon._id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Coupons;
