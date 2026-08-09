const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const router = express.Router();


// ==========================================
// CREATE CATEGORY
// ADMIN ONLY
// ==========================================
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createCategory
);


// ==========================================
// GET ALL CATEGORIES
// ADMIN + STAFF
// ==========================================
router.get(
    "/",
    protect,
    getCategories
);


// ==========================================
// GET CATEGORY BY ID
// ADMIN + STAFF
// ==========================================
router.get(
    "/:id",
    protect,
    getCategoryById
);


// ==========================================
// UPDATE CATEGORY
// ADMIN ONLY
// ==========================================
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updateCategory
);


// ==========================================
// DELETE CATEGORY
// ADMIN ONLY
// ==========================================
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteCategory
);


module.exports = router;