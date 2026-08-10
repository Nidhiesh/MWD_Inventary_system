const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    authorize
} = require("../middleware/roleMiddleware");

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
    authorize("admin"),
    createCategory
);


// ==========================================
// GET ALL CATEGORIES
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    protect,
    authorize("admin", "staff"),
    getCategories
);


// ==========================================
// GET CATEGORY BY ID
// ADMIN + STAFF
// ==========================================

router.get(
    "/:id",
    protect,
    authorize("admin", "staff"),
    getCategoryById
);


// ==========================================
// UPDATE CATEGORY
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateCategory
);


// ==========================================
// DELETE CATEGORY
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteCategory
);


module.exports = router;