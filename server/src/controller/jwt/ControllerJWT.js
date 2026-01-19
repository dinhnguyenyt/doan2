const jwt = require('jsonwebtoken');

const middlewareController = {
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json('Bạn Cần Đăng Nhập Lại !!!');
                }
                req.user = user;
                next();
            });
        } else {
            res.status(401).json('Bạn Cần Đăng Nhập Lại !!!');
        }
    },
    verifyTokenAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.admin) {
                next();
            } else {
                res.status(403).json({ message: 'Bạn Không Có Quyền Thao Tác !!!' });
            }
        });
    },
};

module.exports = middlewareController;
