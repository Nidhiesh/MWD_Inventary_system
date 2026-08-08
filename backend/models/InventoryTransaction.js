const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"]
        },

        type: {
            type: String,
            enum: [
                "PURCHASE",
                "SALE",
                "ADJUSTMENT",
                "RETURN_IN",
                "RETURN_OUT",
                "DAMAGE"
            ],
            required: [true, "Transaction type is required"]
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"]
        },

        previousQuantity: {
            type: Number,
            required: true
        },

        newQuantity: {
            type: Number,
            required: true
        },

        referenceType: {
            type: String,
            enum: [
                "PURCHASE",
                "SALE",
                "MANUAL",
                "DAMAGE"
            ],
            default: "MANUAL"
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        reason: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const InventoryTransaction =
    mongoose.model(
        "InventoryTransaction",
        inventoryTransactionSchema
    );

module.exports = InventoryTransaction;