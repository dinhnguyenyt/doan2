import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import { ALL_MENUS, ALL_ACTIONS, ACTION_GROUPS } from '../../../../../config/rbacConstants';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SERVER_LEVELS = [
    { value: 'admin',   label: 'Admin — toàn quyền API' },
    { value: 'manager', label: 'Manager — quyền quản lý' },
    { value: 'staff',   label: 'Staff — quyền nhân viên' },
    { value: 'none',    label: 'None — không vào admin' },
];

const BADGE_COLORS = { admin: 'danger', manager: 'warning', staff: 'info', none: 'secondary' };

function RolePermission() {
    const [roles, setRoles] = useState([]);
    const [selected, setSelected] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formLabel, setFormLabel] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formServerLevel, setFormServerLevel] = useState('none');
    const [formMenus, setFormMenus] = useState([]);
    const [formActions, setFormActions] = useState([]);

    const loadRoles = () => {
        request.get('/api/roles').then((res) => {
            setRoles(res.data);
            if (!selected && res.data.length > 0) setSelected(res.data[0]);
        });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadRoles(); }, []);

    const openAdd = () => {
        setIsEdit(false);
        setFormName('');
        setFormLabel('');
        setFormDesc('');
        setFormServerLevel('none');
        setFormMenus([]);
        setFormActions([]);
        setShowModal(true);
    };

    const openEdit = (role) => {
        setIsEdit(true);
        setFormName(role.name);
        setFormLabel(role.label);
        setFormDesc(role.description || '');
        setFormServerLevel(role.server_level || 'none');
        setFormMenus([...role.menus]);
        setFormActions([...role.actions]);
        setShowModal(true);
    };

    const toggleItem = (key, list, setList) => {
        setList((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
    };

    const toggleGroup = (group, setList) => {
        const groupKeys = ALL_ACTIONS.filter((a) => a.group === group).map((a) => a.key);
        setList((prev) => {
            const allChecked = groupKeys.every((k) => prev.includes(k));
            return allChecked
                ? prev.filter((k) => !groupKeys.includes(k))
                : [...new Set([...prev, ...groupKeys])];
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await request.post('/api/editrole', {
                    id: selected._id,
                    label: formLabel,
                    description: formDesc,
                    server_level: formServerLevel,
                    menus: formMenus,
                    actions: formActions,
                });
                toast.success('Cập nhật role thành công!');
            } else {
                await request.post('/api/addrole', {
                    name: formName,
                    label: formLabel,
                    description: formDesc,
                    server_level: formServerLevel,
                    menus: formMenus,
                    actions: formActions,
                });
                toast.success('Tạo role thành công!');
            }
            setShowModal(false);
            const res = await request.get('/api/roles');
            setRoles(res.data);
            if (isEdit) setSelected(res.data.find((r) => r._id === selected._id) || res.data[0]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (role) => {
        if (role.is_system) return toast.error('Không thể xóa role hệ thống!');
        if (!window.confirm(`Xóa role "${role.label}"?`)) return;
        try {
            await request.post('/api/deleterole', { id: role._id });
            toast.success('Đã xóa role!');
            const res = await request.get('/api/roles');
            setRoles(res.data);
            setSelected(res.data[0] || null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi xóa role');
        }
    };

    const currentRole = selected ? roles.find((r) => r._id === selected._id) : null;

    return (
        <div style={{ padding: '20px' }}>
            <ToastContainer />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Quản Lý Phân Quyền</h3>
                <Button variant="primary" onClick={openAdd}>+ Tạo Role Mới</Button>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Danh sách role bên trái */}
                <div style={{ width: '260px', flexShrink: 0 }}>
                    <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
                        {roles.map((role) => (
                            <div
                                key={role._id}
                                onClick={() => setSelected(role)}
                                style={{
                                    padding: '14px 16px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0',
                                    background: selected?._id === role._id ? '#e7f1ff' : '#fff',
                                    borderLeft: selected?._id === role._id ? '4px solid #0d6efd' : '4px solid transparent',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{role.label}</div>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                                    <span className={`badge bg-${BADGE_COLORS[role.server_level] || 'secondary'}`} style={{ fontSize: '10px' }}>
                                        {role.server_level}
                                    </span>
                                    {role.is_system && (
                                        <span className="badge bg-dark" style={{ fontSize: '10px' }}>system</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chi tiết quyền bên phải */}
                {currentRole ? (
                    <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>{currentRole.label}</h4>
                                <small className="text-muted">
                                    <code>{currentRole.name}</code> &nbsp;|&nbsp; API level:&nbsp;
                                    <span className={`badge bg-${BADGE_COLORS[currentRole.server_level] || 'secondary'}`}>
                                        {currentRole.server_level}
                                    </span>
                                </small>
                                {currentRole.description && (
                                    <p className="text-muted mt-1 mb-0" style={{ fontSize: '13px' }}>{currentRole.description}</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button size="sm" variant="warning" onClick={() => openEdit(currentRole)}>Chỉnh sửa</Button>
                                {!currentRole.is_system && (
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(currentRole)}>Xóa</Button>
                                )}
                            </div>
                        </div>

                        <hr />

                        {/* Menu có thể truy cập */}
                        <h6 className="mb-2">Menu hiển thị ({currentRole.menus.length}/{ALL_MENUS.length})</h6>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                            {ALL_MENUS.map((m) => (
                                <span
                                    key={m.key}
                                    className={`badge ${currentRole.menus.includes(m.key) ? 'bg-success' : 'bg-light text-muted'}`}
                                    style={{ fontSize: '12px', padding: '6px 10px' }}
                                >
                                    {m.label}
                                </span>
                            ))}
                        </div>

                        {/* Quyền hành động */}
                        <h6 className="mb-2">Quyền hành động ({currentRole.actions.length}/{ALL_ACTIONS.length})</h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {ACTION_GROUPS.map((group) => {
                                const groupActions = ALL_ACTIONS.filter((a) => a.group === group);
                                const allowed = groupActions.filter((a) => currentRole.actions.includes(a.key));
                                return (
                                    <div key={group} style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '12px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: '#495057' }}>
                                            {group}
                                            <span className="text-muted ms-1" style={{ fontWeight: 400 }}>
                                                ({allowed.length}/{groupActions.length})
                                            </span>
                                        </div>
                                        {groupActions.map((a) => (
                                            <div key={a.key} style={{ fontSize: '13px', padding: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: currentRole.actions.includes(a.key) ? '#198754' : '#adb5bd' }}>
                                                    {currentRole.actions.includes(a.key) ? '✓' : '✗'}
                                                </span>
                                                {a.label}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>
                        Chọn một role để xem chi tiết
                    </div>
                )}
            </div>

            {/* Modal Thêm / Sửa Role */}
            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? `Sửa Role: ${formLabel}` : 'Tạo Role Mới'}</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Tên Role (key) *</label>
                                <input
                                    className="form-control"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    disabled={isEdit}
                                    placeholder="vd: content_editor"
                                    required
                                />
                                {!isEdit && <small className="text-muted">Chỉ gồm chữ thường và dấu gạch dưới</small>}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Nhãn hiển thị *</label>
                                <input
                                    className="form-control"
                                    value={formLabel}
                                    onChange={(e) => setFormLabel(e.target.value)}
                                    placeholder="vd: Biên tập viên"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <input className="form-control" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Mô tả ngắn về role này" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Cấp độ API (server_level)</label>
                            <select
                                className="form-select"
                                value={formServerLevel}
                                onChange={(e) => setFormServerLevel(e.target.value)}
                                disabled={isEdit && selected?.is_system}
                            >
                                {SERVER_LEVELS.map((sl) => (
                                    <option key={sl.value} value={sl.value}>{sl.label}</option>
                                ))}
                            </select>
                            <small className="text-muted">Xác định role này có thể gọi nhóm API nào (bảo mật server-side)</small>
                        </div>

                        <hr />

                        {/* Menu checkboxes */}
                        <h6>Menu hiển thị</h6>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                            {ALL_MENUS.map((m) => (
                                <div key={m.key} className="form-check" style={{ minWidth: '130px' }}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`menu-${m.key}`}
                                        checked={formMenus.includes(m.key)}
                                        onChange={() => toggleItem(m.key, formMenus, setFormMenus)}
                                    />
                                    <label className="form-check-label" htmlFor={`menu-${m.key}`}>{m.label}</label>
                                </div>
                            ))}
                        </div>

                        <hr />

                        {/* Action checkboxes grouped */}
                        <h6>Quyền hành động</h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {ACTION_GROUPS.map((group) => {
                                const groupActions = ALL_ACTIONS.filter((a) => a.group === group);
                                const allChecked = groupActions.every((a) => formActions.includes(a.key));
                                return (
                                    <div key={group} style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '12px' }}>
                                        <div className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`group-${group}`}
                                                checked={allChecked}
                                                onChange={() => toggleGroup(group, setFormActions)}
                                            />
                                            <label className="form-check-label fw-bold" htmlFor={`group-${group}`}>{group}</label>
                                        </div>
                                        {groupActions.map((a) => (
                                            <div key={a.key} className="form-check ms-3">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`action-${a.key}`}
                                                    checked={formActions.includes(a.key)}
                                                    onChange={() => toggleItem(a.key, formActions, setFormActions)}
                                                />
                                                <label className="form-check-label" htmlFor={`action-${a.key}`} style={{ fontSize: '13px' }}>
                                                    {a.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                        <Button type="submit" variant="primary">{isEdit ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

export default RolePermission;
