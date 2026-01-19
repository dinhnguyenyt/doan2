import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { addProduct } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

const cx = classNames.bind(styles);

function HomePage({ dataProducts }) {
    const dispatch = useDispatch();

    const handleAddProduct = (data) => {
        dispatch(addProduct(data));
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                {dataProducts.map((item) => (
                    <div key={item.id} className={cx('form-slide-products')}>
                        <div className={cx('social-icon')}>
                            <button onClick={() => handleAddProduct(item)}>
                                <FontAwesomeIcon icon={faCartPlus} />
                            </button>

                            <button>
                                <FontAwesomeIcon icon={faHeart} />
                            </button>

                            <button>
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </button>
                        </div>
                        <Link style={{ textDecoration: 'none' }} key={item.id} to={`/prodetail/${item.id}`}>
                            <img src={item.img} alt="" />
                        </Link>
                        <div className={cx('main-slide-products')}>
                            <h1>{item.nameProducts}</h1>
                            <div className={cx('price-slide-products')}>
                                <span id={cx('price-new')}>{item.priceNew.toLocaleString()} VNĐ</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
