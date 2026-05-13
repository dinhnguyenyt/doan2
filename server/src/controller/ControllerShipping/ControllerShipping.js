const ModelShippingConfig = require('../../model/ModelShippingConfig');
const { jwtDecode } = require('jwt-decode');

// Chuẩn hoá tên tỉnh/thành: lowercase + bỏ khoảng trắng thừa
function normalizeCity(city) {
    return (city || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Lấy hoặc tạo config mặc định nếu chưa có
async function getOrCreateConfig() {
    let config = await ModelShippingConfig.findOne();
    if (!config) config = await ModelShippingConfig.create({});
    return config;
}

const ControllerShipping = {
    async GetConfig(req, res) {
        try {
            const config = await getOrCreateConfig();
            return res.status(200).json(config);
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    async UpdateConfig(req, res) {
        try {
            const decoded = jwtDecode(req.cookies.Token);
            const { warehouse_city, domestic_fee, inter_province_fee, free_threshold } = req.body;

            const config = await getOrCreateConfig();
            config.warehouse_city     = (warehouse_city || '').trim();
            config.domestic_fee       = Number(domestic_fee)       || 0;
            config.inter_province_fee = Number(inter_province_fee) || 0;
            config.free_threshold     = Number(free_threshold)     || 0;
            config.updated_by         = decoded.email;
            config.updated_at         = new Date();
            await config.save();

            return res.status(200).json({ message: 'Cập nhật cấu hình thành công', config });
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    async CalculateFee(req, res) {
        try {
            const { city, sumPrice } = req.query;
            const config = await getOrCreateConfig();
            const orderTotal = Number(sumPrice) || 0;

            // Miễn phí theo ngưỡng đơn hàng
            if (config.free_threshold > 0 && orderTotal >= config.free_threshold) {
                return res.status(200).json({
                    fee: 0,
                    label: 'Miễn phí',
                    note: `Đơn hàng ≥ ${config.free_threshold.toLocaleString('vi-VN')} VNĐ`,
                });
            }

            const customerCity  = normalizeCity(city);
            const warehouseCity = normalizeCity(config.warehouse_city);

            // Nếu chưa cấu hình kho → áp phí liên tỉnh
            if (!warehouseCity || !customerCity) {
                return res.status(200).json({ fee: config.inter_province_fee, label: 'Liên tỉnh' });
            }

            // So sánh tên tỉnh/thành (contains để chịu được "TP. Hồ Chí Minh" vs "Hồ Chí Minh")
            const isDomestic = customerCity.includes(warehouseCity) || warehouseCity.includes(customerCity);

            return res.status(200).json(
                isDomestic
                    ? { fee: config.domestic_fee,       label: 'Nội thành' }
                    : { fee: config.inter_province_fee, label: 'Liên tỉnh' },
            );
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },
};

module.exports = ControllerShipping;
