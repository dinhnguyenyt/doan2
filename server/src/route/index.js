const UserRoute = require('./UserRoutes');
const ProductsRoutes = require('./ProductsRoutes');
const Payments = require('./PaymentsRoutes');
const AdminRoutes = require('./AdminRoutes');
const WebRoutes = require('./WebRoutes');
const ControllerCategory = require('../controller/ControllerCategory/ControllerCategory');
const ControllerVariant = require('../controller/ControllerVariant/ControllerVariant');

function route(app) {
    // User
    app.post('/api/register', UserRoute);
    app.post('/api/login', UserRoute);
    app.get('/api/auth', UserRoute);
    app.post('/api/changepass', UserRoute);
    app.get('/api/logout', UserRoute);
    app.post('/api/editprofile', UserRoute);
    app.post('/api/sendmessage', UserRoute);
    app.post('/api/avatar', UserRoute);
    app.get('/api/comment', UserRoute);
    app.post('/api/postcomment', UserRoute);
    app.get('/api/dataorder', UserRoute);

    // Wishlist
    app.post('/api/wishlist/toggle', UserRoute);
    app.get('/api/wishlist/check', UserRoute);

    // Address
    app.get('/api/address', UserRoute);
    app.post('/api/address', UserRoute);

    // Products
    app.get('/api/products', ProductsRoutes);
    app.get('/api/getproduct', ProductsRoutes);
    app.post('/api/cart', ProductsRoutes);
    app.get('/api/getcart', ProductsRoutes);
    app.get('/api/search', ProductsRoutes);
    app.post('/api/clearcart', ProductsRoutes);

    // Categories - GET là public, write operations mới cần auth
    app.get('/api/categories', ControllerCategory.GetCategories);
    app.post('/api/addcategory', AdminRoutes);
    app.post('/api/editcategory', AdminRoutes);
    app.post('/api/deletecategory', AdminRoutes);

    // Admin - Coupons
    app.get('/api/coupons', AdminRoutes);
    app.post('/api/addcoupon', AdminRoutes);
    app.post('/api/editcoupon', AdminRoutes);
    app.post('/api/deletecoupon', AdminRoutes);

    // Admin - Orders / Users / Products
    app.get('/api/getorder', AdminRoutes);
    app.get('/api/datauser', AdminRoutes);
    app.post('/api/addproduct', AdminRoutes);
    app.post('/api/deleteproduct', AdminRoutes);
    app.post('/api/editproduct', AdminRoutes);
    app.get('/api/auth/me', AdminRoutes);
    app.post('/api/checkproduct', AdminRoutes);
    app.post('/api/editorder', AdminRoutes);
    app.post('/api/createuser', AdminRoutes);
    app.post('/api/updaterole', AdminRoutes);
    app.post('/api/edituser', AdminRoutes);
    app.post('/api/deleteuser', AdminRoutes);
    app.post('/api/deletecomment', AdminRoutes);

    // Variants - GET là public, write operations mới cần auth
    app.get('/api/variants/:product_id', ControllerVariant.GetVariants);
    app.post('/api/addvariant', AdminRoutes);
    app.post('/api/editvariant', AdminRoutes);
    app.post('/api/deletevariant', AdminRoutes);
    app.post('/api/addvariantsize', AdminRoutes);
    app.post('/api/deletevariantsize', AdminRoutes);

    // Admin - Roles & Permissions
    app.get('/api/my-permissions', AdminRoutes);
    app.get('/api/roles', AdminRoutes);
    app.get('/api/roles/metadata', AdminRoutes);
    app.post('/api/addrole', AdminRoutes);
    app.post('/api/editrole', AdminRoutes);
    app.post('/api/deleterole', AdminRoutes);

    // Admin - Detail APIs
    app.get('/api/category/:id', AdminRoutes);
    app.get('/api/product/:id', AdminRoutes);
    app.get('/api/order/:id', AdminRoutes);
    app.get('/api/coupon/:id', AdminRoutes);
    app.get('/api/blog/:id', AdminRoutes);
    app.get('/api/customer/:id', AdminRoutes);

    // Coupon check
    const ControllerCoupon = require('../controller/ControllerCoupon/ControllerCoupon');
    app.post('/api/check-coupon', ControllerCoupon.CheckCoupon);

    // Audit Logs
    app.get('/api/audit-logs', AdminRoutes);
    app.get('/api/audit-logs/actions', AdminRoutes);
    app.get('/api/audit-logs/target/:type/:id', AdminRoutes);
    app.get('/api/audit-logs/:id', AdminRoutes);

    // Payments
    app.post('/api/paymentmomo', Payments);
    app.get('/api/checkdata', Payments);
    app.get('/api/successPayment', Payments);
    app.post('/api/payment', Payments);
    app.get('/vnpay-return', Payments);

    // Blog
    app.get('/api/getblog', WebRoutes);
    app.post('/api/addblog', WebRoutes);
    app.post('/api/deleteblog', WebRoutes);
}

module.exports = route;
