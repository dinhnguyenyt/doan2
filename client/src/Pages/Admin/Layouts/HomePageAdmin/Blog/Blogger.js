import { toast, ToastContainer } from 'react-toastify';
import request from '../../../../../config/Connect';
import { ModalAddBlog } from '../../../Modal/Modal';
import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import classNames from 'classnames/bind';
import styles from './Blog.module.scss';
import { formatDateString } from '../../../../../utils/formatDate';
const cx = classNames.bind(styles);

function Blogger() {
    const [show, setShow] = useState(false);
    const [dataBlog, setDataBlog] = useState([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [blogDetail, setBlogDetail] = useState(null);

    const handleOpenView = (blog) => {
        setBlogDetail(blog);
        setShowViewModal(true);
    };

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
                        <th scope="col">Ngày tạo</th>
                        <th scope="col">Người tạo</th>
                        <th scope="col">Ngày sửa</th>
                        <th scope="col">Người sửa</th>
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
                            <td>{formatDateString(item.created_at)}</td>
                            <td>{item.created_by || '-'}</td>
                            <td>{formatDateString(item.modified_at)}</td>
                            <td>{item.modified_by || '-'}</td>
                            <td>
                                <button
                                    onClick={() => handleOpenView(item)}
                                    type="button"
                                    className="btn btn-info text-white"
                                    style={{ marginRight: '10px' }}
                                >
                                    Xem
                                </button>
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

            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Bài Viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {blogDetail && (
                        <div>
                            <div className="text-center mb-4">
                                <img src={blogDetail.img} alt={blogDetail.title} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                            </div>
                            <h5>{blogDetail.title}</h5>
                            <hr />
                            <p className="fw-bold">Mô tả ngắn:</p>
                            <p>{blogDetail.des || 'Không có mô tả'}</p>
                            <p className="fw-bold mt-3">Nội dung (Content):</p>
                            <div className="p-3 bg-light rounded border" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {/* Using dangerouslySetInnerHTML if the blog contains HTML, but let's stick to safe text if unsure */}
                                {blogDetail.content || 'Nội dung chưa cập nhật'}
                            </div>
                            
                            <div className="mt-4 p-3 bg-light border rounded">
                                <h6>Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(blogDetail.created_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người tạo:</strong> {blogDetail.created_by || '-'}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(blogDetail.modified_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người sửa:</strong> {blogDetail.modified_by || '-'}</small>
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
        </>
    );
}

export default Blogger;
