const ModelCategory = require('../../model/ModelCategory');
const { jwtDecode } = require('jwt-decode');

class ControllerCategory {
    async GetCategories(req, res) {
        try {
            const data = await ModelCategory.find({});
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async AddCategory(req, res) {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên danh mục không được để trống' });

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const newCategory = new ModelCategory({
                name,
                description,
                created_by: decoded.email,
                created_at: new Date(),
            });
            await newCategory.save();
            res.status(201).json({ message: 'Thêm danh mục thành công', data: newCategory });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async EditCategory(req, res) {
        const { id, name, description } = req.body;
        if (!id || !name) return res.status(400).json({ message: 'ID và Tên danh mục không được để trống' });

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const updatedCategory = await ModelCategory.findByIdAndUpdate(
                id,
                { name, description, modified_by: decoded.email, modified_at: new Date() },
                { new: true }
            );
            if (updatedCategory) {
                res.status(200).json({ message: 'Cập nhật danh mục thành công', data: updatedCategory });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async DeleteCategory(req, res) {
        try {
            const deleted = await ModelCategory.findByIdAndDelete(req.body.id);
            if (deleted) {
                res.status(200).json({ message: 'Xóa danh mục thành công' });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports = new ControllerCategory();
