import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Logo from './img/logo.png';
import request from '../../config/Connect';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faBars, faCartPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import useDebounce from '../../customHook/useDebounce'; // import để sử dụng hook để debounce

const cx = classNames.bind(styles);

function Header() {
    const token = document.cookie;

    const [showMenu, setShowMenu] = useState(false);
    const [dataSearch, setDataSearch] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [checkHeader, setCheckHeader] = useState(5);

    const debounce = useDebounce(searchValue, 500);  // gán giá trị cho các tham số đã tạo ở hook useDebounce

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    };

    useEffect(() => { // sử dụng hook useEffect để gán giá trị cho các tham số không tạo ở hook useDebounce
        try {
            if (searchValue === '') {  
                return;
            }
            request.get('/api/search', { params: { nameProduct: debounce } }).then((res) => setDataSearch(res.data)); 
        } catch (error) {
            console.log(error);
        }
    }, [debounce]); 

    return (
        <div className={cx('wrapper')}>
            <Link style={{ textDecoration: 'none' }} to="/">
                <div className={cx('logo')}>
                    <img src={Logo} alt="" />
                    <h1>ALIBARBIE</h1>
                </div>
            </Link>

            <div className={cx('')}>
                <div className={cx('input-search')}>
                    <input onChange={(e) => setSearchValue(e.target.value)} />
                    <FontAwesomeIcon icon={faSearch} style={{ paddingRight: '15px' }} />
                </div>
                <div className={cx('search-result')}>
                    {dataSearch.length > 0 && searchValue ? (
                        <div className={cx('result')}>
                            {dataSearch.map((item) => (
                                <Link to={`/prodetail/${item?.id}`} key={item?._id} id={cx('test')}>
                                    <div className={cx('form-result')}>
                                        <img id={cx('img-result')} src={item?.img} alt="" />
                                        <h5>{item?.nameProducts}</h5>
                                        <span>{item?.priceNew?.toLocaleString()} đ</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>

            <div onClick={handleShowMenu} id={cx('btn-menu')}>
                <span>Menu</span>
                <FontAwesomeIcon icon={faBars} />
            </div>

            <div className={cx('controller', showMenu ? 'controller' : 'show')}>
                <ul>
                    <Link
                        style={{ textDecoration: 'none', color: '#333' }}
                        to="/category"
                        onClick={() => setCheckHeader(0)}
                    >
                        <li className={cx(checkHeader === 0 ? 'checkHeader' : '')}>Products</li>
                    </Link>

                    <Link
                        style={{ textDecoration: 'none', color: '#333' }}
                        to="/blog"
                        onClick={() => setCheckHeader(1)}
                    >
                        <li className={cx(checkHeader === 1 ? 'checkHeader' : '')}>Blog</li>
                    </Link>
                    <Link
                        style={{ textDecoration: 'none', color: '#333' }}
                        to="/contact"
                        onClick={() => setCheckHeader(2)}
                    >
                        <li className={cx(checkHeader === 2 ? 'checkHeader' : '')}>Contact</li>
                    </Link>
                    <Link
                        style={{ textDecoration: 'none', color: '#333' }}
                        to="/checkout"
                        onClick={() => setCheckHeader(3)}
                    >
                        <li className={cx(checkHeader === 3 ? 'checkHeader' : '')}>Checkout</li>
                    </Link>
                    {token ? (
                        <></>
                    ) : (
                        <>
                            <Link style={{ textDecoration: 'none', color: '#333' }} to={token ? '/info' : '/login'}>
                                <li>Login</li>
                            </Link>
                            <Link style={{ textDecoration: 'none', color: '#333' }} to="/cart">
                                <li>Cart</li>
                            </Link>
                        </>
                    )}
                </ul>
            </div>

            <div className={cx('controller-user')}>
                <Link to={token ? '/info' : '/login'}>
                    <button>
                        <FontAwesomeIcon icon={faUser} />
                    </button>
                </Link>
                <Link to="/cart">
                    <button>
                        <FontAwesomeIcon icon={faCartPlus} />
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Header;
