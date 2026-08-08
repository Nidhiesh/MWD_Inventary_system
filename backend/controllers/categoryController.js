const Category = require("../models/Category");

// ==========================================
// CREATE CATEGORY
// POST /api/categories
// ==========================================
const createCategory = async (req, res) => {
    try {

        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET ALL CATEGORIES
// GET /api/categories
// ==========================================
const getCategories = async (req, res) => {
    try {

        const categories = await Category.find()
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET CATEGORY BY ID
// GET /api/categories/:id
// ==========================================
const getCategoryById = async (req, res) => {
    try {

        const category = await Category.findById(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// UPDATE CATEGORY
// PUT /api/categories/:id
// ==========================================
const updateCategory = async (req, res) => {
    try {

        const category =
            await Category.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// ==========================================
const deleteCategory = async (req, res) => {
    try {

        const category =
            await Category.findByIdAndDelete(
                req.params.id
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};