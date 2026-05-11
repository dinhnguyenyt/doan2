import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import request from '../../config/Connect';

const cx = classNames.bind(styles);

function Footer() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        request.get('/api/categories').then((res) => setCategories(res.data || []));
    }, []);

    const level1 = categories.filter((c) => !c.parent_ids || c.parent_ids.length === 0);
    const getChildren = (parentId) =>
        categories.filter((c) => c.parent_ids?.some((pid) => String(pid) === String(parentId)));

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <header>
                    <div className={cx('row-1')}>
                        <div id={cx('row-1-left')}>
                            <h4>Subscribe Newsletter</h4>
                            <p>Subscribe newsletter to get 5% on all products.</p>
                        </div>

                        <div className={cx('row-2')}>
                            <input placeholder="Enter your email" />
                            <button>Subscribe</button>
                        </div>

                        <div className={cx('row-3')}>
                            <a style={{ color: '#fff' }} href="https://www.facebook.com/dinhahihi">
                                <FontAwesomeIcon icon={faFacebook} />
                            </a>
                            <a style={{ color: '#fff' }} href="https://www.facebook.com/dinhahihi">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a style={{ color: '#fff' }} href="https://www.facebook.com/dinhahihi">
                                <FontAwesomeIcon icon={faYoutube} />
                            </a>
                        </div>
                    </div>
                </header>

                <main
                    className={cx('form-list-footer')}
                    style={{ gridTemplateColumns: `repeat(${level1.length + 1}, 1fr)` }}
                >
                    {/* Cột danh mục động theo API */}
                    {level1.map((cat) => {
                        const children = getChildren(cat._id);
                        return (
                            <div key={cat._id} className={cx('column-footer')}>
                                <h4>
                                    <Link to={`/category?category_id=${cat._id}`} className={cx('footer-title-link')}>
                                        {cat.name}
                                    </Link>
                                </h4>
                                <ul>
                                    {children.slice(0, 6).map((child) => (
                                        <li key={child._id}>
                                            <Link to={`/category?category_id=${child._id}`} className={cx('footer-item-link')}>
                                                {child.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}

                    {/* Cột Quick Links cố định */}
                    <div className={cx('column-footer')}>
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/" className={cx('footer-item-link')}>Trang chủ</Link></li>
                            <li><Link to="/category" className={cx('footer-item-link')}>Sản phẩm</Link></li>
                            <li><Link to="/blog" className={cx('footer-item-link')}>Blog</Link></li>
                            <li><Link to="/contact" className={cx('footer-item-link')}>Liên hệ</Link></li>
                            <li><Link to="/cart" className={cx('footer-item-link')}>Giỏ hàng</Link></li>
                        </ul>
                    </div>
                </main>

                <div className={cx('copyright')}>
                    <p>© 2024 Fashion Store. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default Footer;
