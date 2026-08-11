const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getSalesTrend,
    getTopSellingProducts,
    getCategoryStock,
    getProfitAnalytics,
    getStockMovement
} = require("../controllers/analyticsController");

const router = express.Router();


// ==========================================
// SALES TREND
// ADMIN + STAFF
// ==========================================

router.get(
    "/sales-trend",
    protect,
    authorize("admin", "staff"),
    getSalesTrend
);


// ==========================================
// TOP PRODUCTS
// ADMIN + STAFF
// ==========================================

router.get(
    "/top-products",
    protect,
    authorize("admin", "staff"),
    getTopSellingProducts
);


// ==========================================
// CATEGORY STOCK
// ADMIN + STAFF
// ==========================================

router.get(
    "/category-stock",
    protect,
    authorize("admin", "staff"),
    getCategoryStock
);


// ==========================================
// PROFIT
// ADMIN + STAFF
// ==========================================

router.get(
    "/profit",
    protect,
    authorize("admin", "staff"),
    getProfitAnalytics
);


// ==========================================
// STOCK MOVEMENT
// ADMIN + STAFF
// ==========================================

router.get(
    "/stock-movement",
    protect,
    authorize("admin", "staff"),
    getStockMovement
);


module.exports = router;