const express = require("express");

const { protect } = require("../middleware/authMiddleware");

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
// ==========================================

router.get(
    "/sales-trend",
    protect,
    getSalesTrend
);


// ==========================================
// TOP PRODUCTS
// ==========================================

router.get(
    "/top-products",
    protect,
    getTopSellingProducts
);


// ==========================================
// CATEGORY STOCK
// ==========================================

router.get(
    "/category-stock",
    protect,
    getCategoryStock
);


// ==========================================
// PROFIT
// ==========================================

router.get(
    "/profit",
    protect,
    getProfitAnalytics
);


// ==========================================
// STOCK MOVEMENT
// ==========================================

router.get(
    "/stock-movement",
    protect,
    getStockMovement
);


module.exports = router;