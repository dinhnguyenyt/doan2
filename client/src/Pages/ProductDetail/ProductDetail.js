import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';

import Header from '../../Layouts/Header/Header';
import Footer from '../../Layouts/Footer/Footer';

import request from '../../config/Connect';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct } from '../../redux/actions';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function StarDisplay({ value, size = 16 }) {
    return (
        <span style={{ display: 'inline-flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(value) ? 'gold' : '#ddd'} stroke={i <= Math.round(value) ? 'gold' : '#ccc'} strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </span>
    );
}

// Trả về mảng các path, mỗi path là [{name, id}, ...]
function buildAllPaths(catId, allCats, visited = new Set()) {
    if (visited.has(String(catId))) return [];
    const cat = allCats.find((c) => String(c._id) === String(catId));
    if (!cat) return [];
    const newVisited = new Set(visited).add(String(catId));
    const parentIds = cat.parent_ids || [];
    const node = { name: cat.name, id: cat._id };
    if (parentIds.length === 0) return [[node]];
    const paths = [];
    for (const pid of parentIds) {
        const parentPaths = buildAllPaths(String(pid), allCats, newVisited);
        if (parentPaths.length === 0) paths.push([node]);
        else parentPaths.forEach((pp) => paths.push([...pp, node]));
    }
    return paths;
}

function ProductDetail() {
    const [dataProducts, setDataProducts] = useState(null);
    const idProduct = window.location.pathname.slice(11, 999);
    const [dataComments, setDataComments] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [variants, setVariants] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [displayPrice, setDisplayPrice] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [liked, setLiked] = useState(false);
    const [categories, setCategories] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        request.get('/api/categories').then((res) => setCategories(res.data || []));
    }, []);

    useEffect(() => {
        request.get('/api/getproduct', { params: { id: idProduct } }).then((res) => {
            setDataProducts(res.data);
            setMainImage(res.data?.img || '');
            setSelectedSize('');
            setSelectedColor('');
            setDisplayPrice(null);
        });
    }, [idProduct]);

    useEffect(() => {
        if (dataProducts?._id) {
            request.get('/api/comment', { params: { product_id: dataProducts._id } }).then((res) => setDataComments(res.data));
            request.get(`/api/variants/${dataProducts._id}`).then((res) => setVariants(res.data || []));
            request.get('/api/wishlist/check', { params: { product_id: dataProducts._id } })
                .then((res) => setLiked(res.data?.liked || false))
                .catch(() => {});
        }
    }, [dataProducts?._id]);

    const handleAddProduct = () => {
        if (uniqueSizes.length > 0 && !selectedSize) {
            alert('Vui lòng chọn kích thước trước khi thêm vào giỏ hàng');
            return;
        }
        dispatch(addProduct({
            ...dataProducts,
            priceNew: currentPrice,
            selectedSize:  selectedSize  || '',
            selectedColor: selectedColor || '',
        }));
    };

    const handleToggleLike = async () => {
        try {
            const res = await request.post('/api/wishlist/toggle', { product_id: dataProducts._id });
            setLiked(res.data.liked);
            setDataProducts((prev) => ({
                ...prev,
                like_count: res.data.liked ? (prev.like_count || 0) + 1 : Math.max((prev.like_count || 0) - 1, 0),
            }));
        } catch {
            alert('Bạn cần đăng nhập để thích sản phẩm');
        }
    };

    const handlePostComments = async (e) => {
        if (e.keyCode === 13) {
            const res = await request.post('/api/postcomment', {
                comment,
                product_id: dataProducts?._id,
                rating: rating || null,
            });
            if (res.data) {
                request.get('/api/comment', { params: { product_id: dataProducts?._id } }).then((res) => setDataComments(res.data));
                if (rating) {
                    const newCount = (dataProducts.rating_count || 0) + 1;
                    const newAvg = Math.round((((dataProducts.rating_avg || 0) * (dataProducts.rating_count || 0)) + rating) / newCount * 10) / 10;
                    setDataProducts((prev) => ({ ...prev, rating_avg: newAvg, rating_count: newCount }));
                }
                setComment('');
                setRating(0);
            }
        }
    };

    const uniqueColors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

    // Size độc lập: lấy từ tất cả variants, ưu tiên variant khớp màu nếu đã chọn
    const uniqueSizes = [...new Map(
        variants.filter((v) => v.size).map((v) => [v.size, {
            size: v.size,
            size_note: v.size_note,
            price_adjustment: v.price_adjustment || 0,
            stock: variants.filter((sv) => sv.size === v.size).reduce((s, sv) => s + (sv.stock_quantity || 0), 0),
        }])
    ).values()];

    const selectedVariant = variants.find((v) => v.color === selectedColor && v.size === selectedSize)
        || variants.find((v) => v.size === selectedSize);

    const handleSelectSize = (size, priceAdj) => {
        setSelectedSize(size);
        setDisplayPrice((dataProducts?.priceNew || 0) + (priceAdj || 0));
    };

    const currentPrice = displayPrice !== null ? displayPrice : dataProducts?.priceNew;
    const allImages = [dataProducts?.img, ...(dataProducts?.images || [])].filter(Boolean);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            {/* Thanh danh mục cha */}
            <div className={cx('category-navbar')}>
                <div className={cx('category-navbar-inner')}>
                    {categories
                        .filter(c => !c.parent_ids || c.parent_ids.length === 0)
                        .map(cat => (
                            <Link
                                key={cat._id}
                                to={`/category?category_id=${cat._id}`}
                                className={cx('category-nav-item')}
                            >
                                {cat.name}
                            </Link>
                        ))
                    }
                </div>
            </div>

            {/* Breadcrumb đường dẫn category sản phẩm */}
            {dataProducts?.category_id && categories.length > 0 && (() => {
                const paths = buildAllPaths(dataProducts.category_id, categories);
                return paths.length > 0 ? (
                    <div className={cx('breadcrumb-bar')}>
                        <div className={cx('breadcrumb-inner')}>
                            {paths.map((parts, pi) => (
                                <nav key={pi} className={cx('breadcrumb-path')}>
                                    <Link to="/category" className={cx('breadcrumb-link')}>Trang chủ</Link>
                                    {parts.map((item, i) => (
                                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <span className={cx('breadcrumb-sep')}>›</span>
                                            {i === parts.length - 1 ? (
                                                <span className={cx('breadcrumb-current')}>{item.name}</span>
                                            ) : (
                                                <Link to={`/category?category_id=${item.id}`} className={cx('breadcrumb-link')}>{item.name}</Link>
                                            )}
                                        </span>
                                    ))}
                                </nav>
                            ))}
                        </div>
                    </div>
                ) : null;
            })()}

            <main className={cx('form-detail')}>
                <div className={cx('inner-detail')}>
                    <header className={cx('form-info-product')}>

                        {/* Gallery ảnh */}
                        <div className={cx('img-product')} style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {allImages.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt=""
                                        onClick={() => setMainImage(url)}
                                        style={{
                                            width: '56px', height: '56px', objectFit: 'cover', cursor: 'pointer',
                                            border: mainImage === url ? '2px solid #ee4d2d' : '2px solid #eee',
                                            borderRadius: '4px',
                                        }}
                                    />
                                ))}
                            </div>
                            <img src={mainImage} alt="" style={{ width: '340px', height: '340px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className={cx('features-caption')} style={{ flex: 1, padding: '0 20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{dataProducts?.nameProducts}</h3>

                            {/* Đánh giá */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                                <span style={{ color: '#ee4d2d', fontWeight: 600 }}>{dataProducts?.rating_avg || 0}</span>
                                <StarDisplay value={dataProducts?.rating_avg || 0} />
                                <span style={{ color: '#767676', fontSize: '13px' }}>{dataProducts?.rating_count || 0} đánh giá</span>
                                <span style={{ color: '#ccc' }}>|</span>
                                <span style={{ color: '#767676', fontSize: '13px' }}>
                                    <span style={{ color: '#ee4d2d' }}>♥</span> {dataProducts?.like_count || 0} lượt thích
                                </span>
                            </div>

                            {/* Giá */}
                            <div style={{ background: '#fafafa', padding: '12px', borderRadius: '4px', margin: '10px 0' }}>
                                <span style={{ fontSize: '24px', color: '#ee4d2d', fontWeight: 600 }}>
                                    {currentPrice?.toLocaleString()} VNĐ
                                </span>
                                {dataProducts?.priceOld > 0 && (
                                    <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '10px', fontSize: '14px' }}>
                                        {dataProducts?.priceOld?.toLocaleString()} VNĐ
                                    </span>
                                )}
                                {selectedSize && (displayPrice - dataProducts?.priceNew) !== 0 && (
                                    <span style={{ fontSize: '12px', color: '#26aa99', marginLeft: '8px' }}>
                                        (+{(displayPrice - dataProducts?.priceNew)?.toLocaleString()} VNĐ cho size {selectedSize})
                                    </span>
                                )}
                            </div>

                            {/* Vận chuyển */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0', fontSize: '18px' }}>
                                <span style={{ color: '#767676', minWidth: '90px' }}>Vận chuyển:</span>
                                {dataProducts?.free_shipping
                                    ? <span style={{ color: '#26aa99' }}>Miễn phí vận chuyển</span>
                                    : <span style={{ color: '#555' }}>{dataProducts?.shipping_note || 'Xem thêm tùy chọn vận chuyển'}</span>
                                }
                            </div>

                            {/* Chọn màu */}
                            {uniqueColors.length > 0 && (
                                <div style={{ margin: '10px 0' }}>
                                    <span style={{ color: '#767676', fontSize: '14px', minWidth: '90px', display: 'inline-block' }}>Màu sắc:</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                        {uniqueColors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                                                style={{
                                                    padding: '6px 12px', fontSize: '13px', cursor: 'pointer',
                                                    border: selectedColor === color ? '2px solid #ee4d2d' : '1px solid #ddd',
                                                    borderRadius: '4px', background: '#fff',
                                                    color: selectedColor === color ? '#ee4d2d' : '#333',
                                                }}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chọn size */}
                            {uniqueSizes.length > 0 && (
                                <div style={{ margin: '10px 0' }}>
                                    <span style={{ color: '#767676', fontSize: '14px', minWidth: '90px', display: 'inline-block' }}>
                                        Kích thước:
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                        {uniqueSizes.map(({ size, size_note, price_adjustment, stock }) => (
                                            <button
                                                key={size}
                                                onClick={() => handleSelectSize(size, price_adjustment)}
                                                disabled={stock === 0}
                                                title={price_adjustment > 0 ? `+${price_adjustment.toLocaleString()} VNĐ` : ''}
                                                style={{
                                                    padding: '6px 16px', fontSize: '13px',
                                                    cursor: stock > 0 ? 'pointer' : 'not-allowed',
                                                    border: selectedSize === size ? '2px solid #ee4d2d' : '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    background: stock === 0 ? '#f5f5f5' : selectedSize === size ? '#fff5f5' : '#fff',
                                                    color: stock === 0 ? '#bbb' : selectedSize === size ? '#ee4d2d' : '#333',
                                                    fontWeight: selectedSize === size ? 600 : 400,
                                                    position: 'relative',
                                                }}
                                            >
                                                {size}
                                                {price_adjustment > 0 && (
                                                    <span style={{ fontSize: '10px', color: '#26aa99', display: 'block', lineHeight: 1 }}>
                                                        +{(price_adjustment / 1000).toFixed(0)}k
                                                    </span>
                                                )}
                                                {size_note && (
                                                    <span style={{ fontSize: '10px', color: '#999', display: 'block', lineHeight: 1 }}>
                                                        {size_note}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedSize && (
                                        <div style={{ fontSize: '12px', color: '#767676', marginTop: '4px' }}>
                                            Đã chọn: <strong style={{ color: '#ee4d2d' }}>{selectedSize}</strong>
                                            {' · '}Còn lại: <strong>{uniqueSizes.find(s => s.size === selectedSize)?.stock || 0}</strong> sản phẩm
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tồn kho variant */}
                            {selectedVariant && (
                                <p style={{ fontSize: '13px', color: '#767676', margin: '4px 0' }}>
                                    Còn lại: <strong>{selectedVariant.stock_quantity}</strong> sản phẩm
                                </p>
                            )}

                            {/* Chính sách */}
                            <div style={{ margin: '12px 0', fontSize: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {dataProducts?.return_days > 0 && (
                                    <span>🔄 Trả hàng miễn phí trong <strong>{dataProducts.return_days} ngày</strong></span>
                                )}
                                {dataProducts?.has_fashion_insurance && (
                                    <span>🛡️ Có bảo hiểm thời trang</span>
                                )}
                            </div>

                            {/* Nút hành động */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
                                <button
                                    onClick={handleAddProduct}
                                    style={{
                                        padding: '10px 24px', background: '#fff', border: '1px solid #ee4d2d',
                                        color: '#ee4d2d', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                                    }}
                                >
                                    🛒 Thêm vào giỏ hàng
                                </button>
                                <button
                                    onClick={handleToggleLike}
                                    style={{
                                        padding: '10px 16px', border: '1px solid #ddd', borderRadius: '4px',
                                        cursor: 'pointer', fontSize: '18px', background: liked ? '#fff0f0' : '#fff',
                                    }}
                                >
                                    {liked ? '❤️' : '🤍'}
                                </button>
                            </div>
                        </div>
                    </header>
                </div>

                {/* Mô tả */}
                <div className={cx('main-detail-product')}>
                    <div className={cx('header-des')}>
                        <button id={cx('nav-one btn-active')}>Mô tả sản phẩm</button>
                    </div>
                    <div className={cx('text-des')}>
                        <p>{dataProducts?.des}</p>
                    </div>

                    {/* Đánh giá */}
                    <div style={{ margin: '20px 0' }}>
                        <h5 style={{ borderBottom: '2px solid #ee4d2d', paddingBottom: '8px', display: 'inline-block' }}>
                            Đánh giá sản phẩm
                        </h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0', padding: '16px', background: '#fff9f9', borderRadius: '8px' }}>
                            <span style={{ fontSize: '36px', color: '#ee4d2d', fontWeight: 700 }}>{dataProducts?.rating_avg || 0}</span>
                            <div>
                                <StarDisplay value={dataProducts?.rating_avg || 0} size={20} />
                                <div style={{ fontSize: '13px', color: '#767676', marginTop: '4px' }}>{dataProducts?.rating_count || 0} đánh giá</div>
                            </div>
                        </div>
                    </div>

                    {/* Chọn sao để đánh giá */}
                    <div className={cx('start')} style={{ display: 'flex', gap: '4px', margin: '8px 0' }}>
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index}>
                                    <input style={{ display: 'none' }} type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} />
                                    <svg
                                        className="star" width="24" height="24" viewBox="0 0 24 24"
                                        fill={ratingValue <= (hover || rating) ? 'gold' : 'none'}
                                        stroke={ratingValue <= (hover || rating) ? 'gold' : 'grey'}
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </label>
                            );
                        })}
                        {rating > 0 && <span style={{ fontSize: '13px', color: '#767676', alignSelf: 'center', marginLeft: '6px' }}>{['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc'][rating]}</span>}
                    </div>

                    {/* Input bình luận */}
                    <div className={cx('input-comment')}>
                        <img
                            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
                            alt=""
                        />
                        <input
                            placeholder="Viết bình luận... (Enter để gửi)"
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={handlePostComments}
                            value={comment}
                        />
                    </div>

                    {/* Danh sách bình luận */}
                    <div className={cx('comments-user')}>
                        {dataComments.map((item) => (
                            <div className={cx('form-comment')} key={item._id}>
                                <img
                                    src={
                                        item.user_id?.avatar && item.user_id.avatar !== '1'
                                            ? `http://localhost:5000/avatars/${item.user_id.avatar}`
                                            : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop'
                                    }
                                    alt=""
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>{item.user_id?.fullname || 'Ẩn danh'}</span>
                                    <span style={{ fontSize: '12px', color: 'gray', marginLeft: '10px' }}>
                                        {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                                    </span>
                                    {item.rating && (
                                        <div style={{ margin: '2px 0' }}>
                                            <StarDisplay value={item.rating} size={14} />
                                        </div>
                                    )}
                                    <p style={{ marginTop: '4px' }}>{item.comments}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default ProductDetail;
