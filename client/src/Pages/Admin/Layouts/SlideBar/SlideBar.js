import classNames from 'classnames/bind';
import styles from './SlideBar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ALL_MENUS } from '../../../../config/rbacConstants';
import { usePermission } from '../../../../contexts/PermissionContext';

const cx = classNames.bind(styles);

function SlideBar({ setActiveList }) {
    const { menus } = usePermission();
    const allowedItems = ALL_MENUS.filter((item) => menus.includes(item.key));

    return (
        <div className={cx('wrapper')}>
            <div className={cx('controller')}>
                <ul>
                    {allowedItems.map((item) => (
                        <li key={item.key} onClick={() => setActiveList(item.key)}>
                            <FontAwesomeIcon id={cx('icons')} icon={item.icon} />
                            <h5>{item.label}</h5>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SlideBar;
