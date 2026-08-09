const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();


// REGISTER
router.post(
    "/register",
    registerUser
);


// LOGIN
router.post(
    "/login",
    loginUser
);


// TEST LOGIN
router.get(
    "/me",
    protect,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: req.user
        });
    }
);


// TEST ADMIN
router.get(
    "/admin-test",
    protect,
    authorize("ADMIN"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin authorization successful",
            user: req.user
        });
    }
);


module.exports = router;