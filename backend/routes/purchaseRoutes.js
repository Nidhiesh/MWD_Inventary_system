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


// CREATE PURCHASE
// ADMIN ONLY
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createPurchase
);


// GET ALL PURCHASES
// ADMIN + STAFF
router.get(
    "/",
    protect,
    getPurchases
);


// GET PURCHASE BY ID
// ADMIN + STAFF
router.get(
    "/:id",
    protect,
    getPurchaseById
);


// UPDATE PURCHASE
// ADMIN ONLY
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updatePurchase
);


// DELETE PURCHASE
// ADMIN ONLY
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deletePurchase
);


module.exports = router;