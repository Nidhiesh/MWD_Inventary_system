const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(authorize('ADMIN', 'MANAGER', 'STAFF'), getSales)
  .post(authorize('ADMIN', 'MANAGER', 'STAFF'), createSale);

router
  .route('/:id')
  .get(authorize('ADMIN', 'MANAGER', 'STAFF'), getSaleById);

module.exports = router;
