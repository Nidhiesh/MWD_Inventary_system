const express = require("express");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const router = express.Router();


// CREATE
router.post("/", createCategory);


// GET ALL
router.get("/", getCategories);


// GET ONE
router.get("/:id", getCategoryById);


// UPDATE
router.put("/:id", updateCategory);


// DELETE
router.delete("/:id", deleteCategory);


module.exports = router;