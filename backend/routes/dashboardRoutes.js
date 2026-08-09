const express = require("express");

const {
    getDashboardSummary
} = require("../controllers/dashboardController");

const router = express.Router();


// DASHBOARD SUMMARY
router.get(
    "/",
    getDashboardSummary
);


module.exports = router;