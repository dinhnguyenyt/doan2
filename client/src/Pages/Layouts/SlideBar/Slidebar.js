import classNames from 'classnames/bind';
import styles from './Slidebar.module.scss';
import { useEffect, useState } from 'react';
import request from '../../../config/Connect';

const cx = classNames.bind(styles);

function SlideBar({ setValueType, valueMin, setValueMin, valueMax, setValueMax, setSearchValue }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        request.get('/api/categories').then((res) => setCategories(res.data));
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('select-option')}>
                {/* Tìm kiếm theo tên */}
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Tìm kiếm</h4>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tên sản phẩm..."
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                {/* Lọc theo danh mục */}
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Danh mục</h4>
                    <select
                        className="form-select"
                        onChange={(e) => setValueType(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Lọc theo giá */}
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>
                        Khoảng giá
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Từ"
                            value={valueMin}
                            min={0}
                            onChange={(e) => setValueMin(Number(e.target.value))}
                            style={{ width: '50%' }}
                        />
                        <span>—</span>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Đến"
                            value={valueMax}
                            min={0}
                            onChange={(e) => setValueMax(Number(e.target.value))}
                            style={{ width: '50%' }}
                        />
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#666' }}>
                        {valueMin.toLocaleString()} VNĐ — {valueMax.toLocaleString()} VNĐ
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SlideBar;
