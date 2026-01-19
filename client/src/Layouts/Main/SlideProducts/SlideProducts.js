import classNames from 'classnames/bind';
import styles from './SlideProducts.module.scss';
import Slider from 'react-slick';

import latest1 from './img/img.jpg';
import latest2 from './img/img4.jpg';
import latest3 from './img/img2.jpg';
import latest4 from './img/img3.jpg';

const cx = classNames.bind(styles);

function SlideProducts() {
    const checkScreen = window.screen.width;

    const settings = {
        className: 'center',
        infinite: true,
        centerPadding: '60px',
        slidesToShow: checkScreen < 400 ? 1 : 4,
        swipeToSlide: true,
        autoplay: true,
        speed: 100,
        cssEase: 'linear',
    };
    return (
        <div className={cx('wrapper')}>
            <header className={cx('header-slide')}>
                <h3>Trending This Week</h3>
                <div className={cx('select-products')}>
                    <button>Men</button>
                    <button>Women</button>
                    <button>Baby</button>
                    <button>Fashion</button>
                </div>
            </header>

            <div className={cx('slider-container')}>
                <Slider {...settings}>
                    <div>
                        <img src={latest1} alt="..." />
                    </div>
                    <div>
                        <img src={latest2} alt="..." />
                    </div>
                    <div>
                        <img src={latest3} alt="..." />
                    </div>
                    <div>
                        <img src={latest4} alt="..." />
                    </div>
                </Slider>
            </div>
        </div>
    );
}

export default SlideProducts;
