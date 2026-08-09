const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");


// ==========================================
// HELPER — DATE RANGE
// ==========================================

const getDateRange = (req) => {

    const { startDate, endDate } = req.query;

    let start;
    let end;

    if (startDate) {
        start = new Date(startDate);
    } else {
        start = new Date();
        start.setDate(start.getDate() - 30);
    }

    if (endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    } else {
        end = new Date();
    }

    return { start, end };
};


// ==========================================
// SALES REPORT
// ==========================================

const getSalesReport = async (req, res) => {

    try {

        const { start, end } = getDateRange(req);

        const sales = await Sale.find({
            createdAt: {
                $gte: start,
                $lte: end
            },
            status: "COMPLETED"
        })
        .populate("customer", "name phone")
        .sort({ createdAt: -1 });


        const summaryResult = await Sale.aggregate([

            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end
                    },
                    status: "COMPLETED"
                }
            },

            {
                $group: {
                    _id: null,

                    totalRevenue: {
                        $sum: "$grandTotal"
                    },

                    totalSales: {
                        $sum: 1
                    }
                }
            }
        ]);


        const summary =
            summaryResult.length > 0
                ? summaryResult[0]
                : {
                    totalRevenue: 0,
                    totalSales: 0
                };


        res.status(200).json({

            success: true,

            data: {

                period: {
                    startDate: start,
                    endDate: end
                },

                summary: {
                    totalSales: summary.totalSales,
                    totalRevenue: summary.totalRevenue
                },

                sales

            }

        });

    } catch (error) {

        console.error("Sales Report Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// PURCHASE REPORT
// ==========================================

const getPurchaseReport = async (req, res) => {

    try {

        const { start, end } = getDateRange(req);

        const purchases = await Purchase.find({

            createdAt: {
                $gte: start,
                $lte: end
            },

            status: "RECEIVED"

        })
        .populate("supplier", "companyName phone")
        .sort({ createdAt: -1 });


        const summaryResult = await Purchase.aggregate([

            {
                $match: {

                    createdAt: {
                        $gte: start,
                        $lte: end
                    },

                    status: "RECEIVED"

                }
            },

            {
                $group: {

                    _id: null,

                    totalPurchases: {
                        $sum: 1
                    },

                    totalExpenditure: {
                        $sum: "$grandTotal"
                    }

                }
            }

        ]);


        const summary =
            summaryResult.length > 0
                ? summaryResult[0]
                : {
                    totalPurchases: 0,
                    totalExpenditure: 0
                };


        res.status(200).json({

            success: true,

            data: {

                period: {
                    startDate: start,
                    endDate: end
                },

                summary: {

                    totalPurchases:
                        summary.totalPurchases,

                    totalExpenditure:
                        summary.totalExpenditure

                },

                purchases

            }

        });

    } catch (error) {

        console.error("Purchase Report Error:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });
    }
};


// ==========================================
// INVENTORY REPORT
// ==========================================

const getInventoryReport = async (req, res) => {

    try {

        const products = await Product.find()
            .populate("category", "name")
            .populate("supplier", "companyName")
            .sort({ quantity: 1 });


        let totalInventoryValue = 0;
        let totalProducts = products.length;
        let lowStockProducts = 0;
        let outOfStockProducts = 0;


        products.forEach(product => {

            const quantity = product.quantity || 0;
            const purchasePrice = product.purchasePrice || 0;

            totalInventoryValue +=
                quantity * purchasePrice;


            if (
                quantity > 0 &&
                quantity <= product.minimumStock
            ) {
                lowStockProducts++;
            }


            if (quantity === 0) {
                outOfStockProducts++;
            }

        });


        res.status(200).json({

            success: true,

            data: {

                summary: {

                    totalProducts,

                    lowStockProducts,

                    outOfStockProducts,

                    totalInventoryValue

                },

                products

            }

        });

    } catch (error) {

        console.error("Inventory Report Error:", error);

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

    getSalesReport,

    getPurchaseReport,

    getInventoryReport

};