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
            enum: ["IN", "OUT", "ADJUSTMENT"],
            required: [true, "Transaction type is required"]
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"]
        },

        previousQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        newQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        referenceType: {
            type: String,
            enum: ["PURCHASE", "SALE", "MANUAL"],
            required: true
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId
        },

        note: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "InventoryTransaction",
    inventoryTransactionSchema
);