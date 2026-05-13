import VIETNAM_PROVINCES from '../../config/vietnamProvinces';

function VietnamCitySelect({ value, onChange, className = 'form-select', placeholder = 'Chọn tỉnh / thành phố', style }) {
    return (
        <select value={value} onChange={onChange} className={className} style={style}>
            <option value="">{placeholder}</option>
            {VIETNAM_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
            ))}
        </select>
    );
}

export default VietnamCitySelect;
