import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import request from '../../../../../config/Connect';
import VietnamCitySelect from '../../../../../components/VietnamCitySelect/VietnamCitySelect';

function Shipping() {
    const [config, setConfig] = useState({
        warehouse_city:     '',
        domestic_fee:       20000,
        inter_province_fee: 35000,
        free_threshold:     500000,
    });
    const [saving, setSaving] = useState(false);

    // Test phí
    const [testCity, setTestCity]         = useState('');
    const [testTotal, setTestTotal]       = useState('');
    const [testResult, setTestResult]     = useState(null);

    useEffect(() => {
        request.get('/api/shipping-config')
            .then((res) => {
                const d = res.data;
                setConfig({
                    warehouse_city:     d.warehouse_city     || '',
                    domestic_fee:       d.domestic_fee       ?? 20000,
                    inter_province_fee: d.inter_province_fee ?? 35000,
                    free_threshold:     d.free_threshold     ?? 500000,
                });
            })
            .catch(() => {});
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await request.post('/api/shipping-config', config);
            toast.success('Đã lưu cấu hình vận chuyển');
        } catch {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!testCity || !testTotal) return toast.error('Nhập tỉnh/thành và tổng tiền để test');
        try {
            const res = await request.get(`/api/shipping-fee?city=${encodeURIComponent(testCity)}&sumPrice=${testTotal}`);
            setTestResult(res.data);
        } catch {
            toast.error('Lỗi khi tính phí');
        }
    };

    const field = (label, key, type = 'number', hint = '') => (
        <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>{label}</label>
            {hint && <div className="text-muted mb-1" style={{ fontSize: 12 }}>{hint}</div>}
            <input
                type={type}
                className="form-control"
                value={config[key]}
                onChange={(e) => setConfig((c) => ({ ...c, [key]: type === 'number' ? e.target.value : e.target.value }))}
            />
        </div>
    );

    return (
        <div style={{ padding: 20, maxWidth: 720 }}>
            <ToastContainer />
            <h3 style={{ marginBottom: 24 }}>Cấu Hình Vận Chuyển</h3>

            <form onSubmit={handleSave}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                    <h5 style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>Thông tin kho hàng</h5>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Tỉnh / Thành phố đặt kho</label>
                        <div className="text-muted mb-1" style={{ fontSize: 12 }}>Chọn đúng tỉnh/thành. Dùng để phân biệt nội thành / liên tỉnh.</div>
                        <VietnamCitySelect
                            value={config.warehouse_city}
                            onChange={(e) => setConfig((c) => ({ ...c, warehouse_city: e.target.value }))}
                        />
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                    <h5 style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>Bảng phí vận chuyển</h5>
                    <div className="row">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Phí nội thành (VNĐ)</label>
                            <div className="text-muted mb-1" style={{ fontSize: 12 }}>Cùng tỉnh/thành với kho</div>
                            <div className="input-group mb-3">
                                <input
                                    type="number" min="0" className="form-control"
                                    value={config.domestic_fee}
                                    onChange={(e) => setConfig((c) => ({ ...c, domestic_fee: e.target.value }))}
                                />
                                <span className="input-group-text">VNĐ</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Phí liên tỉnh (VNĐ)</label>
                            <div className="text-muted mb-1" style={{ fontSize: 12 }}>Tỉnh/thành khác với kho</div>
                            <div className="input-group mb-3">
                                <input
                                    type="number" min="0" className="form-control"
                                    value={config.inter_province_fee}
                                    onChange={(e) => setConfig((c) => ({ ...c, inter_province_fee: e.target.value }))}
                                />
                                <span className="input-group-text">VNĐ</span>
                            </div>
                        </div>
                    </div>

                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Ngưỡng miễn phí vận chuyển (VNĐ)</label>
                    <div className="text-muted mb-1" style={{ fontSize: 12 }}>
                        Đơn hàng ≥ ngưỡng này → miễn phí. Đặt 0 để tắt tính năng.
                    </div>
                    <div className="input-group mb-0">
                        <input
                            type="number" min="0" className="form-control"
                            value={config.free_threshold}
                            onChange={(e) => setConfig((c) => ({ ...c, free_threshold: e.target.value }))}
                        />
                        <span className="input-group-text">VNĐ</span>
                    </div>
                    {Number(config.free_threshold) > 0 && (
                        <div className="mt-1 text-success" style={{ fontSize: 12 }}>
                            Miễn phí khi đơn ≥ {Number(config.free_threshold).toLocaleString('vi-VN')} VNĐ
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
            </form>

            {/* Công cụ test */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginTop: 32 }}>
                <h5 style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                    Kiểm tra phí vận chuyển
                </h5>
                <div className="row g-2 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: 13 }}>Tỉnh/thành giao hàng</label>
                        <VietnamCitySelect
                            value={testCity}
                            onChange={(e) => setTestCity(e.target.value)}
                            className="form-select form-select-sm"
                            placeholder="Chọn tỉnh/thành..."
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: 13 }}>Tổng tiền sản phẩm (VNĐ)</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="VD: 300000"
                            value={testTotal}
                            onChange={(e) => setTestTotal(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <button className="btn btn-outline-primary btn-sm w-100" onClick={handleTest}>
                            Tính phí
                        </button>
                    </div>
                </div>

                {testResult && (
                    <div className="mt-3 p-3 rounded" style={{ background: testResult.fee === 0 ? '#e6f4ea' : '#fff3e0', border: `1px solid ${testResult.fee === 0 ? '#198754' : '#fd7e14'}` }}>
                        <div style={{ fontWeight: 700, color: testResult.fee === 0 ? '#198754' : '#fd7e14', fontSize: 15 }}>
                            {testResult.label}: {testResult.fee === 0 ? 'Miễn phí' : `${Number(testResult.fee).toLocaleString('vi-VN')} VNĐ`}
                        </div>
                        {testResult.note && <div className="text-muted mt-1" style={{ fontSize: 12 }}>{testResult.note}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shipping;
