import classNames from 'classnames/bind';
import styles from './Banner.module.scss';

const cx = classNames.bind(styles);

function Banner() {
    const urlPage = window.location.pathname.slice(1, 9999);
    let result = urlPage.toUpperCase();
    return (
        <div className={cx('wrapper')}>
            <h1>{result}</h1>
            <span>Home | {urlPage}</span>
        </div>
    );
}

export default Banner;
