import classNames from 'classnames/bind';
import styles from './LoginUser.module.scss';

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import request from '../../config/Connect';
import { toast, ToastContainer } from 'react-toastify';
const cx = classNames.bind(styles);

const HISTORY_KEY = 'loginHistory';
const MAX_HISTORY = 5;

function saveLoginHistory(email, fullname, avatar) {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const filtered = prev.filter((item) => item.email !== email);
    const next = [{ email, fullname, avatar }, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function getLoginHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
}

function removeFromHistory(email) {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    localStorage.setItem(HISTORY_KEY, JSON.stringify(prev.filter((i) => i.email !== email)));
}

function LoginUser() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setHistory(getLoginHistory());
    }, []);

    const handleLoginUser = async () => {
        var pattern = /[A-Z]/;
        const test = pattern.test(email);
        if (email === '' || password === '' || test === true) {
            toast.error('Vui Lòng Xem Lại Thông Tin !!!');
        } else {
            try {
                const res = await request.post('/api/login', { email, password, rememberMe });
                saveLoginHistory(email, res.data.fullname, res.data.avatar);
                setHistory(getLoginHistory());

                const role = res.data.role;
                if (role && role !== 'user') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        }
    };

    const handleSelectHistory = (item) => {
        setEmail(item.email);
        toast.info(`Đã chọn tài khoản: ${item.email}`);
    };

    const handleRemoveHistory = (e, email) => {
        e.stopPropagation();
        removeFromHistory(email);
        setHistory(getLoginHistory());
    };

    return (
        <>
            <ToastContainer />
            <div className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('header-form-login')}>
                        <span>Login</span>
                        <p>Enter Login details to get access</p>
                    </div>

                    {/* Lịch sử đăng nhập */}
                    {history.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Tài khoản gần đây:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {history.map((item) => (
                                    <div
                                        key={item.email}
                                        onClick={() => handleSelectHistory(item)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            border: '1px solid #ddd', borderRadius: 8,
                                            padding: '6px 10px', cursor: 'pointer',
                                            background: email === item.email ? '#f0f4ff' : '#fafafa',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <img
                                            src={
                                                item.avatar && item.avatar !== '1'
                                                    ? `http://localhost:5000/avatars/${item.avatar}`
                                                    : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=60'
                                            }
                                            alt=""
                                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div style={{ lineHeight: 1.3 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{item.fullname || item.email}</div>
                                            <div style={{ fontSize: 11, color: '#888' }}>{item.email}</div>
                                        </div>
                                        <button
                                            onClick={(e) => handleRemoveHistory(e, item.email)}
                                            style={{ marginLeft: 4, border: 'none', background: 'none', color: '#bbb', cursor: 'pointer', fontSize: 14, padding: 0 }}
                                            title="Xóa khỏi lịch sử"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={cx('input-box')}>
                        <div className={cx('form-input')}>
                            <label>Username or Email Address</label>
                            <input
                                placeholder="Username / Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className={cx('form-input')}>
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    placeholder="Enter Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', paddingRight: 40 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 10, top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none', background: 'none',
                                        cursor: 'pointer', color: '#888', fontSize: 16,
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className={cx('single-input-fields')}>
                            <div>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="rememberMe" style={{ marginLeft: 6, cursor: 'pointer' }}>
                                    Nhớ đăng nhập (30 ngày)
                                </label>
                            </div>
                            <a href="/#">Forgot Password?</a>
                        </div>
                    </div>

                    <div className={cx('login-footer')}>
                        <p>
                            Don't have an account?{' '}
                            <Link id={cx('link')} to="/register">
                                Sign Up
                            </Link>{' '}
                            here
                        </p>
                        <button onClick={handleLoginUser}>Login</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginUser;
