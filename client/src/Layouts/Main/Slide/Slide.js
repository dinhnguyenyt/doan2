import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

import classNames from 'classnames/bind';
import styles from './Slide.module.scss';

import imgBanner from './img/imgBanner1.png';
import imgBanner1 from './img/imgBanner2.png';
import imgBanner2 from './img/imgBanner3.png';
const cx = classNames.bind(styles);

function SlideWeb() {
    const slideImages = [
        {
            url: imgBanner,
        },

        {
            url: imgBanner1,
        },
        {
            url: imgBanner2,
        },
    ];

    return (
        <div className={cx('slide-container')}>
            <Slide>
                {slideImages.map((slideImage, index) => (
                    <div key={index}>
                        {<div className={cx('text-img')}></div>}
                        <div className={cx('slides')} style={{ backgroundImage: `url(${slideImage.url})` }}></div>
                    </div>
                ))}
            </Slide>
        </div>
    );
}

export default SlideWeb;
