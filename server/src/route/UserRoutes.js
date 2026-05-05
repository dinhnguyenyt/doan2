const express = require('express');
const router = express.Router();
const ControllerUser = require('../controller/ControllerUser/ControllerUser');
const ControllerWishlist = require('../controller/ControllerWishlist/ControllerWishlist');
var multer = require('multer');
const path = require('path');
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/avatars');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}${ext}`);
        },
    }),
});

// User
router.post('/api/register', ControllerUser.Register);
router.post('/api/login', ControllerUser.Login);
router.get('/api/auth', ControllerUser.GetUser);
router.post('/api/changepass', ControllerUser.ChangePass);
router.get('/api/logout', ControllerUser.Logout);
router.post('/api/editprofile', ControllerUser.EditProfile);
router.post('/api/sendmessage', ControllerUser.SendMessage);
router.post('/api/avatar', upload.single('avatar'), ControllerUser.ChangeAvatar);
router.get('/api/comment', ControllerUser.GetCommentProduct);
router.post('/api/postcomment', ControllerUser.PostComments);
router.get('/api/dataorder', ControllerUser.GetOrder);
router.post('/api/wishlist/toggle', ControllerWishlist.Toggle);
router.get('/api/wishlist/check', ControllerWishlist.CheckLiked);

module.exports = router;
