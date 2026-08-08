const express = require("express");

const {
    getLowStockProducts,
    getOutOfStockProducts
} = require("../controllers/alertController");

const router = express.Router();


// LOW STOCK
router.get(
    "/low-stock",
    getLowStockProducts
);


// OUT OF STOCK
router.get(
    "/out-of-stock",
    getOutOfStockProducts
);


module.exports = router;