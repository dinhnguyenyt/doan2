import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';

import request from '../../config/Connect';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct } from '../../redux/actions';

const cx = classNames.bind(styles);

function ProductDetail() {
    const [dataProducts, setDataProducts] = useState();
    const idProduct = window.location.pathname.slice(11, 999);
    const [dataComments, setDataComments] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const dispatch = useDispatch();

    const handleAddProduct = () => {
        dispatch(addProduct(dataProducts));
    };

    useEffect(() => {
        request.get('/api/comment').then((res) => setDataComments(res.data));
    }, []);

    useEffect(() => {
        request
            .get(`/api/getproduct`, {
                params: { id: idProduct },
            })
            .then((res) => setDataProducts(res.data));
    }, [idProduct]);

    const handlePostComments = async (e) => {
        if (e.keyCode === 13) {
            const res = await request.post('/api/postcomment', {
                comment,
            });
            if (res.data) {
                request.get('/api/comment').then((res) => setDataComments(res.data));
                setComment('');
                setRating(0);
            }
        }
        return;
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('form-detail')}>
                <div className={cx('inner-detail')}>
                    <header className={cx('form-info-product')}>
                        <div className={cx('img-product')}>
                            <img src={dataProducts?.img} alt="" />
                        </div>

                        <div className={cx('features-caption')}>
                            <h3>{dataProducts?.nameProducts}</h3>
                            <p>{dataProducts?.author}</p>
                            <span> {dataProducts?.priceNew.toLocaleString()} VNĐ</span>

                            <div className={cx('btn-add-product')}>
                                <button onClick={handleAddProduct}>Add To Cart</button>
                            </div>
                        </div>
                    </header>
                </div>
                <div className={cx('main-detail-product')}>
                    <div className={cx('header-des')}>
                        <button id={cx('nav-one btn-active')}>Description</button>
                    </div>

                    <div className={cx('text-des')}>
                        <p>{dataProducts?.des}</p>
                    </div>
                    <div className={cx('start')}>
                        {[...Array(5)].map((star, index) => {
                            const ratingValue = index + 1;

                            return (
                                <label key={index}>
                                    <input
                                        style={{ display: 'none' }}
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                    />
                                    <svg
                                        className="star"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={ratingValue <= (hover || rating) ? 'gold' : 'grey'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </label>
                            );
                        })}
                    </div>

                    <div>
                        <div className={cx('input-comment')}>
                            <img
                                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
                                alt=""
                            />
                            <input
                                placeholder="Viết Bình Luận..."
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={handlePostComments}
                                value={comment}
                            />
                        </div>

                        <div className={cx('comments-user')}>
                            {dataComments.map((item) => (
                                <div className={cx('form-comment')}>
                                    <img
                                        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
                                        alt=""
                                    />
                                    <div>
                                        <span>@{item.username}</span>
                                        <p>{item.comments}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default ProductDetail;
