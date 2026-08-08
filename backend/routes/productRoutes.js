const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const router = express.Router();


// CREATE PRODUCT
router.post("/", createProduct);


// GET ALL PRODUCTS
router.get("/", getProducts);


// GET PRODUCT BY ID
router.get("/:id", getProductById);


// UPDATE PRODUCT
router.put("/:id", updateProduct);


// DELETE PRODUCT
router.delete("/:id", deleteProduct);


module.exports = router;