import classNames from 'classnames/bind';
import styles from './ItemProducts.module.scss';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import request from '../../../config/Connect';

const cx = classNames.bind(styles);

function getAllDescendantIds(catId, allCats, visited = new Set()) {
    if (visited.has(String(catId))) return [];
    visited.add(String(catId));
    const children = allCats.filter(c =>
        c.parent_ids && c.parent_ids.some(pid => String(pid) === String(catId))
    );
    const ids = children.map(c => String(c._id));
    children.forEach(c => ids.push(...getAllDescendantIds(c._id, allCats, visited)));
    return ids;
}

function ItemProducts() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        Promise.all([
            request.get('/api/categories'),
            request.get('/api/products'),
        ]).then(([catRes, prodRes]) => {
            const cats  = catRes.data  || [];
            const prods = prodRes.data || [];

            const rootCats = cats.filter(c => !c.parent_ids || c.parent_ids.length === 0);

            const result = rootCats.map(root => {
                const descIds = getAllDescendantIds(root._id, cats);
                const allIds  = new Set([String(root._id), ...descIds]);
                const product = prods.find(p => allIds.has(String(p.category_id)));
                return product ? { category: root, product } : null;
            }).filter(Boolean);

            setItems(result);
        });
    }, []);

    if (items.length === 0) return null;

    return (
        <div className={cx('wrapper')}>
            {items.map(({ category, product }) => (
                <Link
                    key={category._id}
                    to={`/category?category_id=${category._id}`}
                    className={cx('row-product')}
                    style={{ textDecoration: 'none' }}
                >
                    <img
                        id={cx('img-item')}
                        src={product.img}
                        alt={category.name}
                        onError={e => { e.target.src = 'https://picsum.photos/seed/default/320/400'; }}
                    />
                    <span>{category.name}</span>
                </Link>
            ))}
        </div>
    );
}

export default ItemProducts;
