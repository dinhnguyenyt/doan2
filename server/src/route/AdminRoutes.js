const express = require('express');
const router = express.Router();

const ControllerAdmin = require('../controller/ControllerAdmin/ControllerAdmin');
const ControllerCategory = require('../controller/ControllerCategory/ControllerCategory');
const ControllerVariant = require('../controller/ControllerVariant/ControllerVariant');
const { verifyRole, verifyToken } = require('../controller/jwt/ControllerJWT');
const ControllerRole = require('../controller/ControllerRole/ControllerRole');

const ALL_STAFF = ['admin', 'manager', 'staff'];
const ADMIN_MANAGER = ['admin', 'manager'];
const ADMIN_ONLY = ['admin'];

router.get('/api/auth/me', verifyRole(ALL_STAFF), ControllerAdmin.GetDataAuth);

// Categories
router.get('/api/categories', verifyRole(ALL_STAFF), ControllerCategory.GetCategories);
router.post('/api/addcategory', verifyRole(ADMIN_MANAGER), ControllerCategory.AddCategory);
router.post('/api/editcategory', verifyRole(ADMIN_MANAGER), ControllerCategory.EditCategory);
router.post('/api/deletecategory', verifyRole(ADMIN_ONLY), ControllerCategory.DeleteCategory);

// Coupons
const ControllerCoupon = require('../controller/ControllerCoupon/ControllerCoupon');
router.get('/api/coupons', verifyRole(ADMIN_MANAGER), ControllerCoupon.GetCoupons);
router.post('/api/addcoupon', verifyRole(ADMIN_MANAGER), ControllerCoupon.AddCoupon);
router.post('/api/editcoupon', verifyRole(ADMIN_MANAGER), ControllerCoupon.EditCoupon);
router.post('/api/deletecoupon', verifyRole(ADMIN_ONLY), ControllerCoupon.DeleteCoupon);

// Orders
router.get('/api/getorder', verifyRole(ALL_STAFF), ControllerAdmin.GetDataOrder);
router.post('/api/editorder', verifyRole(ALL_STAFF), ControllerAdmin.EditOrder);

// Users / Customers
router.get('/api/datauser', verifyRole(ADMIN_MANAGER), ControllerAdmin.GetUser);
router.post('/api/updaterole', verifyRole(ADMIN_ONLY), ControllerAdmin.UpdateUserRole);
router.post('/api/edituser', verifyRole(ADMIN_ONLY), ControllerAdmin.EditUser);
router.post('/api/deleteuser', verifyRole(ADMIN_ONLY), ControllerAdmin.DeleteUser);

// Products
router.post('/api/addproduct', verifyRole(ADMIN_MANAGER), ControllerAdmin.AddProduct);
router.post('/api/editproduct', verifyRole(ADMIN_MANAGER), ControllerAdmin.EditProduct);
router.post('/api/deleteproduct', verifyRole(ADMIN_ONLY), ControllerAdmin.DeleteProduct);
router.post('/api/checkproduct', verifyRole(ALL_STAFF), ControllerAdmin.checkProduct);

// Comments
router.post('/api/deletecomment', verifyRole(ALL_STAFF), ControllerAdmin.DeleteComment);

// Detail APIs
router.get('/api/category/:id', verifyRole(ALL_STAFF), ControllerAdmin.GetCategoryById);
router.get('/api/product/:id', verifyRole(ALL_STAFF), ControllerAdmin.GetProductById);
router.get('/api/order/:id', verifyRole(ALL_STAFF), ControllerAdmin.GetOrderById);
router.get('/api/coupon/:id', verifyRole(ADMIN_MANAGER), ControllerAdmin.GetCouponById);
router.get('/api/blog/:id', verifyRole(ALL_STAFF), ControllerAdmin.GetBlogById);
router.get('/api/customer/:id', verifyRole(ADMIN_MANAGER), ControllerAdmin.GetCustomerById);

// Roles & Permissions
router.get('/api/my-permissions', verifyToken, ControllerRole.GetMyPermissions);
router.get('/api/roles', verifyRole(ALL_STAFF), ControllerRole.GetRoles);
router.get('/api/roles/metadata', verifyRole(ADMIN_ONLY), ControllerRole.GetMetadata);
router.post('/api/addrole', verifyRole(ADMIN_ONLY), ControllerRole.AddRole);
router.post('/api/editrole', verifyRole(ADMIN_ONLY), ControllerRole.EditRole);
router.post('/api/deleterole', verifyRole(ADMIN_ONLY), ControllerRole.DeleteRole);

// Variants
router.get('/api/variants/:product_id', verifyRole(ALL_STAFF), ControllerVariant.GetVariants);
router.post('/api/addvariant', verifyRole(ADMIN_MANAGER), ControllerVariant.AddVariant);
router.post('/api/editvariant', verifyRole(ADMIN_MANAGER), ControllerVariant.EditVariant);
router.post('/api/deletevariant', verifyRole(ADMIN_ONLY), ControllerVariant.DeleteVariant);

module.exports = router;
