const Notification = require('../models/Notification');

/**
 * Creates a notification in the database.
 * @param {string} userId - User ID (optional, can be null for system-wide alerts)
 * @param {string} type - LOW_STOCK, OUT_OF_STOCK, EXPIRY, REORDER, SYSTEM
 * @param {string} message - Alert details
 * @param {string} productId - Product ID (optional)
 * @returns {Promise<Object>} The created notification
 */
const createNotification = async (userId, type, message, productId = null) => {
  try {
    // Prevent duplicate unread notifications of the same type for the same product to avoid spam
    if (productId) {
      const existing = await Notification.findOne({
        productId,
        type,
        isRead: false
      });
      if (existing) {
        return existing; // already exists
      }
    }

    return await Notification.create({
      userId,
      type,
      message,
      productId,
      isRead: false
    });
  } catch (error) {
    console.error(`Notification creation failed: ${error.message}`);
  }
};

/**
 * Retrieves notifications for a user (or system notifications).
 * @param {string} userId - User ID to filter
 * @returns {Promise<Array>} List of notifications
 */
const getUserNotifications = async (userId) => {
  return await Notification.find({
    $or: [{ userId }, { userId: null }]
  })
    .sort({ createdAt: -1 })
    .populate('productId', 'name sku quantity');
};

/**
 * Marks a notification as read.
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} The updated notification
 */
const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead
};
