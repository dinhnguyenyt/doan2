const express = require('express');
const router = express.Router();

const ControllerAdmin = require('../controller/ControllerAdmin/ControllerAdmin');

const ControllerCategory = require('../controller/ControllerCategory/ControllerCategory');

router.get('/api/auth/me', ControllerAdmin.GetDataAuth);

// Categories
router.get('/api/categories', ControllerCategory.GetCategories);
router.post('/api/addcategory', ControllerCategory.AddCategory);
router.post('/api/editcategory', ControllerCategory.EditCategory);
router.post('/api/deletecategory', ControllerCategory.DeleteCategory);

// Coupons
const ControllerCoupon = require('../controller/ControllerCoupon/ControllerCoupon');
router.get('/api/coupons', ControllerCoupon.GetCoupons);
router.post('/api/addcoupon', ControllerCoupon.AddCoupon);
router.post('/api/editcoupon', ControllerCoupon.EditCoupon);
router.post('/api/deletecoupon', ControllerCoupon.DeleteCoupon);

router.get('/api/getorder', ControllerAdmin.GetDataOrder);
router.get('/api/datauser', ControllerAdmin.GetUser);
router.post('/api/updaterole', ControllerAdmin.UpdateUserRole);
router.post('/api/edituser', ControllerAdmin.EditUser);
router.post('/api/deleteuser', ControllerAdmin.DeleteUser);
router.post('/api/addproduct', ControllerAdmin.AddProduct);
router.post('/api/deleteproduct', ControllerAdmin.DeleteProduct);
router.post('/api/editproduct', ControllerAdmin.EditProduct);
router.post('/api/checkproduct', ControllerAdmin.checkProduct);
router.post('/api/editorder', ControllerAdmin.EditOrder);
router.post('/api/deletecomment', ControllerAdmin.DeleteComment);

// Details API
router.get('/api/category/:id', ControllerAdmin.GetCategoryById);
router.get('/api/product/:id', ControllerAdmin.GetProductById);
router.get('/api/order/:id', ControllerAdmin.GetOrderById);
router.get('/api/coupon/:id', ControllerAdmin.GetCouponById);
router.get('/api/blog/:id', ControllerAdmin.GetBlogById);
router.get('/api/customer/:id', ControllerAdmin.GetCustomerById);

module.exports = router;
