const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getSalesChartData,
  getTopProducts,
  getCategorySummary
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN', 'MANAGER', 'STAFF'));

router.get('/', getDashboardSummary);
router.get('/sales-chart', getSalesChartData);
router.get('/top-products', getTopProducts);
router.get('/category-summary', getCategorySummary);

module.exports = router;
