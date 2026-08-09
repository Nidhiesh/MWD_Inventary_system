const express = require("express");

const router = express.Router();

const {
    login,
    createStaff,
    getStaff,
    toggleStaffStatus
} = require("../controllers/authController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");


// LOGIN
router.post(
    "/login",
    login
);


// ADMIN → CREATE STAFF
router.post(
    "/staff",
    protect,
    authorize("admin"),
    createStaff
);


// ADMIN → GET STAFF
router.get(
    "/staff",
    protect,
    authorize("admin"),
    getStaff
);


// ADMIN → ENABLE/DISABLE STAFF
router.patch(
    "/staff/:id/status",
    protect,
    authorize("admin"),
    toggleStaffStatus
);


module.exports = router;