import classNames from 'classnames/bind';
import styles from './LoginUser.module.scss';

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import request from '../../config/Connect';
import { toast, ToastContainer } from 'react-toastify';

import { jwtDecode } from 'jwt-decode';

const cx = classNames.bind(styles);

function LoginUser() {
    const [email, setEmail] = useState(''); // Tạo state để lưu email
    const [password, setPassword] = useState(''); // Tạo state để lưu password
    const navigate = useNavigate(); // Tạo state để lưu password
    const handleLoginUser = async () => {
        // Hàm xử lý đăng nhập
        var pattern = /[A-Z]/; // Kiểm tra xem chuỗi có chứa ký tự viết hoa hay không
        const test = pattern.test(email);
        if (email === '' || password === '' || test === true) {
            // Kiểm tra xem email, password
            toast.error('Vui Lòng Xem Lại Thông Tin !!!'); // Hàm toast.error hiển thị thông báo lỗi
        } else {
            try {
                // Thực hiện đăng nhập
                const res = await request.post('/api/login', {
                    // Gửi yêu cầu đăng nhập đến server
                    email, // Gửi email và password để đăng nhập
                    password,
                });
                // navigate('/'); // Chuyển hướng đến trang chủ
                const token = document.cookie;

                const decoded = jwtDecode(token);
                const role = decoded.role || (decoded.admin ? 'admin' : 'user');
                
                if (role === 'admin' || role === 'staff') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } catch (error) {
                // Nếu đăng nhập thất bại
                toast.error(error.response.data.message); // Hiển thị thông báo lỗi
            }
        }
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
                    <div className={cx('input-box')}>
                        <div className={cx('form-input')}>
                            <label>Username or Email Address</label>
                            <input placeholder="Username / Email address" onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className={cx('form-input')}>
                            <label>Password</label>
                            <input
                                placeholder="Enter Password"
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className={cx('single-input-fields')}>
                            <div>
                                <input type="checkbox" />
                                <label>Keep me logged in</label>
                            </div>
                            <a href="/#">Forgot Password?</a>
                        </div>
                    </div>
                    <div className={cx('login-footer')}>
                        <p>
                            Don’t have an account?{' '}
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
