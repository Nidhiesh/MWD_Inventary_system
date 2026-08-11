const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const router = express.Router();


// ==========================================
// GET ALL NOTIFICATIONS
// AUTHENTICATED USERS
// ==========================================

router.get(
    "/",
    protect,
    getNotifications
);


// ==========================================
// GET UNREAD NOTIFICATIONS
// AUTHENTICATED USERS
// ==========================================

router.get(
    "/unread",
    protect,
    getUnreadNotifications
);


// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// AUTHENTICATED USERS
// ==========================================

router.put(
    "/read-all",
    protect,
    markAllNotificationsAsRead
);


// ==========================================
// MARK ONE NOTIFICATION AS READ
// AUTHENTICATED USERS
// ==========================================

router.put(
    "/:id/read",
    protect,
    markNotificationAsRead
);


// ==========================================
// DELETE NOTIFICATION
// AUTHENTICATED USERS
// ==========================================

router.delete(
    "/:id",
    protect,
    deleteNotification
);


module.exports = router;