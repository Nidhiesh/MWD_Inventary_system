const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ==========================================
// PROTECT ROUTES
// ==========================================

const protect = async (req, res, next) => {

    try {

        // ==========================================
        // CHECK AUTHORIZATION HEADER
        // ==========================================

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

        const token = authHeader.substring(7).trim();

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });

        }


        // ==========================================
        // CHECK JWT SECRET
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
        // VERIFY TOKEN
        // ==========================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // ==========================================
        // VALIDATE TOKEN PAYLOAD
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

        const user = await User.findById(decoded.id)
            .select("-password");


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found"
            });

        }


        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (user.isActive === false) {

            return res.status(403).json({
                success: false,
                message: "Account is disabled"
            });

        }


        // ==========================================
        // ATTACH USER TO REQUEST
        // ==========================================

        req.user = user;


        // ==========================================
        // CONTINUE
        // ==========================================

        next();


    } catch (error) {

        // ==========================================
        // JWT ERRORS
        // ==========================================

        if (error.name === "TokenExpiredError") {

            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
            });

        }


        if (error.name === "JsonWebTokenError") {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }


        // ==========================================
        // OTHER ERRORS
        // ==========================================

        console.error(
            "Authentication Error:",
            error.message
        );

        return res.status(401).json({
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

        // User must already be authenticated

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });

        }


        // Check role

        if (
            !roles.includes(req.user.role)
        ) {

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