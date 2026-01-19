import { toast, ToastContainer } from 'react-toastify';
import request from '../../../../../config/Connect';
import { ModalAddBlog } from '../../../Modal/Modal';
import { useEffect, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './Blog.module.scss';
const cx = classNames.bind(styles);

function Blogger() {
    const [show, setShow] = useState(false);
    const [dataBlog, setDataBlog] = useState([]);

    const handleShow = () => {
        setShow(!show);
    };

    useEffect(() => {
        request.get('/api/getblog').then((res) => setDataBlog(res.data));
    }, [show]);

    const handleDeleteBlog = async (data) => {
        const res = await request.post('/api/deleteblog', { id: data });
        await request.get('/api/getblog').then((res) => setDataBlog(res.data));
        toast.success(res.data.message);
    };

    return (
        <>
            <div className={cx('btn-addBlog')}>
                <button onClick={handleShow} type="button" className="btn btn-primary">
                    Thêm Bài Viết
                </button>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Img</th>
                        <th scope="col">Name Blog</th>
                        <th scope="col">Description</th>
                        <th scope="col">Handle</th>
                    </tr>
                </thead>
                <tbody>
                    {dataBlog.map((item) => (
                        <tr key={item.id}>
                            <th scope="row">1</th>
                            <td>
                                <img style={{ width: '150px' }} src={item.img} alt="" />
                            </td>
                            <td>{item.title}</td>
                            <td>{item.des}</td>
                            <td>
                                <button
                                    onClick={() => handleDeleteBlog(item.id)}
                                    type="button"
                                    className="btn btn-danger"
                                >
                                    Xóa Bài Viết
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ToastContainer />
            <ModalAddBlog show={show} setShow={setShow} />
        </>
    );
}

export default Blogger;
