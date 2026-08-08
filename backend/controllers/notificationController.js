const notificationService = require('../services/notificationService');

/**
 * @desc    Get all notifications for logged in user (or system warnings)
 * @route   GET /api/notifications
 * @access  Private (Admin, Manager)
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private (Admin, Manager)
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead
};
