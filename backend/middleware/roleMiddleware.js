const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const userRole = req.user.role ? req.user.role.toLowerCase() : "";
        const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());

        if (!allowedRolesLower.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action."
            });
        }

        next();
    };
};

module.exports = {
    authorize
};