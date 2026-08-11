const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }

        const userRole = String(req.user.role || "")
            .trim()
            .toLowerCase();

        const normalizedRoles = allowedRoles.map(
            role => String(role)
                .trim()
                .toLowerCase()
        );

        if (!userRole || !normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission"
            });
        }

        next();
    };
};

module.exports = {
    authorize
};