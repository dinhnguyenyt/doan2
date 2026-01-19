import classNames from 'classnames/bind';
import styles from './Main.module.scss';
import Slide from './Slide/Slide';
import ItemProducts from './ItemProducts/ItemProducts';
import SlideProducts from './SlideProducts/SlideProducts';
import Testimonial from './Testimonial/Testimonial';
import CategoriesArea from './CategoriesArea/CategoriesArea';
import ChatBot from '../../ultils/ChatBot/ChatBot';

const cx = classNames.bind(styles);
function Main() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('slide')}>
                <Slide />
            </div>

            <div className={cx('item-products')}>
                <ItemProducts />
            </div>

            <div>
                <ChatBot />
            </div>

            <div>
                <SlideProducts />
            </div>

            <div>
                <Testimonial />
            </div>

            <div className={cx('categories-area')}>
                <CategoriesArea />
            </div>
        </div>
    );
}

export default Main;
