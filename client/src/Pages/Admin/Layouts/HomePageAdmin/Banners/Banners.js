import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { formatDateString } from '../../../../../utils/formatDate';
import { usePermission } from '../../../../../contexts/PermissionContext';

const LINK_TYPE_LABEL = {
    product: 'Sản phẩm',
    category: 'Danh mục',
    url: 'Đường dẫn ngoài',
    none: 'Không liên kết',
};

function Banners() {
    const { actions } = usePermission();
    const [banners, setBanners] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [currentId, setCurrentId] = useState('');
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [linkType, setLinkType] = useState('none');
    const [productId, setProductId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [auditInfo, setAuditInfo] = useState({});

    const loadBanners = () => {
        request.get('/api/admin/banners').then((res) => setBanners(res.data));
    };

    useEffect(() => {
        loadBanners();
        request.get('/api/products').then((res) => setProducts(res.data));
        request.get('/api/categories').then((res) => setCategories(res.data));
    }, []);

    const resetForm = () => {
        setCurrentId('');
        setTitle('');
        setImage('');
        setLinkType('none');
        setProductId('');
        setCategoryId('');
        setExternalUrl('');
        setDisplayOrder(0);
        setIsActive(true);
        setStartAt('');
        setEndAt('');
        setAuditInfo({});
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        resetForm();
        setShowModal(true);
    };

    const toDateInputValue = (value) => (value ? value.substring(0, 10) : '');

    const handleOpenEdit = (banner) => {
        setIsEditMode(true);
        setCurrentId(banner._id);
        setTitle(banner.title || '');
        setImage(banner.image || '');
        setLinkType(banner.link_type || 'none');
        setProductId(banner.product_id?._id || banner.product_id || '');
        setCategoryId(banner.category_id?._id || banner.category_id || '');
        setExternalUrl(banner.external_url || '');
        setDisplayOrder(banner.display_order || 0);
        setIsActive(banner.is_active !== false);
        setStartAt(toDateInputValue(banner.start_at));
        setEndAt(toDateInputValue(banner.end_at));
        setAuditInfo({
            created_at: banner.created_at,
            created_by: banner.created_by,
            modified_at: banner.modified_at,
            modified_by: banner.modified_by,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                image,
                link_type: linkType,
                product_id: linkType === 'product' ? productId : null,
                category_id: linkType === 'category' ? categoryId : null,
                external_url: linkType === 'url' ? externalUrl : '',
                display_order: Number(displayOrder) || 0,
                is_active: isActive,
                start_at: startAt || null,
                end_at: endAt || null,
            };
            if (isEditMode) {
                await request.post('/api/editbanner', { id: currentId, ...payload });
                alert('Cập nhật banner thành công!');
            } else {
                await request.post('/api/addbanner', payload);
                alert('Thêm banner thành công!');
            }
            setShowModal(false);
            loadBanners();
        } catch (error) {
            alert(error?.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleDeleteBanner = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
            try {
                await request.post('/api/deletebanner', { id });
                alert('Xóa banner thành công!');
                loadBanners();
            } catch (error) {
                alert('Lỗi xóa banner');
            }
        }
    };

    const renderLinkTarget = (banner) => {
        if (banner.link_type === 'product') return banner.product_id?.nameProducts || '(sản phẩm đã bị xóa)';
        if (banner.link_type === 'category') return banner.category_id?.name || '(danh mục đã bị xóa)';
        if (banner.link_type === 'url') return banner.external_url;
        return '-';
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Quản Lý Banner Trang Chủ</h3>
                {actions.includes('banner:create') && (
                    <Button variant="primary" onClick={handleOpenAdd}>
                        + Thêm Banner
                    </Button>
                )}
            </div>

            <div style={{ background: '#fff', borderRadius: '8px', padding: '15px' }}>
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Ảnh</th>
                            <th>Tiêu đề nội bộ</th>
                            <th>Liên kết tới</th>
                            <th>Thứ tự</th>
                            <th>Trạng thái</th>
                            <th>Thời hạn</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <img
                                        src={item.image}
                                        alt=""
                                        style={{ width: '90px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </td>
                                <td>{item.title || '-'}</td>
                                <td>
                                    <span className="badge bg-secondary me-1">{LINK_TYPE_LABEL[item.link_type]}</span>
                                    <br />
                                    <small className="text-muted">{renderLinkTarget(item)}</small>
                                </td>
                                <td>{item.display_order}</td>
                                <td>
                                    {item.is_active ? (
                                        <span className="badge bg-success">Đang bật</span>
                                    ) : (
                                        <span className="badge bg-secondary">Đang tắt</span>
                                    )}
                                </td>
                                <td>
                                    <small>
                                        {item.start_at ? formatDateString(item.start_at) : '...'}
                                        {' → '}
                                        {item.end_at ? formatDateString(item.end_at) : '...'}
                                    </small>
                                </td>
                                <td>
                                    {actions.includes('banner:edit') && (
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => handleOpenEdit(item)}
                                            style={{ marginRight: '6px' }}
                                        >
                                            Sửa
                                        </button>
                                    )}
                                    {actions.includes('banner:delete') && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBanner(item._id)}>
                                            Xóa
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {banners.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                    Chưa có banner nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Sửa Banner' : 'Thêm Banner Mới'}</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="mb-3">
                            <label className="form-label">Tiêu đề nội bộ (chỉ để ghi chú, không hiển thị ngoài trang)</label>
                            <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Ảnh banner (*)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="https://..."
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                required
                            />
                            {image && (
                                <img
                                    src={image}
                                    alt=""
                                    style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', marginTop: '6px', border: '1px solid #dee2e6', borderRadius: '4px' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Banner này dẫn tới đâu khi bấm vào?</label>
                            <select className="form-select" value={linkType} onChange={(e) => setLinkType(e.target.value)}>
                                <option value="none">Không liên kết</option>
                                <option value="product">Sản phẩm</option>
                                <option value="category">Danh mục</option>
                                <option value="url">Đường dẫn khác</option>
                            </select>
                        </div>

                        {linkType === 'product' && (
                            <div className="mb-3">
                                <label className="form-label">Chọn sản phẩm (*)</label>
                                <select className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)} required>
                                    <option value="">-- Chọn sản phẩm --</option>
                                    {products.map((p) => (
                                        <option key={p._id} value={p._id}>{p.nameProducts}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {linkType === 'category' && (
                            <div className="mb-3">
                                <label className="form-label">Chọn danh mục (*)</label>
                                <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((c) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {linkType === 'url' && (
                            <div className="mb-3">
                                <label className="form-label">Đường dẫn (*)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="/blog hoặc https://..."
                                    value={externalUrl}
                                    onChange={(e) => setExternalUrl(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Thứ tự hiển thị</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(e.target.value)}
                                />
                            </div>
                            <div className="col-md-6 mb-3 d-flex align-items-end">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="bannerActive"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="bannerActive">
                                        Đang bật hiển thị
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Bắt đầu hiển thị (bỏ trống = ngay lập tức)</label>
                                <input type="date" className="form-control" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Kết thúc hiển thị (bỏ trống = không giới hạn)</label>
                                <input type="date" className="form-control" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                            </div>
                        </div>

                        {isEditMode && (
                            <div className="mt-2 p-3 bg-light border rounded">
                                <h6>Thông tin hệ thống</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted"><strong>Ngày tạo:</strong> {formatDateString(auditInfo.created_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted"><strong>Người tạo:</strong> {auditInfo.created_by || '-'}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted"><strong>Ngày sửa:</strong> {formatDateString(auditInfo.modified_at)}</small>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted"><strong>Người sửa:</strong> {auditInfo.modified_by || '-'}</small>
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

export default Banners;
