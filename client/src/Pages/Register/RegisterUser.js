import classNames from 'classnames/bind';
import styles from './RegisterUser.module.scss';

import request from '../../config/Connect';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const cx = classNames.bind(styles);

const eyeBtn = {
    position: 'absolute', right: 10, top: '50%',
    transform: 'translateY(-50%)',
    border: 'none', background: 'none',
    cursor: 'pointer', color: '#888', fontSize: 16,
};

function RegisterUser() {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRegister = async () => {
        try {
            var pattern = /[A-Z]/;
            const checkEmail = pattern.test(email);

            if (fullname === '' || email === '' || password === '' || confirmPassword === '') {
                toast.error('Vui Lòng Xem Lại Thông Tin !!!');
            } else if (checkEmail === true) {
                toast.error('Email Không Được Viết Hoa !!!');
            } else if (password !== confirmPassword) {
                toast.error('Mật Khẩu Không Trùng Khớp !!!');
            } else {
                const res = await request.post('/api/register', {
                    fullname,
                    email,
                    password,
                    confirmPassword,
                    phone,
                });
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('header-form-login')}>
                        <span>Sign Up</span>
                        <p>Create your account to get full access</p>
                    </div>
                    <div className={cx('input-box')}>
                        <div className={cx('form-input')}>
                            <label>Full Name</label>
                            <input placeholder="Enter Full Name" onChange={(e) => setFullname(e.target.value)} />
                        </div>

                        <div className={cx('form-input')}>
                            <label>Email Address</label>
                            <input placeholder="Enter Email Address" onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className={cx('form-input')}>
                            <label>Phone</label>
                            <input placeholder="Enter Phone" onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        <div className={cx('form-input')}>
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    placeholder="Enter Password"
                                    type={showPassword ? 'text' : 'password'}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', paddingRight: 40 }}
                                />
                                <button type="button" tabIndex={-1} style={eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className={cx('form-input')}>
                            <label>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: '100%', paddingRight: 40 }}
                                />
                                <button type="button" tabIndex={-1} style={eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={cx('login-footer')}>
                        <p>
                            Already have an account?
                            <Link id={cx('link')} to="/login">
                                Login
                            </Link>
                            here
                        </p>
                        <button onClick={handleRegister}>Sign Up</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterUser;
