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

router.get(
    "/",
    protect,
    getNotifications
);

router.get(
    "/unread",
    protect,
    getUnreadNotifications
);

router.put(
    "/read-all",
    protect,
    markAllNotificationsAsRead
);

router.put(
    "/:id/read",
    protect,
    markNotificationAsRead
);

router.delete(
    "/:id",
    protect,
    deleteNotification
);

module.exports = router;