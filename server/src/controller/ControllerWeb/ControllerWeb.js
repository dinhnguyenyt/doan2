const ModelBlog = require('../../model/ModelBlog');
const { jwtDecode } = require('jwt-decode');

class ControllerWeb {
    async GetBlog(req, res) {
        ModelBlog.find({}).then((dataBlog) => res.status(200).json(dataBlog));
    }
    async AddBlog(req, res) {
        const { img, title, des } = req.body;
        const decoded = jwtDecode(req.cookies.Token);

        ModelBlog.findOne({})
            .sort({ id: 'desc' })
            .then(async (dataProduct) => {
                let newProductId = 1;
                if (dataProduct) {
                    newProductId = dataProduct.id + 1;
                }
                const newBlog = ModelBlog({
                    id: newProductId,
                    img,
                    title,
                    des,
                    created_by: decoded.email,
                    created_at: new Date(),
                });
                await newBlog.save();
                return res.status(200).json({ message: 'Thêm Bài Viết Thành Công !!!' });
            });
    }
    async DeleteBlog(req, res) {
        ModelBlog.deleteOne({ id: req.body.id }).then((data) =>
            res.status(200).json({ message: 'Xóa Thành Công !!!' }),
        );
    }
}

module.exports = new ControllerWeb();
