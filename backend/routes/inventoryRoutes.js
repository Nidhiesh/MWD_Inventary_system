const express = require('express');
const router = express.Router();
const {
  getStockLevels,
  getTransactions,
  getLowStockProducts,
  adjustStock
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/stock', authorize('ADMIN', 'MANAGER', 'STAFF'), getStockLevels);
router.get('/transactions', authorize('ADMIN', 'MANAGER', 'STAFF'), getTransactions);
router.get('/low-stock', authorize('ADMIN', 'MANAGER', 'STAFF'), getLowStockProducts);
router.post('/adjust', authorize('ADMIN', 'MANAGER'), adjustStock);

module.exports = router;
