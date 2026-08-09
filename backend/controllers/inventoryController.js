const InventoryTransaction = require("../models/InventoryTransaction");


// ==========================================
// GET ALL INVENTORY TRANSACTIONS
// ==========================================
const getInventoryTransactions = async (req, res) => {
    try {

        const transactions =
            await InventoryTransaction.find()
                .populate("product", "name sku quantity")
                .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET TRANSACTIONS FOR ONE PRODUCT
// ==========================================
const getProductTransactions = async (req, res) => {
    try {

        const transactions =
            await InventoryTransaction.find({
                product: req.params.productId
            })
            .populate("product", "name sku quantity")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    getInventoryTransactions,
    getProductTransactions
};