const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
    getSalesReport,
    getPurchaseReport,
    getInventoryReport
} = require("../controllers/reportController");


const router = express.Router();


// ==========================================
// SALES REPORT
// ==========================================

router.get(
    "/sales",
    protect,
    getSalesReport
);


// ==========================================
// PURCHASE REPORT
// ==========================================

router.get(
    "/purchases",
    protect,
    getPurchaseReport
);


// ==========================================
// INVENTORY REPORT
// ==========================================

router.get(
    "/inventory",
    protect,
    getInventoryReport
);


module.exports = router;