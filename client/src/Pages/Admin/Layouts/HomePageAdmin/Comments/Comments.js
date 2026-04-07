import { useState, useEffect } from 'react';
import request from '../../../../../config/Connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Comments() {
    const [comments, setComments] = useState([]);

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
                        <th>Thời gian</th>
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
                            <td>{cmt.created_at ? new Date(cmt.created_at).toLocaleString() : ''}</td>
                            <td>
                                <button className="btn btn-danger" onClick={() => handleDeleteComment(cmt._id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Comments;
