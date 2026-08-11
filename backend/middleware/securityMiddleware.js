const rateLimit = require("express-rate-limit");

// ==========================================
// GENERAL API RATE LIMIT
// ==========================================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});


// ==========================================
// LOGIN RATE LIMIT
// ==========================================

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    apiLimiter,
    authLimiter
};