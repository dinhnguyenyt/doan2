const mongoose = require('mongoose');
require('dotenv').config();

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    parent_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],
    slug: { type: String, default: '' },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});
const Category = mongoose.model('category', CategorySchema);

const ProductSchema = new mongoose.Schema({
    id: { type: Number, default: 0 },
    img: { type: String, default: '' },
    images: [{ type: String }],
    nameProducts: { type: String, default: '' },
    priceNew: { type: Number, default: 0 },
    priceOld: { type: Number, default: 0 },
    des: { type: String, default: '' },
    checkProducts: { type: String, default: '' },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    stock_quantity: { type: Number, default: 100 },
    rating_avg: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    like_count: { type: Number, default: 0 },
    free_shipping: { type: Boolean, default: false },
    shipping_note: { type: String, default: '' },
    return_days: { type: Number, default: 15 },
    has_fashion_insurance: { type: Boolean, default: false },
    created_by: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    modified_by: { type: String, default: '' },
    modified_at: { type: Date, default: null },
});
const Product = mongoose.model('products', ProductSchema);

function slug(name) {
    return name.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function seed() {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/doan2';
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing categories and products');

    // ── LEVEL 1 ──
    const [nam, nu, treem] = await Category.insertMany([
        { name: 'Thời trang nam',     slug: 'thoi-trang-nam',     description: 'Các sản phẩm thời trang dành cho nam giới' },
        { name: 'Thời trang nữ',      slug: 'thoi-trang-nu',      description: 'Các sản phẩm thời trang dành cho nữ giới' },
        { name: 'Thời trang trẻ em',  slug: 'thoi-trang-tre-em',  description: 'Các sản phẩm thời trang dành cho trẻ em' },
    ]);
    console.log('Created Level 1 categories');

    // ── LEVEL 2 ──
    const [aoNam, quanNam, theThaoNam, aoNu, quanNu, vayDam, theThaoNu, aoTreEm, quanTreEm] = await Category.insertMany([
        { name: 'Áo nam',          slug: slug('Áo nam'),          description: 'Các loại áo dành cho nam',       parent_ids: [nam._id] },
        { name: 'Quần nam',        slug: slug('Quần nam'),        description: 'Các loại quần dành cho nam',     parent_ids: [nam._id] },
        { name: 'Đồ thể thao nam', slug: slug('Đồ thể thao nam'), description: 'Trang phục thể thao nam',        parent_ids: [nam._id] },
        { name: 'Áo nữ',          slug: slug('Áo nữ'),          description: 'Các loại áo dành cho nữ',        parent_ids: [nu._id]  },
        { name: 'Quần nữ',        slug: slug('Quần nữ'),        description: 'Các loại quần dành cho nữ',      parent_ids: [nu._id]  },
        { name: 'Váy & Đầm',      slug: slug('Váy & Đầm'),      description: 'Váy và đầm thời trang',          parent_ids: [nu._id]  },
        { name: 'Đồ thể thao nữ', slug: slug('Đồ thể thao nữ'), description: 'Trang phục thể thao nữ',         parent_ids: [nu._id]  },
        { name: 'Áo trẻ em',      slug: slug('Áo trẻ em'),      description: 'Áo dành cho trẻ em',            parent_ids: [treem._id] },
        { name: 'Quần trẻ em',    slug: slug('Quần trẻ em'),    description: 'Quần dành cho trẻ em',          parent_ids: [treem._id] },
    ]);
    console.log('Created Level 2 categories');

    // ── LEVEL 3 ──
    const [
        aoThunNam, aoSoMiNam, aoKhoacNam, aoPoloNam,
        quanJeanNam, quanKakiNam, quanShortNam,
        aoThunNu, aoSoMiNu, aoKhoacNu, aoBlouNu,
        quanJeanNu, quanKakiNu, quanShortNu,
        vayNgan, damDai, damTiec,
        aoThunTreEm, quanJeanTreEm,
    ] = await Category.insertMany([
        { name: 'Áo thun nam',       slug: slug('Áo thun nam'),       description: 'Áo thun cotton cho nam',       parent_ids: [aoNam._id] },
        { name: 'Áo sơ mi nam',      slug: slug('Áo sơ mi nam'),      description: 'Áo sơ mi công sở & dạo phố',  parent_ids: [aoNam._id] },
        { name: 'Áo khoác nam',      slug: slug('Áo khoác nam'),      description: 'Áo khoác mùa đông & dạo phố', parent_ids: [aoNam._id] },
        { name: 'Áo polo nam',       slug: slug('Áo polo nam'),       description: 'Áo polo lịch sự cho nam',      parent_ids: [aoNam._id] },
        { name: 'Quần jean nam',     slug: slug('Quần jean nam'),     description: 'Quần jean thời trang nam',     parent_ids: [quanNam._id] },
        { name: 'Quần kaki nam',     slug: slug('Quần kaki nam'),     description: 'Quần kaki lịch sự nam',       parent_ids: [quanNam._id] },
        { name: 'Quần short nam',    slug: slug('Quần short nam'),    description: 'Quần short mùa hè nam',       parent_ids: [quanNam._id] },
        { name: 'Áo thun nữ',        slug: slug('Áo thun nữ'),        description: 'Áo thun cotton cho nữ',        parent_ids: [aoNu._id] },
        { name: 'Áo sơ mi nữ',       slug: slug('Áo sơ mi nữ'),       description: 'Áo sơ mi công sở & dạo phố',  parent_ids: [aoNu._id] },
        { name: 'Áo khoác nữ',       slug: slug('Áo khoác nữ'),       description: 'Áo khoác thời trang nữ',      parent_ids: [aoNu._id] },
        { name: 'Áo blouse nữ',      slug: slug('Áo blouse nữ'),      description: 'Áo blouse thanh lịch nữ',     parent_ids: [aoNu._id] },
        { name: 'Quần jean nữ',      slug: slug('Quần jean nữ'),      description: 'Quần jean nữ thời trang',     parent_ids: [quanNu._id] },
        { name: 'Quần kaki nữ',      slug: slug('Quần kaki nữ'),      description: 'Quần kaki nữ thanh lịch',    parent_ids: [quanNu._id] },
        { name: 'Quần short nữ',     slug: slug('Quần short nữ'),     description: 'Quần short nữ mùa hè',       parent_ids: [quanNu._id] },
        { name: 'Váy ngắn',          slug: slug('Váy ngắn'),          description: 'Váy ngắn thời trang',         parent_ids: [vayDam._id] },
        { name: 'Đầm dài',           slug: slug('Đầm dài'),           description: 'Đầm dài thanh lịch',          parent_ids: [vayDam._id] },
        { name: 'Đầm dự tiệc',       slug: slug('Đầm dự tiệc'),       description: 'Đầm sang trọng dự tiệc',      parent_ids: [vayDam._id] },
        { name: 'Áo thun trẻ em',    slug: slug('Áo thun trẻ em'),    description: 'Áo thun cho bé',              parent_ids: [aoTreEm._id] },
        { name: 'Quần jean trẻ em',  slug: slug('Quần jean trẻ em'),  description: 'Quần jean cho bé',            parent_ids: [quanTreEm._id] },
    ]);
    console.log('Created Level 3 categories');

    // ── PRODUCTS ──
    let pid = 1;
    const p = (nameProducts, priceNew, priceOld, category_id, des, extra = {}) => ({
        id: pid++,
        nameProducts,
        priceNew,
        priceOld,
        category_id,
        des,
        img: `https://picsum.photos/seed/${nameProducts.replace(/\s/g, '')}/400/500`,
        images: [],
        stock_quantity: Math.floor(Math.random() * 200) + 20,
        rating_avg: +(Math.random() * 2 + 3).toFixed(1),
        rating_count: Math.floor(Math.random() * 500) + 10,
        like_count: Math.floor(Math.random() * 300),
        free_shipping: Math.random() > 0.5,
        return_days: 15,
        ...extra,
    });

    const products = [
        // Áo thun nam (10)
        p('Áo thun nam Basic trắng',       149000, 199000, aoThunNam._id,  'Áo thun cotton 100%, form regular fit'),
        p('Áo thun nam Basic đen',          149000, 199000, aoThunNam._id,  'Áo thun cotton 100%, form regular fit'),
        p('Áo thun nam Graphic in hình',    189000, 249000, aoThunNam._id,  'Áo thun in hình độc đáo, chất liệu mềm mại'),
        p('Áo thun nam Oversize kẻ sọc',    219000, 279000, aoThunNam._id,  'Form oversize rộng, phong cách streetwear'),
        p('Áo thun nam polo cổ tròn',       169000, 229000, aoThunNam._id,  'Áo thun có cổ bo, phong cách casual'),

        // Áo sơ mi nam (5)
        p('Áo sơ mi nam công sở trắng',    359000, 449000, aoSoMiNam._id,  'Vải lụa mịn, form slim fit, phù hợp đi làm'),
        p('Áo sơ mi nam flannel kẻ caro',  299000, 399000, aoSoMiNam._id,  'Vải flannel ấm áp, họa tiết caro cổ điển'),
        p('Áo sơ mi nam Oxford xanh navy', 329000, 429000, aoSoMiNam._id,  'Vải Oxford bền đẹp, phong cách preppy'),
        p('Áo sơ mi nam denim nhẹ',        379000, 479000, aoSoMiNam._id,  'Chất liệu denim mỏng nhẹ, mặc thoải mái'),
        p('Áo sơ mi nam linen trắng',      349000, 449000, aoSoMiNam._id,  'Vải linen thoáng mát, lý tưởng cho mùa hè'),

        // Áo khoác nam (4)
        p('Áo khoác nam dù bomber',        599000, 749000, aoKhoacNam._id, 'Áo khoác bomber chống gió nhẹ, 2 lớp'),
        p('Áo khoác nam jean Trucker',      699000, 899000, aoKhoacNam._id, 'Áo khoác jean kinh điển, bền theo thời gian'),
        p('Áo khoác hoodie nam nỉ',         449000, 579000, aoKhoacNam._id, 'Hoodie nỉ bông dày, có túi kangaroo'),
        p('Áo khoác nam da PU đen',         899000,1199000, aoKhoacNam._id, 'Áo khoác da PU cao cấp, lót lông mềm'),

        // Áo polo nam (3)
        p('Áo polo nam cotton pique trắng', 259000, 329000, aoPoloNam._id,  'Polo cotton pique thoáng mát, form slim'),
        p('Áo polo nam cổ bẻ xanh',        259000, 329000, aoPoloNam._id,  'Polo cổ bẻ thanh lịch cho văn phòng & đi chơi'),
        p('Áo polo nam phối viền',          279000, 359000, aoPoloNam._id,  'Polo phối màu viền cổ tay & cổ áo'),

        // Quần jean nam (5)
        p('Quần jean nam slim fit xanh',    549000, 699000, quanJeanNam._id,'Quần jean slim fit, co giãn nhẹ dễ mặc'),
        p('Quần jean nam skinny đen',       579000, 729000, quanJeanNam._id,'Quần jean skinny bó vừa, phong cách trẻ'),
        p('Quần jean nam ripped gối',       599000, 779000, quanJeanNam._id,'Quần jean rách gối streetwear'),
        p('Quần jean nam straight fit',     529000, 679000, quanJeanNam._id,'Quần jean ống suôn, cổ điển tiện dụng'),
        p('Quần jean nam baggy xám',        629000, 799000, quanJeanNam._id,'Quần jean baggy rộng, phong cách Y2K'),

        // Quần kaki nam (3)
        p('Quần kaki nam slim kaki vàng',   469000, 599000, quanKakiNam._id,'Quần kaki nam form slim, màu kaki cơ bản'),
        p('Quần kaki nam ống đứng xanh',    489000, 619000, quanKakiNam._id,'Quần kaki ống suôn, phù hợp đi làm & dạo phố'),
        p('Quần kaki nam cargo túi hộp',    519000, 679000, quanKakiNam._id,'Quần kaki cargo nhiều túi, phong cách military'),

        // Quần short nam (3)
        p('Quần short nam kaki kẻ sọc',    299000, 379000, quanShortNam._id,'Short kaki mặc hè, thoáng mát'),
        p('Quần short nam thể thao dù',     249000, 319000, quanShortNam._id,'Short dù nhẹ, thấm hút mồ hôi tốt'),
        p('Quần short nam jean rách',       349000, 449000, quanShortNam._id,'Short jean rách cá tính phong cách hè'),

        // Áo thun nữ (5)
        p('Áo thun nữ crop top trắng',     159000, 219000, aoThunNu._id,  'Crop top cotton mềm, form ôm nhẹ'),
        p('Áo thun nữ oversize be',         179000, 239000, aoThunNu._id,  'Áo thun oversize màu be thanh lịch'),
        p('Áo thun nữ in hình hoạt hình',   189000, 249000, aoThunNu._id,  'Áo thun in hình cute, dễ phối đồ'),
        p('Áo thun nữ sọc ngang navy',      169000, 229000, aoThunNu._id,  'Thun sọc ngang cổ điển kiểu Pháp'),
        p('Áo thun nữ peplum hồng',         199000, 269000, aoThunNu._id,  'Áo peplum tôn dáng, màu hồng dịu dàng'),

        // Áo sơ mi nữ (4)
        p('Áo sơ mi nữ lụa trắng tay dài', 379000, 479000, aoSoMiNu._id,  'Sơ mi lụa mịn, trang nhã đi làm'),
        p('Áo sơ mi nữ caro oversize',      349000, 449000, aoSoMiNu._id,  'Sơ mi caro oversize phong cách casual'),
        p('Áo sơ mi nữ linen be tay ngắn',  329000, 429000, aoSoMiNu._id,  'Sơ mi linen mỏng nhẹ thoáng mát hè'),
        p('Áo sơ mi nữ jeans thêu hoa',     399000, 499000, aoSoMiNu._id,  'Sơ mi jeans thêu hoa nghệ thuật'),

        // Áo khoác nữ (3)
        p('Áo khoác nữ dạ ngắn kem',       799000, 999000, aoKhoacNu._id, 'Áo dạ ngắn dáng A-line ấm áp mùa đông'),
        p('Áo khoác nữ bomber hoa',         649000, 849000, aoKhoacNu._id, 'Bomber in hoa nữ tính, gió nhẹ'),
        p('Áo khoác nữ cardigan len',       549000, 699000, aoKhoacNu._id, 'Cardigan len dày ấm, phong cách vintage'),

        // Quần jean nữ (4)
        p('Quần jean nữ skinny xanh',       549000, 699000, quanJeanNu._id,'Skinny jean co giãn, tôn dáng'),
        p('Quần jean nữ ống loe xanh nhạt', 589000, 749000, quanJeanNu._id,'Ống loe retro phong cách 70s'),
        p('Quần jean nữ baggy trắng',       629000, 799000, quanJeanNu._id,'Baggy jean trắng trendy, cá tính'),
        p('Quần jean nữ mom jeans ripped',  579000, 729000, quanJeanNu._id,'Mom jeans rách vintage cổ điển'),

        // Váy ngắn (4)
        p('Váy ngắn xếp ly pastel',         329000, 429000, vayNgan._id,   'Váy xếp ly màu pastel thanh lịch'),
        p('Váy ngắn denim nút bấm',         349000, 449000, vayNgan._id,   'Váy denim nút bấm phong cách casual'),
        p('Váy ngắn hoa nhí nữ tính',       299000, 399000, vayNgan._id,   'Váy hoa nhí dịu dàng, nhẹ nhàng'),
        p('Váy tennis trắng thể thao',      359000, 459000, vayNgan._id,   'Váy tennis năng động, kèm quần short lót'),

        // Đầm dài (3)
        p('Đầm maxi hoa mùa hè',           499000, 649000, damDai._id,    'Đầm maxi vải thô hoa, bay bổng mùa hè'),
        p('Đầm dài linen trơn be',          549000, 699000, damDai._id,    'Đầm linen thanh lịch, phù hợp nhiều dịp'),
        p('Đầm wrap dài họa tiết hình học', 479000, 629000, damDai._id,    'Đầm wrap quấn tôn dáng, họa tiết độc đáo'),

        // Đầm dự tiệc (2)
        p('Đầm dạ tiệc xẻ tà đen',        1299000,1699000, damTiec._id,   'Đầm tối dự tiệc sang trọng, xẻ tà gợi cảm'),
        p('Đầm cocktail đỏ tay bồng',      1199000,1499000, damTiec._id,   'Đầm cocktail đỏ nổi bật, tay bồng điệu đà'),

        // Áo thun trẻ em (3)
        p('Áo thun bé trai in khủng long', 129000, 169000, aoThunTreEm._id,'Áo thun bé trai in khủng long cute'),
        p('Áo thun bé gái in unicorn',     129000, 169000, aoThunTreEm._id,'Áo thun bé gái in kỳ lân màu pastel'),
        p('Áo thun trẻ em unisex sọc',     119000, 159000, aoThunTreEm._id,'Áo thun sọc unisex cho cả bé trai & gái'),

        // Quần jean trẻ em (2)
        p('Quần jean bé trai slim xanh',   229000, 299000, quanJeanTreEm._id,'Quần jean mềm co giãn cho bé trai'),
        p('Quần jean bé gái thêu hoa',     249000, 319000, quanJeanTreEm._id,'Quần jean bé gái thêu hoa dễ thương'),

        // Đồ thể thao (thêm cho đủ 60+)
        p('Bộ thể thao nam training xám',  499000, 649000, theThaoNam._id, 'Bộ áo quần thể thao nam, thấm hút mồ hôi tốt'),
        p('Quần jogger nam basic đen',      349000, 449000, theThaoNam._id, 'Quần jogger cạp chun, form đứng thoải mái'),
        p('Áo thể thao nữ yoga crop',       299000, 399000, theThaoNu._id,  'Áo yoga crop top, co giãn 4 chiều'),
        p('Quần legging nữ thể thao đen',   379000, 479000, theThaoNu._id,  'Legging thể thao nâng mông, bền màu'),
    ];

    await Product.insertMany(products);
    console.log(`Created ${products.length} products`);

    console.log('\n=== SEED COMPLETED ===');
    console.log(`Categories: Level 1: 3 | Level 2: 9 | Level 3: 19 | Total: 31`);
    console.log(`Products: ${products.length}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

seed().catch(err => { console.error(err); process.exit(1); });
