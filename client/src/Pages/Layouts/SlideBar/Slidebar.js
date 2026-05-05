import classNames from 'classnames/bind';
import styles from './Slidebar.module.scss';
import { useEffect, useState } from 'react';
import request from '../../../config/Connect';

const cx = classNames.bind(styles);

// Xây đường dẫn đầu tiên (để hiển thị trong dropdown)
function buildFirstPath(catId, allCats, visited = new Set()) {
    if (visited.has(String(catId))) return '';
    const cat = allCats.find((c) => String(c._id) === String(catId));
    if (!cat) return '';
    const parentIds = cat.parent_ids || [];
    if (parentIds.length === 0) return cat.name;
    const newVisited = new Set(visited).add(String(catId));
    const parentPath = buildFirstPath(String(parentIds[0]), allCats, newVisited);
    return parentPath ? `${parentPath} > ${cat.name}` : cat.name;
}

function SlideBar({ setValueType, valueMin, setValueMin, valueMax, setValueMax, setSearchValue }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        request.get('/api/categories').then((res) => setCategories(res.data));
    }, []);

    // Sắp xếp theo đường dẫn đầy đủ để nhóm các danh mục liên quan gần nhau
    const sortedCategories = [...categories].sort((a, b) => {
        const pathA = buildFirstPath(a._id, categories);
        const pathB = buildFirstPath(b._id, categories);
        return pathA.localeCompare(pathB, 'vi');
    });

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
                        {sortedCategories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {buildFirstPath(cat._id, categories)}
                            </option>
                        ))}
                    </select>
                    <small className="text-muted" style={{ fontSize: '12px' }}>
                        Chọn danh mục cha sẽ hiển thị tất cả sản phẩm con
                    </small>
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
