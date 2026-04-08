import classNames from 'classnames/bind';
import styles from './ProfileAdmin.module.scss';
import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';

const cx = classNames.bind(styles);

function ProfileAdmin() {
    const [dataUser, setDataUser] = useState(null);
    const domain = 'http://localhost:5000/avatars/';

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('Token='));
        if (token) {
            request.get('api/auth').then((res) => setDataUser(res.data)).catch(console.error);
        }
    }, []);

    if (!dataUser) {
        return <div>Loading...</div>;
    }

    const roleName = dataUser.role || (dataUser.isAdmin ? 'Admin' : 'User');

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-profile')}>
                <div className={cx('avatar-container')}>
                    <img 
                        src={dataUser.avatar && dataUser.avatar !== '1' ? domain + dataUser.avatar : 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        className={cx('avatar')}
                    />
                </div>
                <div className={cx('user-info')}>
                    <h1>{dataUser.fullname || 'Unknown'}</h1>
                    <div className={cx('sub-info')}>
                        <span className={cx('email')}>{dataUser.email}</span>
                        <span className={cx('role')}>{roleName}</span>
                    </div>
                </div>
            </div>

            <div className={cx('account-section')}>
                <h2>Account</h2>
                
                <div className={cx('info-group')}>
                    <label>Username</label>
                    <input type="text" value={dataUser.fullname || ''} readOnly />
                </div>

                <div className={cx('info-group')}>
                    <label>Email</label>
                    <input type="email" value={dataUser.email || ''} readOnly />
                </div>

                <div className={cx('info-group')}>
                    <label>PassWord</label>
                    <input type="password" value="••••••••••••••••" readOnly />
                </div>

                <div className={cx('info-group')}>
                    <label>Title</label>
                    <input type="text" value={roleName} readOnly />
                </div>
            </div>
        </div>
    );
}

export default ProfileAdmin;
