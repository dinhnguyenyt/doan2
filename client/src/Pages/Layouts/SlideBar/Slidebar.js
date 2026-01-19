import classNames from 'classnames/bind';
import styles from './Slidebar.module.scss';

const cx = classNames.bind(styles);

function SlideBar({ setValueType }) {
 

    return (
        <div className={cx('wrapper')}>
            <div className={cx('select-option')}>
                <div>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        onChange={(e) => setValueType(e.target.value)}
                    >
                        <>
                            <option value="" selected>
                                Type
                            </option>
                            <option value="perfume">Perfume</option>
                            <option value="scentedCandles">Scented candles</option>
                            <option value="shoe">Shoe</option>
                            <option value="lipstick">Lipstick</option>
                        </>
                    </select>
                </div>
            </div>

        </div>
    );
}

export default SlideBar;
