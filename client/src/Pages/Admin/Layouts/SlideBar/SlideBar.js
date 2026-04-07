import classNames from 'classnames/bind';
import styles from './SlideBar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBlog, faCartPlus, faFile, faHome, faUser } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function SlideBar({ setActiveList }) {
    const handleActiveList = (data) => {
        setActiveList(data);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('controller')}>
                <ul>
                    <li onClick={() => handleActiveList('dash')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faHome} />
                        <h5>Dashboard</h5>
                    </li>

                    <li onClick={() => handleActiveList('order')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faFile} />
                        <h5>Orders</h5>
                    </li>

                    <li onClick={() => handleActiveList('product')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faCartPlus} />
                        <h5>Products</h5>
                    </li>

                    <li onClick={() => handleActiveList('category')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faCartPlus} />
                        <h5>Categories</h5>
                    </li>

                    <li onClick={() => handleActiveList('coupon')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faCartPlus} />
                        <h5>Coupons</h5>
                    </li>

                    <li onClick={() => handleActiveList('customer')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faUser} />
                        <h5>Customers</h5>
                    </li>

                    <li onClick={() => handleActiveList('blog')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faBlog} />
                        <h5>Blog</h5>
                    </li>

                    <li onClick={() => handleActiveList('comment')}>
                        <FontAwesomeIcon id={cx('icons')} icon={faBlog} />
                        <h5>Comments</h5>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default SlideBar;
