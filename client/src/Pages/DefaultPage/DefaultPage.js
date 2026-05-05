import classNames from 'classnames/bind';
import styles from './DefaultPage.module.scss';
import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import Banner from '../Layouts/Banner/Banner';
import SlideBar from '../Layouts/SlideBar/Slidebar';
import HomePage from '../Layouts/HomePage/HomePage';
import request from '../../config/Connect';

import { useEffect, useState } from 'react';

const cx = classNames.bind(styles);

function DefaultPage() {
    const [valueType, setValueType] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [serverProducts, setServerProducts] = useState([]);
    const [dataProducts, setDataProducts] = useState([]);
    const [valueMax, setValueMax] = useState(1000000);
    const [valueMin, setValueMin] = useState(0);

    useEffect(() => {
        const params = valueType ? { category_id: valueType } : {};
        request.get('/api/products', { params }).then((res) => {
            setServerProducts(res.data);
        });
    }, [valueType]);

    useEffect(() => {
        const filtered = serverProducts.filter((item) => {
            const matchSearch = searchValue === '' || item.nameProducts?.toLowerCase().includes(searchValue.toLowerCase());
            const matchPrice = item.priceNew >= valueMin && item.priceNew <= valueMax;
            return matchSearch && matchPrice;
        });
        setDataProducts(filtered);
    }, [searchValue, valueMin, valueMax, serverProducts]);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <div className={cx('banner')}>
                <Banner />
            </div>

            <main className={cx('main-category')}>
                <div className={cx('container')}>
                    <div>
                        <SlideBar
                            setValueType={setValueType}
                            setSearchValue={setSearchValue}
                            valueMax={valueMax}
                            setValueMax={setValueMax}
                            valueMin={valueMin}
                            setValueMin={setValueMin}
                        />
                    </div>

                    <div>
                        <HomePage
                            dataProducts={dataProducts}
                            valueType={valueType}
                            valueMax={valueMax}
                            valueMin={valueMin}
                        />
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DefaultPage;
