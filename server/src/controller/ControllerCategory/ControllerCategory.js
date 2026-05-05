const ModelCategory = require('../../model/ModelCategory');
const { jwtDecode } = require('jwt-decode');

// Lấy tất cả ID con cháu (hỗ trợ nhiều cha - DAG)
function getAllDescendantIds(catId, allCats, visited = new Set()) {
    if (visited.has(String(catId))) return [];
    visited.add(String(catId));
    const children = allCats.filter((c) =>
        (c.parent_ids || []).some((p) => String(p) === String(catId)),
    );
    const ids = [];
    for (const child of children) {
        ids.push(String(child._id));
        ids.push(...getAllDescendantIds(String(child._id), allCats, new Set(visited)));
    }
    return ids;
}

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
        const { name, description, parent_ids } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên danh mục không được để trống' });

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const newCategory = new ModelCategory({
                name,
                description,
                parent_ids: Array.isArray(parent_ids) ? parent_ids : [],
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
        const { id, name, description, parent_ids } = req.body;
        if (!id || !name) return res.status(400).json({ message: 'ID và Tên danh mục không được để trống' });

        const decoded = jwtDecode(req.cookies.Token);
        try {
            const updatedCategory = await ModelCategory.findByIdAndUpdate(
                id,
                {
                    name,
                    description,
                    parent_ids: Array.isArray(parent_ids) ? parent_ids : [],
                    modified_by: decoded.email,
                    modified_at: new Date(),
                },
                { new: true },
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
module.exports.getAllDescendantIds = getAllDescendantIds;
