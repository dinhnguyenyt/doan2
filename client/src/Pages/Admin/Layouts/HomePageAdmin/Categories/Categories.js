import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import styles from './Categories.module.scss';
import classNames from 'classnames';

const cx = classNames.bind(styles);

function Categories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const loadCategories = () => {
        request.get('/api/categories').then((res) => setCategories(res.data));
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await request.post('/api/addcategory', { name, description });
            alert('Thêm danh mục thành công!');
            setName('');
            setDescription('');
            loadCategories();
        } catch (error) {
            console.error(error);
            alert('Lỗi thêm danh mục');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            try {
                await request.post('/api/deletecategory', { id });
                alert('Xóa danh mục thành công!');
                loadCategories();
            } catch (error) {
                console.error(error);
                alert('Lỗi xóa danh mục');
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('form-container')}>
                <h3>Thêm Danh Mục Mới</h3>
                <form onSubmit={handleAddCategory}>
                    <div className="mb-3">
                        <label className="form-label">Tên Danh Mục (*)</label>
                        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mô tả</label>
                        <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Thêm Mới</button>
                </form>
            </div>

            <div className={cx('table-container', 'mt-5')}>
                <h3>Danh Sách Danh Mục</h3>
                <table className="table table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Tên Danh Mục</th>
                            <th scope="col">Mô tả</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((item) => (
                            <tr key={item._id}>
                                <th scope="row">
                                    <span title={item._id}>{item._id.substring(0, 8)}...</span>
                                </th>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeleteCategory(item._id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Categories;
