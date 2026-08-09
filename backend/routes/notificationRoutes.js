const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const router = express.Router();


// GET ALL
router.get(
    "/",
    protect,
    getNotifications
);


// GET UNREAD
router.get(
    "/unread",
    protect,
    getUnreadNotifications
);


// MARK ALL AS READ
router.put(
    "/read-all",
    protect,
    markAllNotificationsAsRead
);


// MARK ONE AS READ
router.put(
    "/:id/read",
    protect,
    markNotificationAsRead
);


// DELETE
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteNotification
);


module.exports = {
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
};