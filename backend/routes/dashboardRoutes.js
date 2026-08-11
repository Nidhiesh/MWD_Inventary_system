const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getDashboardSummary
} = require("../controllers/dashboardController");

const router = express.Router();


// ==========================================
// DASHBOARD SUMMARY
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    protect,
    authorize("admin", "staff"),
    getDashboardSummary
);


module.exports = router;