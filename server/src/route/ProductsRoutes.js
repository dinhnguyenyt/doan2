const express = require('express');
const router = express.Router();
const ControllerProducts = require('../controller/ControllerProducts/ControllerProducts');

router.get('/api/products', ControllerProducts.GetProducts);
router.get('/api/getproduct', ControllerProducts.GetOneProduct);
router.post('/api/cart', ControllerProducts.PostCart);
router.get('/api/getcart', ControllerProducts.GetCart);
router.get('/api/search', ControllerProducts.SearchProduct);
router.post('/api/clearcart', ControllerProducts.ClearCart);

module.exports = router;
