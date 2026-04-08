import classNames from 'classnames/bind';
import styles from './HeaderAdmin.module.scss';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function HeaderAdmin({ setActiveList }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const tokenRow = document.cookie.split('; ').find(row => row.startsWith('Token='));
    const token = tokenRow ? tokenRow.split('=')[1] : null;
    let initial = 'A';
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const email = decoded.email || '';
            initial = email ? email.charAt(0).toUpperCase() : 'A';
        } catch (e) {}
    }

    const handleLogout = () => {
        document.cookie = 'Token=; max-age=0; path=/';
        navigate('/login');
    };

    const handleProfile = () => {
        if (setActiveList) {
            setActiveList('profile');
        } else {
            navigate('/info');
        }
        setShowDropdown(false);
    };

    return (
        <div>
            <header className={cx('navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow')}>
                <a className={cx('navbar-brand col-md-3 col-lg-2 me-0 px-3')} href="/#">
                    Quản Trị Admin
                </a>
                <button
                    className={cx('navbar-toggler position-absolute d-md-none collapsed')}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#sidebarMenu"
                    aria-controls="sidebarMenu"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className={cx('navbar-toggler-icon')}></span>
                </button>
                <div className={cx('w-100')}></div>
                <div className={cx('navbar-nav')} style={{ position: 'relative', marginRight: '20px' }}>
                    <div 
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#6f42c1', 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '20px',
                            userSelect: 'none'
                        }}
                    >
                        {initial}
                    </div>
                    {showDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '55px',
                            right: '0',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            width: '150px',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}>
                            <div 
                                onClick={handleProfile}
                                style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                Profile
                            </div>
                            <div 
                                onClick={handleLogout}
                                style={{ padding: '10px 15px', cursor: 'pointer', color: '#dc3545' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </div>
    );
}

export default HeaderAdmin;
