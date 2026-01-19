import classNames from 'classnames/bind';
import styles from './Testimonial.module.scss';

import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

const cx = classNames.bind(styles);

function Testimonial() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Slide>
                    <div className={cx('form-info')}>
                        <h1>Customer Testimonial</h1>
                        <p>
                            Everybody is different, which is why we offer styles for every body. Laborum fuga incidunt
                            laboriosam voluptas iure, delectus dignissimos facilis neque nulla earum.
                        </p>
                        <div>
                            <div>
                                <img
                                    alt=""
                                    src="https://preview.colorlib.com/theme/capitalshop/assets/img/gallery/founder-img.png.webp"
                                />
                            </div>
                            <div>
                                <span>Petey Cruiser</span>
                                <p>Designer at Colorlib</p>
                            </div>
                        </div>
                    </div>
                </Slide>
            </div>
        </div>
    );
}

export default Testimonial;
