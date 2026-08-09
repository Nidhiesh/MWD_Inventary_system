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


// CREATE - ADMIN ONLY
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createSupplier
);


// GET ALL - ADMIN + STAFF
router.get(
    "/",
    protect,
    getSuppliers
);


// GET ONE - ADMIN + STAFF
router.get(
    "/:id",
    protect,
    getSupplierById
);


// UPDATE - ADMIN ONLY
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updateSupplier
);


// DELETE - ADMIN ONLY
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteSupplier
);


module.exports = router;