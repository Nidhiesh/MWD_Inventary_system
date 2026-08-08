const Product = require("../models/Product");


// ==========================================
// GET LOW STOCK PRODUCTS
// GET /api/alerts/low-stock
// ==========================================
const getLowStockProducts = async (req, res) => {
    try {

        const products = await Product.find({
            $expr: {
                $lte: ["$quantity", "$minimumStock"]
            }
        })
        .populate("category", "name")
        .sort({
            quantity: 1
        });

        res.status(200).json({
            success: true,
            count: products.length,
            message:
                products.length > 0
                    ? "Low stock products found"
                    : "No low stock products",
            data: products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET OUT OF STOCK PRODUCTS
// GET /api/alerts/out-of-stock
// ==========================================
const getOutOfStockProducts = async (req, res) => {
    try {

        const products = await Product.find({
            quantity: 0
        })
        .populate("category", "name")
        .sort({
            name: 1
        });

        res.status(200).json({
            success: true,
            count: products.length,
            message:
                products.length > 0
                    ? "Out of stock products found"
                    : "No out of stock products",
            data: products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    getLowStockProducts,
    getOutOfStockProducts
};