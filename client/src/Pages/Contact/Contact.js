import classNames from 'classnames/bind';
import styles from './Contact.module.scss';
import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import Banner from '../Layouts/Banner/Banner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import request from '../../config/Connect';

const cx = classNames.bind(styles);

function Contact() {
    const [message, setMessage] = useState();
    const [email, setEmail] = useState();

    const handleSendMessage = async () => {
        try {
            request
                .post('/api/sendmessage', {
                    message,
                    email,
                })
                .then((res) => toast.success(res.data.message));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header>
                <Header />
            </header>
            <div>
                <Banner />
            </div>
            <div className={cx('inner')}>
                <div className={cx('column-left')}>
                    <h1>Get In Touch</h1>
                    <div className="form-floating">
                        <textarea
                            className="form-control"
                            placeholder="Leave a comment here"
                            id="floatingTextarea2"
                            style={{ height: '100px' }}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                        <label htmlFor="floatingTextarea2">Enter message</label>
                    </div>

                    <div>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Email"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>

                <div className={cx('column-right')}>
                    <div className={cx('form-icons')}>
                        <FontAwesomeIcon icon={faHome} />
                        Alibarbie Co.Ltd Viet Nam
                    </div>

                    <div className={cx('form-icons')}>
                        <FontAwesomeIcon icon={faPhone} />
                        +0333333333
                    </div>

                    <div className={cx('form-icons')}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        bich51621@donga.edu.vn
                    </div>
                </div>
            </div>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Contact;
