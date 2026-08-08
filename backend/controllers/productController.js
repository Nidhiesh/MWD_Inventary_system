const Product = require("../models/Product");

// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// ==========================================
const getProducts = async (req, res) => {
    try {

        const {
            search,
            status,
            warehouse,
            lowStock,
            page = 1,
            limit = 10,
            sort = "createdAt",
            order = "desc"
        } = req.query;


        // ------------------------------------------
        // BUILD FILTER
        // ------------------------------------------

        const filter = {};


        // Search by product name or SKU
        if (search) {

            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    sku: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];

        }


        // Status filter
        if (status) {

            filter.status = status.toUpperCase();

        }


        // Warehouse filter
        if (warehouse) {

            filter.warehouse = {
                $regex: warehouse,
                $options: "i"
            };

        }


        // Low stock filter
        if (lowStock === "true") {

            filter.$expr = {
                $lte: [
                    "$quantity",
                    "$minimumStock"
                ]
            };

        }


        // ------------------------------------------
        // PAGINATION
        // ------------------------------------------

        const pageNumber = Math.max(
            parseInt(page) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(parseInt(limit) || 10, 1),
            100
        );

        const skip =
            (pageNumber - 1) * limitNumber;


        // ------------------------------------------
        // SORTING
        // ------------------------------------------

        const sortOrder =
            order === "asc" ? 1 : -1;

        const sortObject = {
            [sort]: sortOrder
        };


        // ------------------------------------------
        // TOTAL PRODUCTS
        // ------------------------------------------

        const total =
            await Product.countDocuments(filter);


        // ------------------------------------------
        // GET PRODUCTS
        // ------------------------------------------

        const products =
            await Product.find(filter)
                .sort(sortObject)
                .skip(skip)
                .limit(limitNumber);


        // ------------------------------------------
        // TOTAL PAGES
        // ------------------------------------------

        const totalPages =
            Math.ceil(total / limitNumber);


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        res.status(200).json({

            success: true,

            data: products,

            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: total,
                totalPages: totalPages
            }

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }
};


// ==========================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ==========================================
const getProductById = async (req, res) => {

    try {

        const product =
            await Product.findById(req.params.id);


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }


        res.status(200).json({

            success: true,

            data: product

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================
const updateProduct = async (req, res) => {

    try {

        const product =
            await Product.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }


        res.status(200).json({

            success: true,

            message: "Product updated successfully",

            data: product

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================
const deleteProduct = async (req, res) => {

    try {

        const product =
            await Product.findByIdAndDelete(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }


        res.status(200).json({

            success: true,

            message: "Product deleted successfully"

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {

    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct

};