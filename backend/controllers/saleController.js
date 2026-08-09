const Sale = require("../models/Sale");
const Product = require("../models/Product");
const InventoryTransaction = require("../models/InventoryTransaction");
const Notification = require("../models/Notification");


// ==========================================
// CREATE SALE
// ==========================================
const createSale = async (req, res) => {
    try {

        const {
            customer,
            items,
            grandTotal,
            status
        } = req.body;


        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Sale must contain at least one item"
            });
        }


        // ==========================================
        // CHECK STOCK BEFORE CREATING SALE
        // ==========================================
        for (const item of items) {

            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }


            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
                });
            }
        }


        // ==========================================
        // CREATE SALE
        // ==========================================
        const sale = await Sale.create({
            customer,
            items,
            grandTotal,
            status: status || "COMPLETED"
        });


        // ==========================================
        // REDUCE PRODUCT STOCK
        // ==========================================
        if (sale.status === "COMPLETED") {

            for (const item of sale.items) {

                const product = await Product.findById(item.product);

                if (!product) {
                    continue;
                }


                const previousQuantity = product.quantity;


                // Reduce stock
                product.quantity -= item.quantity;


                await product.save();


                // ==========================================
                // INVENTORY TRANSACTION
                // ==========================================
                await InventoryTransaction.create({
                    product: product._id,
                    type: "OUT",
                    quantity: item.quantity,
                    previousQuantity: previousQuantity,
                    newQuantity: product.quantity,
                    referenceType: "SALE",
                    referenceId: sale._id,
                    note: "Stock deducted from sale"
                });


                // ==========================================
                // OUT OF STOCK
                // ==========================================
                if (product.quantity === 0) {

                    await Notification.create({
                        type: "OUT_OF_STOCK",
                        message: `${product.name} is out of stock.`,
                        productId: product._id
                    });

                }


                // ==========================================
                // LOW STOCK
                // ==========================================
                else if (
                    product.quantity <= product.minimumStock
                ) {

                    await Notification.create({
                        type: "LOW_STOCK",
                        message: `${product.name} is low in stock. Current quantity: ${product.quantity}`,
                        productId: product._id
                    });

                }
            }
        }


        res.status(201).json({
            success: true,
            message: "Sale created and stock updated successfully",
            data: sale
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET ALL SALES
// ==========================================
const getSales = async (req, res) => {
    try {

        const sales = await Sale.find()
            .populate("customer", "name phone email")
            .populate("items.product", "name sku sellingPrice")
            .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            count: sales.length,
            data: sales
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==========================================
// GET SALE BY ID
// ==========================================
const getSaleById = async (req, res) => {
    try {

        const sale = await Sale.findById(req.params.id)
            .populate("customer", "name phone email")
            .populate("items.product", "name sku sellingPrice");


        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }


        res.status(200).json({
            success: true,
            data: sale
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    createSale,
    getSales,
    getSaleById
};