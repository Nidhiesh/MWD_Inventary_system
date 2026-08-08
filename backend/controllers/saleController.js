const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const InventoryTransaction =
    require("../models/InventoryTransaction");


// ==========================================
// CREATE SALE
// POST /api/sales
// ==========================================
const createSale = async (req, res) => {
    try {

        const {
            saleNumber,
            customer,
            items,
            tax = 0,
            notes = ""
        } = req.body;


        // ------------------------------------------
        // CHECK CUSTOMER
        // ------------------------------------------

        const customerExists =
            await Customer.findById(customer);

        if (!customerExists) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }


        if (customerExists.status === "INACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Cannot create sale for inactive customer"
            });
        }


        // ------------------------------------------
        // CHECK ITEMS
        // ------------------------------------------

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Sale must contain at least one item"
            });
        }


        const processedItems = [];

        let subtotal = 0;


        // ------------------------------------------
        // PROCESS EACH PRODUCT
        // ------------------------------------------

        for (const item of items) {

            const product =
                await Product.findById(item.product);


            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }


            const quantity =
                Number(item.quantity);

            const sellingPrice =
                Number(item.sellingPrice);


            if (quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be greater than 0"
                });
            }


            if (sellingPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Selling price cannot be negative"
                });
            }


            // ------------------------------------------
            // STOCK CHECK
            // ------------------------------------------

            const currentStock =
                Number(product.quantity || 0);


            if (currentStock < quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Insufficient stock for ${product.name}. Available: ${currentStock}`
                });
            }


            // ------------------------------------------
            // CALCULATE ITEM TOTAL
            // ------------------------------------------

            const total =
                quantity * sellingPrice;


            subtotal += total;


            processedItems.push({
                product: product._id,
                quantity,
                sellingPrice,
                total
            });
        }


        // ------------------------------------------
        // CALCULATE TOTAL
        // ------------------------------------------

        const taxAmount = Number(tax);

        if (taxAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Tax cannot be negative"
            });
        }


        const grandTotal =
            subtotal + taxAmount;


        // ------------------------------------------
        // CREATE SALE
        // ------------------------------------------

        const sale =
            await Sale.create({
                saleNumber,
                customer,
                items: processedItems,
                subtotal,
                tax: taxAmount,
                grandTotal,
                status: "COMPLETED",
                notes
            });


        // ------------------------------------------
        // REDUCE STOCK
        // ------------------------------------------

        for (const item of processedItems) {

            const product =
                await Product.findById(item.product);


            const previousQuantity =
                Number(product.quantity || 0);


            const newQuantity =
                previousQuantity -
                Number(item.quantity);


            product.quantity = newQuantity;

            await product.save();


            // ------------------------------------------
            // CREATE INVENTORY TRANSACTION
            // ------------------------------------------

            await InventoryTransaction.create({

                product: product._id,

                type: "SALE",

                quantity: Number(item.quantity),

                previousQuantity,

                newQuantity,

                referenceType: "SALE",

                referenceId: sale._id,

                reason:
                    `Stock sold through sale ${sale.saleNumber}`
            });
        }


        // ------------------------------------------
        // POPULATE RESPONSE
        // ------------------------------------------

        const populatedSale =
            await Sale.findById(sale._id)
                .populate(
                    "customer",
                    "name email phone"
                )
                .populate(
                    "items.product",
                    "name sku quantity"
                );


        res.status(201).json({
            success: true,
            message:
                "Sale created and stock updated successfully",
            data: populatedSale
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
// GET /api/sales
// ==========================================
const getSales = async (req, res) => {
    try {

        const sales =
            await Sale.find()
                .populate(
                    "customer",
                    "name email phone"
                )
                .populate(
                    "items.product",
                    "name sku"
                )
                .sort({
                    createdAt: -1
                });


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
// GET /api/sales/:id
// ==========================================
const getSaleById = async (req, res) => {
    try {

        const sale =
            await Sale.findById(req.params.id)
                .populate(
                    "customer",
                    "name email phone"
                )
                .populate(
                    "items.product",
                    "name sku quantity"
                );


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