const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

// ==========================================
// CREATE PURCHASE
// ==========================================
const createPurchase = async (req, res) => {
    try {
        const { supplier, items, grandTotal, status } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Purchase must contain at least one item"
            });
        }

        // Create purchase
        const purchase = await Purchase.create({
            supplier,
            items,
            grandTotal,
            status: status || "RECEIVED"
        });

        // Update product stock only when purchase is RECEIVED
        if (purchase.status === "RECEIVED") {

            for (const item of purchase.items) {

                const product = await Product.findById(item.product);

                if (!product) {
                    continue;
                }

                // Increase stock
                const previousQuantity = product.quantity;
product.quantity += item.quantity;

    await product.save();

    // Record inventory transaction
product.quantity += item.quantity;

await product.save();

await InventoryTransaction.create({
    product: product._id,
    type: "IN",
    quantity: item.quantity,
    previousQuantity: previousQuantity,
    newQuantity: product.quantity,
    referenceType: "PURCHASE",
    referenceId: purchase._id,
    note: "Stock received from purchase"
});

                // LOW STOCK notification
                if (
                    product.quantity > 0 &&
                    product.quantity <= product.minimumStock
                ) {
                    await Notification.create({
                        type: "LOW_STOCK",
                        message: `${product.name} is low in stock. Current quantity: ${product.quantity}`,
                        productId: product._id
                    });
                }

                // OUT OF STOCK notification
                if (product.quantity === 0) {
                    await Notification.create({
                        type: "OUT_OF_STOCK",
                        message: `${product.name} is out of stock.`,
                        productId: product._id
                    });
                }
            }
        }

        res.status(201).json({
            success: true,
            message: "Purchase created and stock updated successfully",
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