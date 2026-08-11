const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    authorize
} = require("../middleware/roleMiddleware");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const router = express.Router();


// ==========================================
// CREATE PRODUCT
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    protect,
    authorize("admin"),
    createProduct
);


// ==========================================
// GET ALL PRODUCTS
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    protect,
    authorize("admin", "staff"),
    getProducts
);


// ==========================================
// GET PRODUCT BY ID
// ADMIN + STAFF
// ==========================================

router.get(
    "/:id",
    protect,
    authorize("admin", "staff"),
    getProductById
);


// ==========================================
// UPDATE PRODUCT
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateProduct
);


// ==========================================
// DELETE PRODUCT
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteProduct
);


module.exports = router;