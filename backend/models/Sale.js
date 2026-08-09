const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
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

        sellingPrice: {
            type: Number,
            required: [true, "Selling price is required"],
            min: [0, "Selling price cannot be negative"]
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


const saleSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: [true, "Customer is required"]
        },

        items: {
            type: [saleItemSchema],
            required: [true, "Sale items are required"],
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Sale must contain at least one item"
            }
        },

        grandTotal: {
            type: Number,
            required: true,
            min: 0
        },

        saleDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["COMPLETED", "CANCELLED"],
            default: "COMPLETED"
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("Sale", saleSchema);