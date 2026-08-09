const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const Customer = require("../models/Customer");
const Purchase = require("../models/Purchase");
const Sale = require("../models/Sale");


// ==========================================
// GET DASHBOARD SUMMARY
// GET /api/dashboard
// ==========================================
const getDashboardSummary = async (req, res) => {
    try {

        // ------------------------------------------
        // BASIC COUNTS
        // ------------------------------------------

        const totalProducts =
            await Product.countDocuments();

        const totalCategories =
            await Category.countDocuments();

        const totalSuppliers =
            await Supplier.countDocuments();

        const totalCustomers =
            await Customer.countDocuments({
                status: "ACTIVE"
            });


        // ------------------------------------------
        // LOW STOCK
        // ------------------------------------------

        const lowStockProducts =
            await Product.countDocuments({
                $expr: {
                    $lte: [
                        "$quantity",
                        "$minimumStock"
                    ]
                }
            });


        // ------------------------------------------
        // OUT OF STOCK
        // ------------------------------------------

        const outOfStockProducts =
            await Product.countDocuments({
                quantity: 0
            });


        // ------------------------------------------
        // TOTAL SALES
        // ------------------------------------------

        const salesResult =
            await Sale.aggregate([
                {
                    $match: {
                        status: "COMPLETED"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSales: {
                            $sum: "$grandTotal"
                        },
                        salesCount: {
                            $sum: 1
                        }
                    }
                }
            ]);


        // ------------------------------------------
        // TOTAL PURCHASES
        // ------------------------------------------

        const purchaseResult =
            await Purchase.aggregate([
                {
                    $match: {
                        status: "RECEIVED"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPurchases: {
                            $sum: "$totalAmount"
                        },
                        purchaseCount: {
                            $sum: 1
                        }
                    }
                }
            ]);


        const totalSales =
            salesResult.length > 0
                ? salesResult[0].totalSales
                : 0;

        const salesCount =
            salesResult.length > 0
                ? salesResult[0].salesCount
                : 0;


        const totalPurchases =
            purchaseResult.length > 0
                ? purchaseResult[0].totalPurchases
                : 0;

        const purchaseCount =
            purchaseResult.length > 0
                ? purchaseResult[0].purchaseCount
                : 0;


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        res.status(200).json({
            success: true,

            data: {
                products: {
                    total: totalProducts,
                    lowStock: lowStockProducts,
                    outOfStock: outOfStockProducts
                },

                categories: {
                    total: totalCategories
                },

                suppliers: {
                    total: totalSuppliers
                },

                customers: {
                    total: totalCustomers
                },

                sales: {
                    totalAmount: totalSales,
                    count: salesCount
                },

                purchases: {
                    totalAmount: totalPurchases,
                    count: purchaseCount
                }
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    getDashboardSummary
};