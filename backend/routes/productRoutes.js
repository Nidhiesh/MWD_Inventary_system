const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

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
    authorize("ADMIN"),
    createProduct
);


// ==========================================
// GET ALL PRODUCTS
// ADMIN + STAFF
// ==========================================
router.get(
    "/",
    protect,
    getProducts
);


// ==========================================
// GET PRODUCT BY ID
// ADMIN + STAFF
// ==========================================
router.get(
    "/:id",
    protect,
    getProductById
);


// ==========================================
// UPDATE PRODUCT
// ADMIN ONLY
// ==========================================
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updateProduct
);


// ==========================================
// DELETE PRODUCT
// ADMIN ONLY
// ==========================================
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteProduct
);


module.exports = router;