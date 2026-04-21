import { useState, useEffect } from 'react';
import request from '../../../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDateString } from '../../../../../utils/formatDate';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function Comments() {
    const [comments, setComments] = useState([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [commentDetail, setCommentDetail] = useState(null);

    const handleOpenView = (cmt) => {
        setCommentDetail(cmt);
        setShowViewModal(true);
    };

    const fetchComments = async () => {
        try {
            const res = await request.get('/api/comment');
            setComments(res.data);
        } catch (error) {
            console.error('Error fetching comments', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDeleteComment = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            try {
                const res = await request.post('/api/deletecomment', { id });
                toast.success(res.data.message);
                fetchComments();
            } catch (error) {
                toast.error('Lỗi khi xóa!');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <ToastContainer />
            <h2>Quản Lý Bình Luận</h2>
            
            <table className="table table-bordered border-primary mt-4">
                <thead>
                    <tr>
                        <th>Người dùng</th>
                        <th>Nội dung bình luận</th>
                        <th>Thuộc về</th>
                        <th>Ngày tạo</th>
                        <th>Người tạo</th>
                        <th>Ngày sửa</th>
                        <th>Người sửa</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {comments.map((cmt) => (
                        <tr key={cmt._id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img
                                        src={
                                            cmt.user_id?.avatar && cmt.user_id.avatar !== '1'
                                                ? `http://localhost:5000/avatars/${cmt.user_id.avatar}`
                                                : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop"
                                        }
                                        alt=""
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <strong>{cmt.user_id?.fullname || 'Ẩn danh'}</strong>
                                        <br />
                                        <small className="text-muted">{cmt.user_id?.email}</small>
                                    </div>
                                </div>
                            </td>
                            <td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{cmt.comments}</td>
                            <td>
                                {cmt.product_id
                                    ? <span className="badge bg-primary">Sản phẩm: {cmt.product_id.nameProducts}</span>
                                    : cmt.blog_id
                                        ? <span className="badge bg-success">Blog: {cmt.blog_id.title}</span>
                                        : <span className="text-muted">-</span>
                                }
                            </td>
                            <td>{formatDateString(cmt.created_at)}</td>
                            <td>{cmt.created_by || '-'}</td>
                            <td>{formatDateString(cmt.modified_at)}</td>
                            <td>{cmt.modified_by || '-'}</td>
                            <td>
                                <button
                                    onClick={() => handleOpenView(cmt)}
                                    type="button"
                                    className="btn btn-info text-white"
                                    style={{ marginRight: '10px' }}
                                >
                                    Xem
                                </button>
                                <button className="btn btn-danger" onClick={() => handleDeleteComment(cmt._id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Bình Luận</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {commentDetail && (
                        <div>
                            <div className="d-flex mb-4">
                                <img
                                    src={
                                        commentDetail.user_id?.avatar && commentDetail.user_id.avatar !== '1'
                                            ? `http://localhost:5000/avatars/${commentDetail.user_id.avatar}`
                                            : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop"
                                    }
                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                                    alt="User Avatar"
                                />
                                <div className="ms-3">
                                    <h5 className="mb-0">{commentDetail.user_id?.fullname || 'Ẩn danh'}</h5>
                                    <span className="text-muted">{commentDetail.user_id?.email}</span>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <span className="fw-bold">Thuộc về: </span>
                                {commentDetail.product_id
                                    ? <span className="badge bg-primary ms-1">Sản phẩm: {commentDetail.product_id.nameProducts}</span>
                                    : commentDetail.blog_id
                                        ? <span className="badge bg-success ms-1">Blog: {commentDetail.blog_id.title}</span>
                                        : <span className="text-muted ms-1">-</span>
                                }
                            </div>

                            <p className="fw-bold fs-6">Nội Dung Bình Luận:</p>
                            <div className="p-3 bg-light rounded border mb-4">
                                {commentDetail.comments}
                            </div>

                            <div className="mt-4 p-3 bg-light border rounded">
                                <h6>Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày tạo:</strong> {formatDateString(commentDetail.created_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người tạo:</strong> {commentDetail.created_by || '-'}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Ngày sửa:</strong> {formatDateString(commentDetail.modified_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break"><strong>Người sửa:</strong> {commentDetail.modified_by || '-'}</small>
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
        </div>
    );
}

export default Comments;
