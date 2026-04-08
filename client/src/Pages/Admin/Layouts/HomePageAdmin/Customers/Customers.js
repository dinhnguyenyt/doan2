import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import styles from './Customers.module.scss';
import classNames from 'classnames';
import { formatDateString } from '../../../../../utils/formatDate';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const cx = classNames.bind(styles);

function Customers() {
    const [dataUser, setDataUser] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [userDetail, setUserDetail] = useState(null);
    const [currentUserId, setCurrentUserId] = useState('');
    const [editFullName, setEditFullName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editSurplus, setEditSurplus] = useState(0);

    const handleOpenEdit = (user) => {
        setCurrentUserId(user._id);
        setEditFullName(user.fullname || '');
        setEditEmail(user.email || '');
        setEditPhone(user.phone || '');
        setEditSurplus(user.surplus || 0);
        setShowModal(true);
    };

    const handleOpenView = (user) => {
        setUserDetail(user);
        setShowViewModal(true);
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const res = await request.post('/api/edituser', {
                userId: currentUserId,
                fullname: editFullName,
                email: editEmail,
                phone: editPhone,
                surplus: editSurplus
            });
            alert('Sửa thông tin thành công!');
            setShowModal(false);
            loadUsers();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const loadUsers = () => {
        request.get('/api/datauser').then((res) => setDataUser(res.data));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await request.post('/api/updaterole', { userId, role: newRole });
            alert('Cập nhật quyền thành công!');
            loadUsers();
        } catch (error) {
            console.error(error);
            alert('Lỗi cập nhật quyền');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
            try {
                await request.post('/api/deleteuser', { userId });
                alert('Xóa user thành công!');
                loadUsers();
            } catch (error) {
                console.error(error);
                alert('Lỗi xóa user');
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <table className="table table-hover align-middle">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                        <th scope="col">Ngày tạo</th>
                        <th scope="col">Người tạo</th>
                        <th scope="col">Ngày sửa</th>
                        <th scope="col">Người sửa</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {dataUser.map((item) => (
                        <tr key={item._id}>
                            <th scope="row">
                                <span title={item._id}>{item._id.substring(0, 6)}...</span>
                            </th>
                            <td>{item.fullname}</td>
                            <td>{item.email}</td>
                            <td>
                                <select 
                                    className="form-select form-select-sm"
                                    value={item.role || (item.isAdmin ? 'admin' : 'user')}
                                    onChange={(e) => handleRoleChange(item._id, e.target.value)}
                                    style={{ width: 'auto' }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="user">User</option>
                                </select>
                            </td>
                            <td>{formatDateString(item.created_at)}</td>
                            <td>{item.created_by || '-'}</td>
                            <td>{formatDateString(item.modified_at)}</td>
                            <td>{item.modified_by || '-'}</td>
                            <td>
                                <button
                                    className="btn btn-info btn-sm text-white"
                                    onClick={() => handleOpenView(item)}
                                    style={{ marginRight: '10px' }}
                                >
                                    Xem
                                </button>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleOpenEdit(item)}
                                    style={{ marginRight: '10px' }}
                                >
                                    Sửa
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteUser(item._id)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Người Dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {userDetail && (
                        <div>
                            <div className="text-center mb-4">
                                <img
                                    src={
                                        userDetail.avatar && userDetail.avatar !== '1'
                                            ? `http://localhost:5000/avatars/${userDetail.avatar}`
                                            : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop"
                                    }
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                                    alt="Avatar"
                                />
                                <h4 className="mt-3 mb-0">{userDetail.fullname}</h4>
                                <span className="badge bg-primary mt-2">{userDetail.role || (userDetail.isAdmin ? 'admin' : 'user')}</span>
                            </div>

                            <ul className="list-group list-group-flush mb-4 border rounded">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="text-muted">ID:</span>
                                    <strong>{userDetail._id}</strong>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Email:</span>
                                    <strong>{userDetail.email}</strong>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Phone:</span>
                                    <strong>{userDetail.phone || 'Chưa cập nhật'}</strong>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Surplus (Số dư):</span>
                                    <strong className="text-success">${userDetail.surplus?.toLocaleString() || 0}</strong>
                                </li>
                            </ul>

                            <div className="mt-4 p-3 bg-light border rounded">
                                <h6>Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(userDetail.created_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người tạo:</strong> {userDetail.created_by || '-'}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(userDetail.modified_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người sửa:</strong> {userDetail.modified_by || '-'}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh Sửa Người Dùng</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleEditUser}>
                    <Modal.Body>
                        <div className="mb-3">
                            <label className="form-label">Họ và tên (*)</label>
                            <input type="text" className="form-control" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email (*)</label>
                            <input type="email" className="form-control" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Số điện thoại</label>
                            <input type="text" className="form-control" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Số dư ($)</label>
                            <input type="number" className="form-control" value={editSurplus} onChange={(e) => setEditSurplus(e.target.value)} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                        <Button type="submit" variant="primary">Lưu Lại</Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

export default Customers;
