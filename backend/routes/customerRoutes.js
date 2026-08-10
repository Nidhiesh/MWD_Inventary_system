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


// ==========================================
// CREATE CUSTOMER
// ADMIN + STAFF
// ==========================================

router.post(
    "/",
    protect,
    authorize("admin", "staff"),
    createCustomer
);


// ==========================================
// GET ALL CUSTOMERS
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    protect,
    authorize("admin", "staff"),
    getCustomers
);


// ==========================================
// GET CUSTOMER BY ID
// ADMIN + STAFF
// ==========================================

router.get(
    "/:id",
    protect,
    authorize("admin", "staff"),
    getCustomerById
);


// ==========================================
// UPDATE CUSTOMER
// ADMIN + STAFF
// ==========================================

router.put(
    "/:id",
    protect,
    authorize("admin", "staff"),
    updateCustomer
);


// ==========================================
// DELETE / DEACTIVATE CUSTOMER
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteCustomer
);


module.exports = router;