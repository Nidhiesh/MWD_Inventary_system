const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Supplier name is required"],
            trim: true
        },

        companyName: {
            type: String,
            required: [true, "Company name is required"],
            trim: true
        },

        email: {
            type: String,
            required: [true, "Supplier email is required"],
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: [true, "Supplier phone number is required"],
            trim: true
        },

        address: {
            type: String,
            default: "",
            trim: true
        },

        city: {
            type: String,
            default: "",
            trim: true
        },

        state: {
            type: String,
            default: "",
            trim: true
        },

        country: {
            type: String,
            default: "India",
            trim: true
        },

        gstNumber: {
            type: String,
            default: "",
            uppercase: true,
            trim: true
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

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;