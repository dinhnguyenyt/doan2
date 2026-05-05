import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import styles from './Categories.module.scss';
import classNames from 'classnames/bind';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { formatDateString } from '../../../../../utils/formatDate';

const cx = classNames.bind(styles);

// Xây tất cả đường dẫn từ catId lên gốc (hỗ trợ nhiều cha)
function buildAllPaths(catId, allCats, visited = new Set()) {
    if (visited.has(String(catId))) return [];
    const cat = allCats.find((c) => String(c._id) === String(catId));
    if (!cat) return [];
    const newVisited = new Set(visited).add(String(catId));
    const parentIds = cat.parent_ids || [];
    if (parentIds.length === 0) return [[cat.name]];
    const paths = [];
    for (const pid of parentIds) {
        const parentPaths = buildAllPaths(String(pid), allCats, newVisited);
        if (parentPaths.length === 0) paths.push([cat.name]);
        else parentPaths.forEach((pp) => paths.push([...pp, cat.name]));
    }
    return paths;
}

function buildPathString(catId, allCats) {
    const paths = buildAllPaths(catId, allCats);
    if (paths.length === 0) return '-';
    return paths.map((p) => p.join(' > ')).join(' | ');
}

// Lấy tất cả ID con cháu (tránh circular)
function getDescendantIds(catId, allCats, visited = new Set()) {
    if (visited.has(String(catId))) return [];
    visited.add(String(catId));
    const children = allCats.filter((c) =>
        (c.parent_ids || []).some((p) => String(p) === String(catId)),
    );
    return children.flatMap((child) => [
        String(child._id),
        ...getDescendantIds(String(child._id), allCats, new Set(visited)),
    ]);
}

