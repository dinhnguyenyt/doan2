import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const cx = classNames.bind(styles);

function Footer() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <header>
                    <div className={cx('row-1')}>
                        <div id={cx('row-1-left')}>
                            <h4>Subscribe Newsletter</h4>
                            <p>Subscribe newsletter to get 5% on all products.</p>
                        </div>

                        <div className={cx('row-2')}>
                            <input placeholder="Enter your email" />
                            <button>Subscribe</button>
                        </div>

                        <div className={cx('row-3')}>
                            <a style={{ color: '#fff' }} href="https://www.facebook.com/dinhahihi">
                                <FontAwesomeIcon icon={faFacebook} />
                            </a>
                            <a style={{ color: '#fff' }} href="https://www.facebook.com/dinhahihi">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a style={{ color: '#fff' }} href="https://www.facebook.com/dinhahihi">
                                <FontAwesomeIcon icon={faYoutube} />
                            </a>
                        </div>
                    </div>
                </header>

                <main className={cx('form-list-footer')}>
                    <div className={cx('column-footer')}>
                        <h4>Shop Men</h4>
                        <ul>
                            <li>Clothing Fashion</li>
                            <li>Winter</li>
                            <li>Sumer</li>
                            <li>Formal</li>
                            <li>Casual</li>
                        </ul>
                    </div>
                    <div className={cx('column-footer')}>
                        <h4>Shop Women</h4>
                        <ul>
                            <li>Clothing Fashion</li>
                            <li>Winter</li>
                            <li>Sumer</li>
                            <li>Formal</li>
                            <li>Casual</li>
                        </ul>
                    </div>
                    <div className={cx('column-footer')}>
                        <h4>Baby Collection</h4>
                        <ul>
                            <li>Clothing Fashion</li>
                            <li>Winter</li>
                            <li>Sumer</li>
                            <li>Formal</li>
                            <li>Casual</li>
                        </ul>
                    </div>

                    <div className={cx('column-footer')}>
                        <h4>Quick Links</h4>
                        <ul>
                            <li>Clothing Fashion</li>
                            <li>Winter</li>
                            <li>Sumer</li>
                            <li>Formal</li>
                            <li>Casual</li>
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Footer;
