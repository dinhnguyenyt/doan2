import classNames from 'classnames/bind';
import styles from './CategoryGrid.module.scss';
import { useState } from 'react';

const cx = classNames.bind(styles);

function getCategoryIcon(name = '') {
    const n = name.toLowerCase();
    if (n.includes('áo thun') || n.includes('thun')) return '👕';
    if (n.includes('áo sơ mi') || n.includes('sơ mi')) return '👔';
    if (n.includes('khoác')) return '🧥';
    if (n.includes('polo')) return '🎽';
    if (n.includes('blouse')) return '👗';
    if (n.includes('áo')) return '👕';
    if (n.includes('jean')) return '👖';
    if (n.includes('kaki')) return '👖';
    if (n.includes('short') || n.includes('quần ngắn')) return '🩳';
    if (n.includes('quần')) return '👖';
    if (n.includes('váy ngắn') || n.includes('váy')) return '👗';
    if (n.includes('đầm dự tiệc')) return '👘';
    if (n.includes('đầm')) return '💃';
    if (n.includes('thể thao')) return '🏃';
    if (n.includes('trẻ em') || n.includes('bé')) return '🧒';
    if (n.includes('nam')) return '👨';
    if (n.includes('nữ')) return '👩';
    return '🏷️';
}

function CategoryGrid({ categories, setValueType }) {
    const [expanded, setExpanded] = useState(false);

    const level1 = categories.filter((c) => !c.parent_ids || c.parent_ids.length === 0);
    const level2 = categories.filter((c) => c.parent_ids && c.parent_ids.length > 0 &&
        level1.some((l1) => c.parent_ids.some((pid) => String(pid) === String(l1._id))));
    const level3 = categories.filter((c) => c.parent_ids && c.parent_ids.length > 0 &&
        level2.some((l2) => c.parent_ids.some((pid) => String(pid) === String(l2._id))));

    const getChildren = (parentId, source) =>
        source.filter((c) => c.parent_ids.some((pid) => String(pid) === String(parentId)));

    const handleSelect = (catId) => {
        setValueType(catId);
        const el = document.getElementById('product-list-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (level1.length === 0) return null;

    return (
        <div className={cx('wrapper')}>
            {/* Thanh tiêu đề + toggle */}
            <div className={cx('section-header')} onClick={() => setExpanded((v) => !v)}>
                <div className={cx('header-left')}>
                    <span className={cx('header-icon')}>🗂️</span>
                    <div>
                        <h2>Khám phá danh mục</h2>
                        <p>
                            {level1.map((l1) => l1.name).join(' · ')}
                        </p>
                    </div>
                </div>
                <span className={cx('toggle-btn', expanded ? 'toggle-open' : '')}>
                    {expanded ? 'Thu gọn ▲' : 'Xem tất cả ▼'}
                </span>
            </div>

            {/* Nội dung mở rộng */}
            {expanded && (
                <div className={cx('content')}>
                    {level1.map((l1) => {
                        const children2 = getChildren(l1._id, level2);
                        return (
                            <div key={l1._id} className={cx('group')}>
                                <div className={cx('group-header')} onClick={() => handleSelect(l1._id)}>
                                    <span className={cx('group-icon')}>{getCategoryIcon(l1.name)}</span>
                                    <span className={cx('group-name')}>{l1.name}</span>
                                    <span className={cx('group-count')}>{children2.length} danh mục</span>
                                </div>

                                {children2.length > 0 && (
                                    <div className={cx('cards-grid')}>
                                        {children2.map((l2) => {
                                            const children3 = getChildren(l2._id, level3);
                                            return (
                                                <div key={l2._id} className={cx('card')}>
                                                    <div className={cx('card-header')} onClick={() => handleSelect(l2._id)}>
                                                        <span className={cx('card-icon')}>{getCategoryIcon(l2.name)}</span>
                                                        <span className={cx('card-name')}>{l2.name}</span>
                                                    </div>
                                                    {children3.length > 0 && (
                                                        <div className={cx('tags')}>
                                                            {children3.map((l3) => (
                                                                <button
                                                                    key={l3._id}
                                                                    className={cx('tag')}
                                                                    onClick={(e) => { e.stopPropagation(); handleSelect(l3._id); }}
                                                                >
                                                                    {l3.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CategoryGrid;
