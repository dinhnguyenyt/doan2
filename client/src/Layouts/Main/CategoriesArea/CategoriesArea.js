import classNames from 'classnames/bind';
import styles from './CategoriesArea.module.scss';

import services1 from './img/services1.png';
import services2 from './img/services2.png';
import services3 from './img/services3.png';
import services4 from './img/services4.png';

const cx = classNames.bind(styles);

function CategoriesArea() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('row-1')}>
                <img src={services1} alt="" />
                <h5>Fast & Free Delivery</h5>
                <p>Free delivery on all orders</p>
            </div>

            <div className={cx('row-1')}>
                <img src={services2} alt="" />
                <h5>Secure Payment</h5>
                <p>Free delivery on all orders</p>
            </div>

            <div className={cx('row-1')}>
                <img src={services3} alt="" />
                <h5>Money Back Guarantee</h5>
                <p>Free delivery on all orders</p>
            </div>

            <div className={cx('row-1')}>
                <img src={services4} alt="" />
                <h5>Online Support</h5>
                <p>Free delivery on all orders</p>
            </div>
        </div>
    );
}

export default CategoriesArea;
