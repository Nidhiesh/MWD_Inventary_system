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
        _id: true
    }
);


const saleSchema = new mongoose.Schema(
    {
        saleNumber: {
            type: String,
            required: [true, "Sale number is required"],
            unique: true,
            trim: true
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: [true, "Customer is required"]
        },

        items: {
            type: [saleItemSchema],
            required: true,

            validate: {
                validator: function (items) {
                    return items.length > 0;
                },

                message: "Sale must contain at least one item"
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
                "COMPLETED",
                "CANCELLED"
            ],
            default: "COMPLETED"
        },

        saleDate: {
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


const Sale = mongoose.model("Sale", saleSchema);

module.exports = Sale;