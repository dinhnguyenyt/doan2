import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import styles from './Customers.module.scss';
import classNames from 'classnames';

const cx = classNames.bind(styles);

function Customers() {
    const [dataUser, setDataUser] = useState([]);

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
                            <td>
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
        </div>
    );
}

export default Customers;
