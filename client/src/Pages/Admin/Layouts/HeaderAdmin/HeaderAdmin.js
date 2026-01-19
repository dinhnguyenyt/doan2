import classNames from 'classnames/bind';
import styles from './HeaderAdmin.module.scss';

const cx = classNames.bind(styles);

function HeaderAdmin() {
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
                <input
                    className={cx('form-control form-control-dark w-100')}
                    type="text"
                    placeholder="Search"
                    aria-label="Search"
                />
                <div className={cx('navbar-nav')}>
                    <div className={cx('nav-item text-nowrap')}>
                        <a className={cx('nav-link px-3')} href="#/">
                            Sign out
                        </a>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default HeaderAdmin;
