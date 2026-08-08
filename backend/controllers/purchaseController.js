const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const InventoryTransaction = require("../models/InventoryTransaction");

// ==========================================
// CREATE PURCHASE
// POST /api/purchases
// ==========================================
const createPurchase = async (req, res) => {
    try {
        // Auto-generate purchase number if not provided
        if (!req.body.purchaseNumber) {
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const count = await Purchase.countDocuments() + 1;
            const sequence = String(count).padStart(4, "0");
            req.body.purchaseNumber = `PO-${date}-${sequence}`;
        }

        // Calculate totals for each item and overall subtotal & grandTotal
        if (req.body.items && Array.isArray(req.body.items)) {
            let subtotal = 0;
            req.body.items = req.body.items.map(item => {
                const total = Number(item.purchasePrice || 0) * Number(item.quantity || 0);
                subtotal += total;
                return {
                    ...item,
                    total
                };
            });
            req.body.subtotal = subtotal;
            const tax = Number(req.body.tax || 0);
            req.body.grandTotal = subtotal + tax;
        }

        const purchase = await Purchase.create(req.body);

        res.status(201).json({
            success: true,
            message: "Purchase order created successfully",
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
// GET /api/purchases
// ==========================================
const getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate("supplier", "name companyName")
            .populate("items.product", "name sku")
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
// GET /api/purchases/:id
// ==========================================
const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate("supplier", "name companyName")
            .populate("items.product", "name sku quantity");

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
// RECEIVE PURCHASE
// PUT /api/purchases/:id/receive
// ==========================================
const receivePurchase = async (req, res) => {
    try {

        const purchase = await Purchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        // Prevent receiving the same purchase twice
        if (purchase.status === "RECEIVED") {
            return res.status(400).json({
                success: false,
                message: "Purchase has already been received"
            });
        }

        // Prevent cancelled purchase from being received
        if (purchase.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Cancelled purchase cannot be received"
            });
        }

        // Update product stock
        for (const item of purchase.items) {

            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            const previousQuantity =
    Number(product.quantity || 0);

const newQuantity =
    previousQuantity +
    Number(item.quantity);

product.quantity = newQuantity;

await product.save();

await InventoryTransaction.create({
    product: product._id,

    type: "PURCHASE",

    quantity: Number(item.quantity),

    previousQuantity,

    newQuantity,

    referenceType: "PURCHASE",

    referenceId: purchase._id,

    reason: `Stock received from purchase ${purchase.purchaseNumber}`
});
        }

        // Change purchase status
        purchase.status = "RECEIVED";

        await purchase.save();

        // Get updated purchase
        const updatedPurchase =
            await Purchase.findById(purchase._id)
                .populate(
                    "supplier",
                    "name companyName"
                )
                .populate(
                    "items.product",
                    "name sku quantity"
                );

        res.status(200).json({
            success: true,
            message: "Purchase received and stock updated successfully",
            data: updatedPurchase
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
    createPurchase,
    getPurchases,
    getPurchaseById,
    receivePurchase
};