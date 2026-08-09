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

        costPrice: {
            type: Number,
            required: [true, "Cost price is required"],
            min: [0, "Cost price cannot be negative"]
        },

        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);


const purchaseSchema = new mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: [true, "Supplier is required"]
        },

        items: {
            type: [purchaseItemSchema],
            required: [true, "Purchase items are required"],
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Purchase must contain at least one item"
            }
        },

        grandTotal: {
            type: Number,
            required: true,
            min: 0
        },

        purchaseDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["PENDING", "RECEIVED", "CANCELLED"],
            default: "RECEIVED"
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("Purchase", purchaseSchema);