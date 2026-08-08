const express = require('express');
const router = express.Router();
const {
  getInventoryReport,
  getSalesReport,
  getPurchasesReport,
  getLowStockReport,
  getExpiryReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/inventory', getInventoryReport);
router.get('/sales', getSalesReport);
router.get('/purchases', getPurchasesReport);
router.get('/low-stock', getLowStockReport);
router.get('/expiry', getExpiryReport);

module.exports = router;
