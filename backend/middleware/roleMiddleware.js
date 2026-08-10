const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        // ==========================================
        // USER MUST BE AUTHENTICATED
        // ==========================================

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });

        }

        // ==========================================
        // NORMALIZE USER ROLE
        // ==========================================

        const userRole = String(req.user.role)
            .trim()
            .toLowerCase();

        // ==========================================
        // NORMALIZE ALLOWED ROLES
        // ==========================================

        const normalizedRoles = allowedRoles.map(
            role =>
                String(role)
                    .trim()
                    .toLowerCase()
        );

        // ==========================================
        // CHECK PERMISSION
        // ==========================================

        if (!normalizedRoles.includes(userRole)) {

            return res.status(403).json({
                success: false,
                message: "You do not have permission"
            });

        }

        // ==========================================
        // AUTHORIZED
        // ==========================================

        next();
    };
};


module.exports = {
    authorize
};