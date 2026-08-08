const express = require("express");

const {
    createSale,
    getSales,
    getSaleById
} = require("../controllers/saleController");

const router = express.Router();


// CREATE SALE
router.post("/", createSale);


// GET ALL SALES
router.get("/", getSales);


// GET SALE BY ID
router.get("/:id", getSaleById);


module.exports = router;