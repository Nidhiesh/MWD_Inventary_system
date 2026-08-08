const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"]
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"]
        },

        purchasePrice: {
            type: Number,
            required: [true, "Purchase price is required"],
            min: [0, "Purchase price cannot be negative"]
        },

        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: true
    }
);


const purchaseSchema = new mongoose.Schema(
    {
        purchaseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: [true, "Supplier is required"]
        },

        items: {
            type: [purchaseItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Purchase must contain at least one item"
            }
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        tax: {
            type: Number,
            default: 0,
            min: 0
        },

        grandTotal: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "RECEIVED",
                "CANCELLED"
            ],
            default: "DRAFT"
        },

        purchaseDate: {
            type: Date,
            default: Date.now
        },

        notes: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);


const Purchase = mongoose.model(
    "Purchase",
    purchaseSchema
);

module.exports = Purchase;