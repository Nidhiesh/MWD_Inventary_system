const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getInventoryTransactions,
    getProductTransactions
} = require("../controllers/inventoryController");

const router = express.Router();


// ==========================================
// GET ALL INVENTORY TRANSACTIONS
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    protect,
    authorize("admin", "staff"),
    getInventoryTransactions
);


// ==========================================
// GET PRODUCT TRANSACTION HISTORY
// ADMIN + STAFF
// ==========================================

router.get(
    "/product/:productId",
    protect,
    authorize("admin", "staff"),
    getProductTransactions
);


module.exports = router;