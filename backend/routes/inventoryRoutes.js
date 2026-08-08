const express = require("express");

const {
    getTransactions,
    getProductTransactions
} = require("../controllers/inventoryController");

const router = express.Router();


// ALL TRANSACTIONS
router.get(
    "/transactions",
    getTransactions
);


// PRODUCT HISTORY
router.get(
    "/transactions/product/:id",
    getProductTransactions
);


module.exports = router;