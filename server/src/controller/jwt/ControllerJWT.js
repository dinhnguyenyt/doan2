const jwt = require('jsonwebtoken');

const middlewareController = {
    verifyToken: (req, res, next) => {
        const token = req.headers.token || req.cookies?.Token;
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
            if (req.user.admin || req.user.role === 'admin') {
                next();
            } else {
                res.status(403).json({ message: 'Bạn Không Có Quyền Thao Tác !!!' });
            }
        });
    },
    verifyRole: (allowedRoles) => {
        return async (req, res, next) => {
            middlewareController.verifyToken(req, res, async () => {
                const userRole = req.user.role || (req.user.admin ? 'admin' : 'user');
                if (allowedRoles.includes(userRole)) {
                    return next();
                }
                // Custom roles: check server_level in DB
                try {
                    const ModelRole = require('../../model/ModelRole');
                    const roleDoc = await ModelRole.findOne({ name: userRole });
                    if (roleDoc && allowedRoles.includes(roleDoc.server_level)) {
                        return next();
                    }
                } catch (_) {}
                res.status(403).json({ message: 'Tài khoản của bạn không có quyền truy cập khu vực này !!!' });
            });
        };
    },
};

module.exports = middlewareController;
