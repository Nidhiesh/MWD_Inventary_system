const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
    getDashboardSummary
} = require("../controllers/dashboardController");

const router = express.Router();


// ==========================================
// DASHBOARD SUMMARY
// ==========================================
router.get(
    "/",
    protect,
    getDashboardSummary
);


module.exports = router;