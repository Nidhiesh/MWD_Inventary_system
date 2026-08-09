const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    createSale,
    getSales,
    getSaleById
} = require("../controllers/saleController");

const router = express.Router();


// ==========================================
// CREATE SALE
// ADMIN + STAFF
// ==========================================
router.post(
    "/",
    protect,
    authorize("ADMIN", "STAFF"),
    createSale
);


// ==========================================
// GET ALL SALES
// ADMIN + STAFF
// ==========================================
router.get(
    "/",
    protect,
    getSales
);


// ==========================================
// GET SALE BY ID
// ADMIN + STAFF
// ==========================================
router.get(
    "/:id",
    protect,
    getSaleById
);


module.exports = router;