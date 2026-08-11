const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getSalesReport,
    getPurchaseReport,
    getInventoryReport
} = require("../controllers/reportController");

const router = express.Router();


// ==========================================
// SALES REPORT
// ADMIN + STAFF
// ==========================================

router.get(
    "/sales",
    protect,
    authorize("admin", "staff"),
    getSalesReport
);


// ==========================================
// PURCHASE REPORT
// ADMIN + STAFF
// ==========================================

router.get(
    "/purchases",
    protect,
    authorize("admin", "staff"),
    getPurchaseReport
);


// ==========================================
// INVENTORY REPORT
// ADMIN + STAFF
// ==========================================

router.get(
    "/inventory",
    protect,
    authorize("admin", "staff"),
    getInventoryReport
);


module.exports = router;