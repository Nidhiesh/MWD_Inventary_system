const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN', 'MANAGER')); // restricted as per role expectations

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);

module.exports = router;
