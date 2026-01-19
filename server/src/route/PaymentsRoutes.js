const express = require('express');
const router = express.Router();

const payment = require('../controller/payments/Payments');

router.post('/api/paymentmomo', payment.PaymentsMomo);
router.get('/vnpay-return', payment.checkData);
router.get('/api/successPayment', payment.GetProductsSuccess);
router.post('/api/payment', payment.Payments);
module.exports = router;
