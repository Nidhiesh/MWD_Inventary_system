const express = require("express");

const router = express.Router();


// ==========================================
// CONTROLLER
// ==========================================

const {
    login
} = require("../controllers/authController");


// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

const {
    authLimiter
} = require("../middleware/securityMiddleware");


// ==========================================
// LOGIN
// ==========================================

router.post(
    "/login",
    authLimiter,
    login
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;