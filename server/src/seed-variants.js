const mongoose = require('mongoose');
require('dotenv').config();

const VariantSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    color: { type: String, default: '' },
    color_hex: { type: String, default: '' },
    size: { type: String, default: '' },
    size_note: { type: String, default: '' },
    stock_quantity: { type: Number, default: 0 },
    price_adjustment: { type: Number, default: 0 },
    img: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
});
const Variant = mongoose.model('product_variants', VariantSchema);

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('products', ProductSchema);

// Nhóm size theo loại sản phẩm
function getSizeGroup(name = '') {
    const n = name.toLowerCase();
    if (n.includes('quần jean') || n.includes('quần kaki') || n.includes('quần short') || n.includes('legging') || n.includes('jogger')) {
        return 'pants';
    }
    return 'top';
}

// Size cho áo / váy / đầm
const TOP_SIZES = [
    { size: 'S',   size_note: 'Dưới 50kg',   price_adjustment: 0 },
    { size: 'M',   size_note: '50-60kg',       price_adjustment: 0 },
    { size: 'L',   size_note: '60-70kg',       price_adjustment: 10000 },
    { size: 'XL',  size_note: '70-80kg',       price_adjustment: 30000 },
    { size: 'XXL', size_note: 'Trên 80kg',     price_adjustment: 50000 },
];

// Size cho quần
const PANTS_SIZES = [
    { size: '28', size_note: 'Eo 68-72cm', price_adjustment: 0 },
    { size: '30', size_note: 'Eo 74-78cm', price_adjustment: 0 },
    { size: '32', size_note: 'Eo 80-84cm', price_adjustment: 10000 },
    { size: '34', size_note: 'Eo 86-90cm', price_adjustment: 20000 },
];

async function seed() {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/doan2';
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    await Variant.deleteMany({});
    console.log('Cleared existing variants');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    const variants = [];

    for (const product of products) {
        const group = getSizeGroup(product.nameProducts || '');
        const sizes = group === 'pants' ? PANTS_SIZES : TOP_SIZES;

        for (const s of sizes) {
            variants.push({
                product_id: product._id,
                color: '',
                color_hex: '',
                size: s.size,
                size_note: s.size_note,
                stock_quantity: Math.floor(Math.random() * 50) + 10,
                price_adjustment: s.price_adjustment,
                img: '',
                created_at: new Date(),
            });
        }
    }

    await Variant.insertMany(variants);
    console.log(`Created ${variants.length} variants for ${products.length} products`);

    await mongoose.disconnect();
    console.log('Done!');
}

seed().catch(err => { console.error(err); process.exit(1); });
