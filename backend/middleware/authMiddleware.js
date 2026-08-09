const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// PROTECT ROUTES
// ==========================================

const protect = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            typeof authHeader !== "string" ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }


        // ==========================================
        // EXTRACT TOKEN
        // ==========================================

        const token = authHeader
            .substring(7)
            .trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }


        // ==========================================
        // JWT SECRET
        // ==========================================

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is not configured"
            );

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error"
            });
        }


        // ==========================================
        // VERIFY JWT
        // ==========================================

        let decoded;

        try {

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        } catch (error) {

            if (error.name === "TokenExpiredError") {

                return res.status(401).json({
                    success: false,
                    message: "Session expired. Please login again."
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }


        // ==========================================
        // VALIDATE PAYLOAD
        // ==========================================

        if (
            !decoded ||
            !decoded.id
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }


        // ==========================================
        // FIND USER
        // ==========================================

        const user = await User.findById(
            decoded.id
        ).select("-password");


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }


        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message: "Account is disabled"
            });
        }


        // ==========================================
        // ATTACH USER
        // ==========================================

        req.user = user;


        next();

    } catch (error) {

        console.error(
            "Authentication Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};


// ==========================================
// AUTHORIZE ROLE
// ==========================================

const authorize = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }


        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: "You do not have permission"
            });
        }


        next();
    };
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    protect,
    authorize
};