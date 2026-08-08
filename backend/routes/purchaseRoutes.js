const express = require("express");

const {
    createPurchase,
    getPurchases,
    getPurchaseById,
    receivePurchase
} = require("../controllers/purchaseController");

const router = express.Router();


// CREATE PURCHASE
router.post("/", createPurchase);


// GET ALL PURCHASES
router.get("/", getPurchases);


// GET PURCHASE BY ID
router.get("/:id", getPurchaseById);


// RECEIVE PURCHASE
router.put("/:id/receive", receivePurchase);


module.exports = router;