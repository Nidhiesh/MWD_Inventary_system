const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
    getInventoryTransactions,
    getProductTransactions
} = require("../controllers/inventoryController");

const router = express.Router();


// GET ALL INVENTORY TRANSACTIONS
router.get(
    "/",
    protect,
    getInventoryTransactions
);


// GET PRODUCT TRANSACTION HISTORY
router.get(
    "/product/:productId",
    protect,
    getProductTransactions
);


module.exports = router;