import classNames from 'classnames/bind';
import styles from './InfoUser.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';
import EditInfo, { ChangePassword } from './modal/Modal';
import request from '../../config/Connect';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function InfoUser() {
    const [dataUser, setDataUser] = useState();
    const [show, setShow] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dataOrder, setDataOrder] = useState([]);

    const [showModalEdit, setShowModalEdit] = useState(false);

    const token = document.cookie;

    const domain = 'http://localhost:5000/avatars/';

    const navigate = useNavigate();

    useEffect(() => {
        request.get('/api/dataorder').then((res) => setDataOrder(res.data));
    }, []);

    useEffect(() => {
        if (token) {
            request.get('api/auth').then((res) => setDataUser(res.data));
        } else {
            navigate('/login');
        }
    }, [navigate, token]);

    const handleShowModal = async () => {
        setShow(!show);
    };

    const handleLogout = () => {
        request.get('/api/logout');
        navigate('/');
        window.location.reload();
    };

    const handleModalEditInfo = () => {
        setShowModalEdit(!showModalEdit);
    };

    const handleChangeAvatar = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        try {
            await request.post('/api/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            window.location.reload();
            console.log('Avatar uploaded successfully');
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('inner')}>
                <div className={cx('form-info-user')}>
                    <div className={cx('column-1')}>
                        <img src={domain + dataUser?.avatar} alt="..." />
                        <h3>{dataUser?.fullname}</h3>
                        <div className={cx('change-avatar')}>
                            <button onClick={handleChangeAvatar}>Change Avatar</button>
                        </div>
                        <button onClick={handleModalEditInfo}>Edit Profile</button>
                        <button onClick={handleLogout}>Log Out</button>
                    </div>
                    <div className={cx('column-2')}>
                        <h2>Information</h2>

                        <div className={cx('info-contact')}>
                            <div>
                                <h3>Email</h3>
                                <span>{dataUser?.email}</span>
                            </div>

                            <div>
                                <h3>Phone</h3>
                                <span>0{dataUser?.phone}</span>
                            </div>

                            <div>
                                <h3>Surplus</h3>
                                <span>{dataUser?.surplus} $</span>
                            </div>
                        </div>

                        <div className={cx('input-change')}>
                            <>
                                <input
                                    type="file"
                                    name="file"
                                    id="file"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className={cx('inputfile')}
                                />
                                <label htmlFor="file">Select Image</label>
                            </>
                            <button id={cx('btn-change')} onClick={handleShowModal}>
                                Change PassWrod
                            </button>
                        </div>
                    </div>
                </div>
                <ChangePassword show={show} setShow={setShow} />
                <EditInfo showModalEdit={showModalEdit} setShowModalEdit={setShowModalEdit} />
            </main>

            <div className={cx('info-order')}>
                {dataOrder.map((item) => (
                    <table className="table table-bordered border-primary">
                        <thead>
                            <tr>
                                <th scope="col">Email Người Dùng</th>
                                <th scope="col">Tên Sản Phẩm</th>
                                <th scope="col">Trạng Thái</th>
                                <th scope="col">Tình Trạng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{item.email}</td>
                                <td style={{ display: 'flex', flexDirection: 'column' }}>
                                    {item?.products?.map((item2, idx) => (
                                        <div key={idx} style={{ padding: '4px 0' }}>
                                            {item2.nameProduct} (x{item2.quantity})
                                        </div>
                                    ))}
                                </td>
                                <td>{item.statusOrder ? 'Đã giao hàng' : 'Đang vận chuyển'}</td>
                                <td>{item.statusPayment ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                            </tr>
                        </tbody>
                    </table>
                ))}
            </div>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default InfoUser;
