const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} = require("../controllers/customerController");

const router = express.Router();


// CREATE CUSTOMER
router.post(
    "/",
    protect,
    authorize("ADMIN", "STAFF"),
    createCustomer
);


// GET ALL CUSTOMERS
router.get(
    "/",
    protect,
    getCustomers
);


// GET CUSTOMER BY ID
router.get(
    "/:id",
    protect,
    getCustomerById
);


// UPDATE CUSTOMER
router.put(
    "/:id",
    protect,
    authorize("ADMIN", "STAFF"),
    updateCustomer
);


// DELETE / DEACTIVATE CUSTOMER
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteCustomer
);


module.exports = router;