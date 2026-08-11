const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    createPurchase,
    getPurchases,
    getPurchaseById,
    updatePurchase,
    deletePurchase
} = require("../controllers/purchaseController");

const router = express.Router();


// ==========================================
// CREATE PURCHASE
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    protect,
    authorize("admin"),
    createPurchase
);


// ==========================================
// GET ALL PURCHASES
// ADMIN + STAFF
// ==========================================

router.get(
    "/",
    protect,
    authorize("admin", "staff"),
    getPurchases
);


// ==========================================
// GET PURCHASE BY ID
// ADMIN + STAFF
// ==========================================

router.get(
    "/:id",
    protect,
    authorize("admin", "staff"),
    getPurchaseById
);


// ==========================================
// UPDATE PURCHASE
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updatePurchase
);


// ==========================================
// DELETE PURCHASE
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deletePurchase
);


module.exports = router;