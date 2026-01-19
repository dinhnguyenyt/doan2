import classNames from 'classnames/bind';
import styles from './Blogger.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import Banner from '../Layouts/Banner/Banner';
import { useEffect, useState } from 'react';
import request from '../../config/Connect';

const cx = classNames.bind(styles);

function Blogger() {
    const [dataBlog, setDataBlog] = useState([]);

    useEffect(() => {
        request.get('/api/getblog').then((res) => setDataBlog(res.data));
    }, []);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <div>
                <Banner />
            </div>

            <main className={cx('inner')}>
                {dataBlog.map((item) => (
                    <div className={cx('form-blogger')}>
                        <img src={item.img} alt="" />
                        <h2>{item.title}</h2>
                        <p>{item.des}</p>
                    </div>
                ))}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Blogger;
