const Supplier = require("../models/Supplier");

// CREATE
const createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: suppliers.length,
            data: suppliers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET ONE
const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        res.status(200).json({
            success: true,
            data: supplier
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// SOFT DELETE
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { status: "INACTIVE" },
            {
                new: true,
                runValidators: true
            }
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Supplier deactivated successfully",
            data: supplier
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};