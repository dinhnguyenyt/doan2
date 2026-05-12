const ModelBlog = require('../../model/ModelBlog');
const { jwtDecode } = require('jwt-decode');
const createAuditLog = require('../../utils/auditLog');

class ControllerWeb {
    async GetBlog(req, res) {
        ModelBlog.find({}).then((dataBlog) => res.status(200).json(dataBlog));
    }

    async AddBlog(req, res) {
        const { img, title, des } = req.body;
        const decoded = jwtDecode(req.cookies.Token);

        try {
            const lastBlog = await ModelBlog.findOne({}).sort({ id: 'desc' });
            const newBlog = new ModelBlog({
                id: lastBlog ? lastBlog.id + 1 : 1,
                img,
                title,
                des,
                created_by: decoded.email,
                created_at: new Date(),
            });
            await newBlog.save();

            createAuditLog(req, {
                action_code: 'BLOG_CREATE',
                target_id: newBlog._id,
                target_label: `Blog: ${title}`,
                data_before: null,
                data_after: newBlog,
            });

            return res.status(200).json({ message: 'Thêm Bài Viết Thành Công !!!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async DeleteBlog(req, res) {
        try {
            const blog = await ModelBlog.findOne({ id: req.body.id });
            if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

            await ModelBlog.deleteOne({ id: req.body.id });

            createAuditLog(req, {
                action_code: 'BLOG_DELETE',
                target_id: blog._id,
                target_label: `Blog: ${blog.title}`,
                data_before: blog,
                data_after: null,
            });

            return res.status(200).json({ message: 'Xóa Thành Công !!!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = new ControllerWeb();
