import { useEffect, useState } from 'react';

const API = 'https://provinces.open-api.vn/api';

function CascadingAddressSelect({
    province = '', district = '', ward = '',
    onProvinceChange, onDistrictChange, onWardChange,
    selectClass = 'form-select',
    wrapClass = '',
}) {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [provinceCode, setProvinceCode] = useState('');
    const [districtCode, setDistrictCode] = useState('');
    const [loading, setLoading] = useState(true);

    // Load provinces on mount
    useEffect(() => {
        fetch(`${API}/p/`)
            .then((r) => r.json())
            .then((data) => { setProvinces(data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Khi provinces đã load và có giá trị province prop → tìm code → load districts
    useEffect(() => {
        if (!provinces.length || !province) return;
        const found = provinces.find((p) => p.name === province);
        if (found && found.code !== provinceCode) setProvinceCode(found.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinces, province]);

    // Load districts khi provinceCode thay đổi
    useEffect(() => {
        if (!provinceCode) { setDistricts([]); setWards([]); return; }
        fetch(`${API}/p/${provinceCode}?depth=2`)
            .then((r) => r.json())
            .then((data) => setDistricts(data.districts || []))
            .catch(() => {});
    }, [provinceCode]);

    // Khi districts đã load và có giá trị district prop → tìm code → load wards
    useEffect(() => {
        if (!districts.length || !district) return;
        const found = districts.find((d) => d.name === district);
        if (found && found.code !== districtCode) setDistrictCode(found.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [districts, district]);

    // Load wards khi districtCode thay đổi
    useEffect(() => {
        if (!districtCode) { setWards([]); return; }
        fetch(`${API}/d/${districtCode}?depth=2`)
            .then((r) => r.json())
            .then((data) => setWards(data.wards || []))
            .catch(() => {});
    }, [districtCode]);

    const handleProvince = (e) => {
        const name = e.target.value;
        const found = provinces.find((p) => p.name === name);
        setProvinceCode(found?.code || '');
        setDistrictCode('');
        setDistricts([]);
        setWards([]);
        onProvinceChange(name);
        onDistrictChange('');
        onWardChange('');
    };

    const handleDistrict = (e) => {
        const name = e.target.value;
        const found = districts.find((d) => d.name === name);
        setDistrictCode(found?.code || '');
        setWards([]);
        onDistrictChange(name);
        onWardChange('');
    };

    return (
        <div className={wrapClass} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Tỉnh / Thành phố */}
            <select className={selectClass} value={province} onChange={handleProvince} disabled={loading}>
                <option value="">{loading ? 'Đang tải...' : 'Chọn tỉnh / thành phố'}</option>
                {provinces.map((p) => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                ))}
            </select>

            {/* Quận / Huyện */}
            <select className={selectClass} value={district} onChange={handleDistrict} disabled={!province || !districts.length}>
                <option value="">
                    {province && !districts.length ? 'Đang tải...' : 'Chọn quận / huyện'}
                </option>
                {districts.map((d) => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                ))}
            </select>

            {/* Phường / Xã */}
            <select className={selectClass} value={ward} onChange={(e) => onWardChange(e.target.value)} disabled={!district || !wards.length}>
                <option value="">
                    {district && !wards.length ? 'Đang tải...' : 'Chọn phường / xã'}
                </option>
                {wards.map((w) => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                ))}
            </select>
        </div>
    );
}

export default CascadingAddressSelect;
