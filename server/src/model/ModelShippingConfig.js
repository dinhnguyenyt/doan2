const mongoose = require('mongoose');

const ModelShippingConfig = new mongoose.Schema({
    warehouse_city:     { type: String, default: '' },
    domestic_fee:       { type: Number, default: 20000 },
    inter_province_fee: { type: Number, default: 35000 },
    free_threshold:     { type: Number, default: 500000 }, // 0 = tắt tính năng miễn phí theo ngưỡng
    updated_by:         { type: String, default: '' },
    updated_at:         { type: Date,   default: null },
});

module.exports = mongoose.model('shipping_config', ModelShippingConfig);
