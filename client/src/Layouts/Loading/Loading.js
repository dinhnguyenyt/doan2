import classNames from 'classnames/bind';
import styles from './Loading.module.scss';

import imgLoading from './img/logo.png';

const cx = classNames.bind(styles);

function Loading({ isLoading }) {
    if (!isLoading) return null;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('overlay')}>
                <div className={cx('inner')}>
                    <img id={cx('img-loading')} src={imgLoading} alt="" />
                </div>
                <div className={cx('test')}>
                    <span>We are processing your request, please wait a few minutes</span>
                </div>
            </div>
        </div>
    );
}

export default Loading;
