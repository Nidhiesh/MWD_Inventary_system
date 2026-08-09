const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Category = require("../models/Category");


// ==========================================
// 1. SALES TREND
// ==========================================

const getSalesTrend = async (req, res) => {

    try {

        const days = parseInt(req.query.days) || 7;

        const startDate = new Date();

        startDate.setDate(
            startDate.getDate() - (days - 1)
        );

        startDate.setHours(0, 0, 0, 0);


        const salesTrend = await Sale.aggregate([

            {
                $match: {
                    createdAt: {
                        $gte: startDate
                    },
                    status: "COMPLETED"
                }
            },

            {
                $group: {

                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },

                    revenue: {
                        $sum: "$grandTotal"
                    },

                    salesCount: {
                        $sum: 1
                    }

                }
            },

            {
                $sort: {
                    _id: 1
                }
            }

        ]);


        res.status(200).json({

            success: true,

            data: {
                days,
                salesTrend
            }

        });

    } catch (error) {

        console.error(
            "Sales Trend Error:",
            error
        );

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


// ==========================================
// 2. TOP SELLING PRODUCTS
// ==========================================

const getTopSellingProducts = async (req, res) => {

    try {

        const limit =
            parseInt(req.query.limit) || 10;


        const topProducts = await Sale.aggregate([

            {
                $match: {
                    status: "COMPLETED"
                }
            },

            {
                $unwind: "$items"
            },

            {
                $group: {

                    _id: "$items.product",

                    quantitySold: {
                        $sum: "$items.quantity"
                    },

                    revenue: {
                        $sum: {
                            $multiply: [
                                "$items.quantity",
                                "$items.sellingPrice"
                            ]
                        }
                    }

                }
            },

            {
                $sort: {
                    quantitySold: -1
                }
            },

            {
                $limit: limit
            }

        ]);


        const populatedProducts =
            await Product.populate(
                topProducts,
                {
                    path: "_id",
                    select: "name sku sellingPrice quantity"
                }
            );


        res.status(200).json({

            success: true,

            data: {
                products: populatedProducts
            }

        });

    } catch (error) {

        console.error(
            "Top Products Error:",
            error
        );

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


// ==========================================
// 3. CATEGORY STOCK
// ==========================================

const getCategoryStock = async (req, res) => {

    try {

        const categoryStock =
            await Product.aggregate([

                {
                    $group: {

                        _id: "$category",

                        totalProducts: {
                            $sum: 1
                        },

                        totalQuantity: {
                            $sum: "$quantity"
                        },

                        inventoryValue: {
                            $sum: {
                                $multiply: [
                                    "$quantity",
                                    "$purchasePrice"
                                ]
                            }
                        }

                    }
                }

            ]);


        const populated =
            await Category.populate(
                categoryStock,
                {
                    path: "_id",
                    select: "name"
                }
            );


        res.status(200).json({

            success: true,

            data: {
                categories: populated
            }

        });

    } catch (error) {

        console.error(
            "Category Stock Error:",
            error
        );

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


// ==========================================
// 4. PROFIT ANALYTICS
// ==========================================

const getProfitAnalytics = async (req, res) => {

    try {

        const days =
            parseInt(req.query.days) || 30;


        const startDate = new Date();

        startDate.setDate(
            startDate.getDate() - days
        );


        const sales = await Sale.find({

            createdAt: {
                $gte: startDate
            },

            status: "COMPLETED"

        }).lean();


        let revenue = 0;
        let estimatedCost = 0;


        for (const sale of sales) {

            revenue += sale.grandTotal || 0;


            if (sale.items) {

                for (const item of sale.items) {

                    const product =
                        await Product.findById(
                            item.product
                        ).select("purchasePrice");


                    if (product) {

                        estimatedCost +=
                            (product.purchasePrice || 0) *
                            (item.quantity || 0);

                    }

                }

            }

        }


        const estimatedProfit =
            revenue - estimatedCost;


        res.status(200).json({

            success: true,

            data: {

                periodDays: days,

                revenue,

                estimatedCost,

                estimatedProfit

            }

        });

    } catch (error) {

        console.error(
            "Profit Analytics Error:",
            error
        );

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


// ==========================================
// 5. STOCK MOVEMENT
// ==========================================

const getStockMovement = async (req, res) => {

    try {

        const days =
            parseInt(req.query.days) || 30;


        const startDate = new Date();

        startDate.setDate(
            startDate.getDate() - days
        );


        const stockIn = await Purchase.aggregate([

            {
                $match: {

                    createdAt: {
                        $gte: startDate
                    },

                    status: "RECEIVED"

                }
            },

            {
                $unwind: "$items"
            },

            {
                $group: {

                    _id: null,

                    totalStockIn: {
                        $sum: "$items.quantity"
                    }

                }
            }

        ]);


        const stockOut = await Sale.aggregate([

            {
                $match: {

                    createdAt: {
                        $gte: startDate
                    },

                    status: "COMPLETED"

                }
            },

            {
                $unwind: "$items"
            },

            {
                $group: {

                    _id: null,

                    totalStockOut: {
                        $sum: "$items.quantity"
                    }

                }
            }

        ]);


        res.status(200).json({

            success: true,

            data: {

                periodDays: days,

                stockIn:
                    stockIn.length > 0
                        ? stockIn[0].totalStockIn
                        : 0,

                stockOut:
                    stockOut.length > 0
                        ? stockOut[0].totalStockOut
                        : 0

            }

        });

    } catch (error) {

        console.error(
            "Stock Movement Error:",
            error
        );

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getSalesTrend,
    getTopSellingProducts,
    getCategoryStock,
    getProfitAnalytics,
    getStockMovement

};