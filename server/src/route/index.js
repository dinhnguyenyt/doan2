const UserRoute = require('./UserRoutes');
const ProductsRoutes = require('./ProductsRoutes');
const Payments = require('./PaymentsRoutes');
const AdminRoutes = require('./AdminRoutes');
const WebRoutes = require('./WebRoutes');
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

    // Products
    app.get('/api/products', ProductsRoutes);
    app.get('/api/getproduct', ProductsRoutes);
    app.post('/api/cart', ProductsRoutes);
    app.get('/api/getcart', ProductsRoutes);
    app.get('/api/search', ProductsRoutes);

    // Admin
    app.get('/api/getorder', AdminRoutes);
    app.get('/api/datauser', AdminRoutes);
    app.post('/api/addproduct', AdminRoutes);
    app.post('/api/deleteproduct', AdminRoutes);
    app.post('/api/editproduct', AdminRoutes);
    app.get('/api/auth/me', AdminRoutes);
    app.post('/api/checkproduct', AdminRoutes);
    app.post('/api/editorder', AdminRoutes);
    app.post('/api/updaterole', AdminRoutes);
    app.post('/api/deleteuser', AdminRoutes);
    app.get('/api/categories', AdminRoutes);
    app.post('/api/addcategory', AdminRoutes);
    app.post('/api/deletecategory', AdminRoutes);
    
    app.get('/api/coupons', AdminRoutes);
    app.post('/api/addcoupon', AdminRoutes);
    app.post('/api/deletecoupon', AdminRoutes);
    
    const ControllerCoupon = require('../controller/ControllerCoupon/ControllerCoupon');
    app.post('/api/check-coupon', ControllerCoupon.CheckCoupon);
    app.post('/api/deletecomment', AdminRoutes);

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
