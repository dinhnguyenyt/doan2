import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

import classNames from 'classnames/bind';
import styles from './Slide.module.scss';
import request from '../../../config/Connect';

import imgBanner from './img/imgBanner1.png';
import imgBanner1 from './img/imgBanner2.png';
import imgBanner2 from './img/imgBanner3.png';
const cx = classNames.bind(styles);

// Ảnh tĩnh mặc định - dùng khi chưa cấu hình banner nào trong trang quản trị
// hoặc khi gọi API thất bại, để trang chủ không bao giờ bị trống banner.
const FALLBACK_SLIDES = [{ url: imgBanner }, { url: imgBanner1 }, { url: imgBanner2 }];

function SlideWeb() {
    const navigate = useNavigate();
    const [slides, setSlides] = useState(FALLBACK_SLIDES);

    useEffect(() => {
        request
            .get('/api/banners')
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setSlides(
                        res.data.map((banner) => ({
                            url: banner.image,
                            linkType: banner.link_type,
                            // Route /prodetail/:id dùng field số nguyên `id` của sản phẩm, không phải Mongo _id
                            productId: banner.product_id?.id,
                            categoryId: banner.category_id?._id || banner.category_id,
                            externalUrl: banner.external_url,
                        })),
                    );
                }
            })
            .catch(() => {
                // Giữ nguyên FALLBACK_SLIDES nếu gọi API lỗi
            });
    }, []);

    const handleClickSlide = (slide) => {
        if (slide.linkType === 'product' && slide.productId) {
            navigate(`/prodetail/${slide.productId}`);
        } else if (slide.linkType === 'category' && slide.categoryId) {
            navigate(`/category?category_id=${slide.categoryId}`);
        } else if (slide.linkType === 'url' && slide.externalUrl) {
            if (/^https?:\/\//.test(slide.externalUrl)) {
                window.location.href = slide.externalUrl;
            } else {
                navigate(slide.externalUrl);
            }
        }
    };

    return (
        <div className={cx('slide-container')}>
            <Slide>
                {slides.map((slide, index) => (
                    <div key={index}>
                        {<div className={cx('text-img')}></div>}
                        <div
                            className={cx('slides')}
                            style={{
                                backgroundImage: `url(${slide.url})`,
                                cursor: slide.linkType && slide.linkType !== 'none' ? 'pointer' : 'default',
                            }}
                            onClick={() => handleClickSlide(slide)}
                        ></div>
                    </div>
                ))}
            </Slide>
        </div>
    );
}

export default SlideWeb;
