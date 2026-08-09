const Purchase = require("../models/Purchase");


// ==========================================
// CREATE PURCHASE
// ==========================================
const createPurchase = async (req, res) => {
    try {

        const purchase = await Purchase.create(req.body);

        res.status(201).json({
            success: true,
            message: "Purchase created successfully",
            data: purchase
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET ALL PURCHASES
// ==========================================
const getPurchases = async (req, res) => {
    try {

        const purchases = await Purchase.find()
            .populate("supplier", "companyName phone email")
            .populate("items.product", "name sku price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: purchases.length,
            data: purchases
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET PURCHASE BY ID
// ==========================================
const getPurchaseById = async (req, res) => {
    try {

        const purchase = await Purchase.findById(req.params.id)
            .populate("supplier", "companyName phone email")
            .populate("items.product", "name sku price");

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        res.status(200).json({
            success: true,
            data: purchase
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// UPDATE PURCHASE
// ==========================================
const updatePurchase = async (req, res) => {
    try {

        const purchase = await Purchase.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Purchase updated successfully",
            data: purchase
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// DELETE PURCHASE
// ==========================================
const deletePurchase = async (req, res) => {
    try {

        const purchase = await Purchase.findByIdAndDelete(
            req.params.id
        );

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Purchase deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    createPurchase,
    getPurchases,
    getPurchaseById,
    updatePurchase,
    deletePurchase
};