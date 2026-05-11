import { useState, useEffect } from 'react';
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

export function AddressModal({ show, setShow, onSaved }) {
    const handleClose = () => setShow(false);
    const [form, setForm] = useState({ fullname:'', phone:'', company:'', country:'', address_line1:'', address_line2:'', city:'', zip:'' });

    useEffect(() => {
        if (show) {
            request.get('/api/address').then((res) => {
                if (res.data) setForm({ fullname: res.data.fullname || '', phone: res.data.phone || '', company: res.data.company || '', country: res.data.country || '', address_line1: res.data.address_line1 || '', address_line2: res.data.address_line2 || '', city: res.data.city || '', zip: res.data.zip || '' });
            }).catch(() => {});
        }
    }, [show]);

    const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleSave = async () => {
        try {
            const res = await request.post('/api/address', form);
            toast.success(res.data.message);
            onSaved && onSaved(res.data.address);
            handleClose();
        } catch { toast.error('Lỗi lưu địa chỉ'); }
    };

    const row = (label, field, placeholder, type='text') => (
        <div className="input-group mb-2">
            <span className="input-group-text" style={{ minWidth: 130, fontSize: 13 }}>{label}</span>
            <input type={type} className="form-control" placeholder={placeholder} value={form[field]} onChange={f(field)} />
        </div>
    );

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <ToastContainer />
            <Modal.Header closeButton><Modal.Title>Địa chỉ giao hàng</Modal.Title></Modal.Header>
            <Modal.Body>
                {row('Họ và tên', 'fullname', 'Nguyễn Văn A')}
                {row('Số điện thoại', 'phone', '0901234567', 'tel')}
                {row('Công ty', 'company', 'Tên công ty (nếu có)')}
                {row('Quốc gia', 'country', 'Việt Nam')}
                {row('Địa chỉ 1', 'address_line1', 'Số nhà, tên đường')}
                {row('Địa chỉ 2', 'address_line2', 'Phường / Xã (nếu có)')}
                {row('Thành phố', 'city', 'Hà Nội / TP.HCM...')}
                {row('Mã bưu chính', 'zip', '700000')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Huỷ</Button>
                <Button variant="primary" onClick={handleSave}>Lưu địa chỉ</Button>
            </Modal.Footer>
        </Modal>
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
