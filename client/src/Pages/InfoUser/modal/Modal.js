import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../../config/Connect';
import { toast, ToastContainer } from 'react-toastify';

export function ChangePassword({ show, setShow }) {
    const handleClose = () => setShow(false);

    const [newPass, setNewPass] = useState('');

    const handleChangePasswrod = async () => {
        const res = await request.post('/api/changepass', { newPass });
        toast.success(res.data.message);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Change PassWord</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">
                            New PassWord
                        </span>
                        <input type="password" className="form-control" onChange={(e) => setNewPass(e.target.value)} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleChangePasswrod}>
                        Change
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default function EditInfo({ showModalEdit, setShowModalEdit }) {
    const handleClose = () => setShowModalEdit(false);

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(Number);

    const handleEditProfile = async () => {
        try {
            const res = await request.post('/api/editprofile', {
                email,
                phone,
            });
            toast.success(res.data.message);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <Modal show={showModalEdit} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Phone"
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleEditProfile}>
                        Lưu Lại
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
