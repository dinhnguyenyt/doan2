const ModelCategory = require('../../model/ModelCategory');

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

        try {
            const newCategory = new ModelCategory({ name, description });
            await newCategory.save();
            res.status(201).json({ message: 'Thêm danh mục thành công', data: newCategory });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async EditCategory(req, res) {
        const { id, name, description } = req.body;
        if (!id || !name) return res.status(400).json({ message: 'ID và Tên danh mục không được để trống' });

        try {
            const updatedCategory = await ModelCategory.findByIdAndUpdate(id, { name, description }, { new: true });
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
