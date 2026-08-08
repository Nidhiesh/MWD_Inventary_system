const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true
        },

        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            uppercase: true,
            trim: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"]
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        purchasePrice: {
            type: Number,
            required: [true, "Purchase price is required"],
            min: [0, "Purchase price cannot be negative"]
        },

        sellingPrice: {
            type: Number,
            required: [true, "Selling price is required"],
            min: [0, "Selling price cannot be negative"]
        },

        quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
},

minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
},

maximumStock: {
    type: Number,
    min: 0,
    default: 100
},
        warehouse: {
            type: String,
            default: "Main Warehouse",
            trim: true
        },

        expiryDate: {
            type: Date,
            default: null
        },

        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;