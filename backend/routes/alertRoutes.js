const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getLowStockProducts,
    getOutOfStockProducts
} = require("../controllers/alertController");

const router = express.Router();


// ==========================================
// GET LOW STOCK PRODUCTS
// ADMIN + STAFF
// ==========================================

router.get(
    "/low-stock",
    protect,
    authorize("admin", "staff"),
    getLowStockProducts
);


// ==========================================
// GET OUT OF STOCK PRODUCTS
// ADMIN + STAFF
// ==========================================

router.get(
    "/out-of-stock",
    protect,
    authorize("admin", "staff"),
    getOutOfStockProducts
);


module.exports = router;