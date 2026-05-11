import classNames from 'classnames/bind';
import styles from './SlideProducts.module.scss';
import Slider from 'react-slick';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import request from '../../../config/Connect';

const cx = classNames.bind(styles);

function SlideProducts() {
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        request.get('/api/products').then(res => {
            const sorted = [...(res.data || [])]
                .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
                .slice(0, 12);
            setTrending(sorted);
        });
    }, []);

    const checkScreen = window.screen.width;
    const settings = {
        infinite: true,
        slidesToShow: checkScreen < 480 ? 1 : checkScreen < 768 ? 2 : 4,
        swipeToSlide: true,
        autoplay: true,
        autoplaySpeed: 2500,
        speed: 500,
        cssEase: 'ease',
    };

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header-slide')}>
                <h3>Trending This Week</h3>
                <span className={cx('sub-title')}>Những sản phẩm được yêu thích nhất</span>
            </header>

            <div className={cx('slider-container')}>
                {trending.length > 0 && (
                    <Slider {...settings}>
                        {trending.map(product => (
                            <div key={product._id} className={cx('slide-item')}>
                                <Link to={`/prodetail/${product.id}`} style={{ textDecoration: 'none' }}>
                                    <div className={cx('card')}>
                                        <div className={cx('img-wrap')}>
                                            <img
                                                src={product.img}
                                                alt={product.nameProducts}
                                                onError={e => { e.target.src = 'https://picsum.photos/seed/default/300/400'; }}
                                            />
                                            <span className={cx('like-badge')}>
                                                ❤️ {product.like_count || 0}
                                            </span>
                                        </div>
                                        <div className={cx('card-info')}>
                                            <h5>{product.nameProducts}</h5>
                                            <p>{product.priceNew?.toLocaleString()} VNĐ</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </Slider>
                )}
            </div>
        </div>
    );
}

export default SlideProducts;
