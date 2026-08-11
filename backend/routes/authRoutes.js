const express = require("express");

const router = express.Router();

// ==========================================
// CONTROLLERS
// ==========================================

const {
    login,
    createStaff,
    getStaff,
    toggleStaffStatus
} = require("../controllers/authController");

// ==========================================
// MIDDLEWARE
// ==========================================

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const {
    authLimiter
} = require("../middleware/securityMiddleware");

// ==========================================
// ADMIN LOGIN
// ==========================================

router.post(
    "/login",
    authLimiter,
    login
);

// ==========================================
// CREATE STAFF
// ADMIN ONLY
// ==========================================

router.post(
    "/staff",
    protect,
    authorize("admin"),
    createStaff
);

// ==========================================
// GET ALL STAFF
// ADMIN ONLY
// ==========================================

router.get(
    "/staff",
    protect,
    authorize("admin"),
    getStaff
);

// ==========================================
// ENABLE / DISABLE STAFF
// ADMIN ONLY
// ==========================================

router.patch(
    "/staff/:id/status",
    protect,
    authorize("admin"),
    toggleStaffStatus
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;