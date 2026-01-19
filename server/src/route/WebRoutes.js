const express = require('express');
const router = express.Router();
const ControllerWeb = require('../controller/ControllerWeb/ControllerWeb');

// User
router.get('/api/getblog', ControllerWeb.GetBlog);
router.post('/api/addblog', ControllerWeb.AddBlog);
router.post('/api/deleteblog', ControllerWeb.DeleteBlog);

module.exports = router;