function Categories() {
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [currentId, setCurrentId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedParentIds, setSelectedParentIds] = useState([]);
    const [auditInfo, setAuditInfo] = useState({});

    const loadCategories = () => {
        request.get('/api/categories').then((res) => setCategories(res.data));
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setCurrentId('');
        setName('');
        setDescription('');
        setSelectedParentIds([]);
        setAuditInfo({});
        setShowModal(true);
    };

    const handleOpenEdit = (cat) => {
        setIsEditMode(true);
        setCurrentId(cat._id);
        setName(cat.name);
        setDescription(cat.description);
        setSelectedParentIds((cat.parent_ids || []).map(String));
        setAuditInfo({
            created_at: cat.created_at,
            created_by: cat.created_by,
            modified_at: cat.modified_at,
            modified_by: cat.modified_by,
        });
        setShowModal(true);
    };

    const handleOpenView = (cat) => {
        setCurrentId(cat._id);
        setName(cat.name);
        setDescription(cat.description);
        setSelectedParentIds((cat.parent_ids || []).map(String));
        setAuditInfo({
            created_at: cat.created_at,
            created_by: cat.created_by,
            modified_at: cat.modified_at,
            modified_by: cat.modified_by,
        });
        setShowViewModal(true);
    };

    const toggleParent = (id) => {
        setSelectedParentIds((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { name, description, parent_ids: selectedParentIds };
            if (isEditMode) {
                await request.post('/api/editcategory', { id: currentId, ...payload });
                alert('Cập nhật danh mục thành công!');
            } else {
                await request.post('/api/addcategory', payload);
                alert('Thêm danh mục thành công!');
            }
            setShowModal(false);
            loadCategories();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra!');
        }
    };

    const handleDeleteCategory = async (id) => {
        const hasChildren = categories.some((c) =>
            (c.parent_ids || []).some((p) => String(p) === String(id)),
        );
        if (hasChildren) {
            alert('Không thể xóa danh mục có danh mục con. Hãy xóa danh mục con trước.');
            return;
        }
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

    const filteredCategories = categories.filter((cat) =>
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Danh sách được phép chọn làm cha (loại chính nó và con cháu)
    const availableParents = (() => {
        const excluded = isEditMode
            ? new Set([String(currentId), ...getDescendantIds(currentId, categories)])
            : new Set();
        return categories.filter((c) => !excluded.has(String(c._id)));
    })();

    const renderParentCheckboxes = () => (
        <div className="mb-3">
            <label className="form-label">Danh mục cha</label>
            <div
                style={{
                    maxHeight: '160px',
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '8px',
                }}
            >
                {availableParents.length === 0 && (
                    <small className="text-muted">Không có danh mục nào</small>
                )}
                {availableParents.map((cat) => (
                    <div key={cat._id} className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`parent-${cat._id}`}
                            checked={selectedParentIds.includes(String(cat._id))}
                            onChange={() => toggleParent(String(cat._id))}
                        />
                        <label className="form-check-label" htmlFor={`parent-${cat._id}`}>
                            {cat.name}
                            <small className="text-muted ms-1">
                                ({buildPathString(cat._id, categories)})
                            </small>
                        </label>
                    </div>
                ))}
            </div>
            {selectedParentIds.length === 0 && (
                <small className="text-muted">Không chọn = danh mục gốc</small>
            )}
        </div>
    );

    return (
        <div className={cx('wrapper')} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Quản Lý Danh Mục</h3>
                <Button variant="primary" onClick={handleOpenAdd}>
                    + Thêm Danh Mục
                </Button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tên danh mục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            <div className={cx('table-container')} style={{ background: '#fff', borderRadius: '8px', padding: '15px' }}>
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Tên Danh Mục</th>
                            <th>Đường dẫn</th>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Người tạo</th>
                            <th>Ngày sửa</th>
                            <th>Người sửa</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <span title={item._id}>{item._id.substring(0, 8)}...</span>
                                </td>
                                <td>{item.name}</td>
                                <td>
                                    <small className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                                        {buildPathString(item._id, categories)}
                                    </small>
                                </td>
                                <td>{item.description}</td>
                                <td>{formatDateString(item.created_at)}</td>
                                <td>{item.created_by || '-'}</td>
                                <td>{formatDateString(item.modified_at)}</td>
                                <td>{item.modified_by || '-'}</td>
                                <td>
                                    <button
                                        className="btn btn-info btn-sm text-white"
                                        onClick={() => handleOpenView(item)}
                                        style={{ marginRight: '6px' }}
                                    >
                                        Xem
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleOpenEdit(item)}
                                        style={{ marginRight: '6px' }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeleteCategory(item._id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredCategories.length === 0 && (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                    Không tìm thấy danh mục nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Xem */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xem Chi Tiết Danh Mục</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label text-muted">Tên Danh Mục</label>
                        <p className="fw-bold">{name}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted">Đường dẫn</label>
                        {buildAllPaths(currentId, categories).map((path, i) => (
                            <p key={i} className="text-primary mb-1">{path.join(' > ')}</p>
                        ))}
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted">Mô tả</label>
                        <p>{description || 'Không có mô tả'}</p>
                    </div>
                    <div className="mt-4 p-3 bg-light border rounded">
                        <h6>Thông tin hệ thống</h6>
                        <div className="row">
                            <div className="col-md-6 mb-2">
                                <small className="text-muted">
                                    <strong>Ngày tạo:</strong> {formatDateString(auditInfo.created_at)}
                                </small>
                            </div>
                            <div className="col-md-6 mb-2">
                                <small className="text-muted">
                                    <strong>Người tạo:</strong> {auditInfo.created_by || '-'}
                                </small>
                            </div>
                            <div className="col-md-6 mb-2">
                                <small className="text-muted">
                                    <strong>Ngày sửa:</strong> {formatDateString(auditInfo.modified_at)}
                                </small>
                            </div>
                            <div className="col-md-6 mb-2">
                                <small className="text-muted">
                                    <strong>Người sửa:</strong> {auditInfo.modified_by || '-'}
                                </small>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Thêm / Sửa */}
            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="mb-3">
                            <label className="form-label">Tên Danh Mục (*)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        {renderParentCheckboxes()}
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                        {isEditMode && (
                            <div className="mt-4 p-3 bg-light border rounded">
                                <h6>Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break">
                                            <strong>Ngày tạo:</strong> {formatDateString(auditInfo.created_at)}
                                        </small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break">
                                            <strong>Người tạo:</strong> {auditInfo.created_by || '-'}
                                        </small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break">
                                            <strong>Ngày sửa:</strong> {formatDateString(auditInfo.modified_at)}
                                        </small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted text-break">
                                            <strong>Người sửa:</strong> {auditInfo.modified_by || '-'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Đóng
                        </Button>
                        <Button type="submit" variant="primary">
                            {isEditMode ? 'Cập Nhật' : 'Thêm Mới'}
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

export default Categories;
