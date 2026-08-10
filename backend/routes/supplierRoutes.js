const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
} = require("../controllers/supplierController");

const router = express.Router();


// ==========================================
// CREATE SUPPLIER
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    protect,
    authorize("admin"),
    createSupplier
);


// ==========================================
// GET ALL SUPPLIERS
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    protect,
    authorize("admin", "staff"),
    getSuppliers
);


// ==========================================
// GET SUPPLIER BY ID
// ADMIN + STAFF
// ==========================================

router.get(
    "/:id",
    protect,
    authorize("admin", "staff"),
    getSupplierById
);


// ==========================================
// UPDATE SUPPLIER
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateSupplier
);


// ==========================================
// DELETE SUPPLIER
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteSupplier
);


module.exports = router;