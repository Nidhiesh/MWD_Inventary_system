const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ==========================================
// PROTECT
// ==========================================

const protect = async (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Not authorized. Please login."
            });
        }


        const token =
            authHeader.split(" ")[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        const user =
            await User.findById(decoded.id)
                .select("-password");


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }


        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message: "Account is disabled"
            });
        }


        req.user = user;

        next();


    } catch (error) {

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired token"
        });
    }
};


// ==========================================
// AUTHORIZE ROLE
// ==========================================

const authorize = (...roles) => {

    return (req, res, next) => {

        if (
            !req.user ||
            !roles.includes(req.user.role)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission"
            });
        }

        next();
    };
};


module.exports = {
    protect,
    authorize
};