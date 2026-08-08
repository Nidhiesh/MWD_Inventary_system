const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(authorize('ADMIN', 'MANAGER', 'STAFF'), getCustomers)
  .post(authorize('ADMIN', 'MANAGER', 'STAFF'), createCustomer);

router
  .route('/:id')
  .get(authorize('ADMIN', 'MANAGER', 'STAFF'), getCustomerById)
  .put(authorize('ADMIN', 'MANAGER', 'STAFF'), updateCustomer)
  .delete(authorize('ADMIN', 'MANAGER'), deleteCustomer);

module.exports = router;
