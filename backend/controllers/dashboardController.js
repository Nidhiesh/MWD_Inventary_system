const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Notification = require("../models/Notification");


// ==========================================
// GET DASHBOARD SUMMARY
// ==========================================
const getDashboardSummary = async (req, res) => {
    try {

        // ==========================================
        // BASIC COUNTS
        // ==========================================

        const totalProducts = await Product.countDocuments();

        const activeProducts = await Product.countDocuments({
            status: "ACTIVE"
        });

        const totalCategories = await Category.countDocuments();

        const totalSuppliers = await Supplier.countDocuments();

        const activeSuppliers = await Supplier.countDocuments({
            status: "ACTIVE"
        });

        const totalCustomers = await Customer.countDocuments();

        const activeCustomers = await Customer.countDocuments({
            status: "ACTIVE"
        });


        // ==========================================
        // STOCK INFORMATION
        // ==========================================

        const lowStockProducts = await Product.countDocuments({
            $expr: {
                $and: [
                    { $lte: ["$quantity", "$minimumStock"] },
                    { $gt: ["$quantity", 0] }
                ]
            }
        });


        const outOfStockProducts = await Product.countDocuments({
            quantity: 0
        });


        // ==========================================
        // INVENTORY VALUE
        // ==========================================

        const inventoryResult = await Product.aggregate([
            {
                $match: {
                    status: "ACTIVE"
                }
            },
            {
                $project: {
                    inventoryValue: {
                        $multiply: [
                            "$quantity",
                            "$purchasePrice"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalInventoryValue: {
                        $sum: "$inventoryValue"
                    }
                }
            }
        ]);


        const totalInventoryValue =
            inventoryResult.length > 0
                ? inventoryResult[0].totalInventoryValue
                : 0;


        // ==========================================
        // TODAY'S DATE RANGE
        // ==========================================

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);


        // ==========================================
        // TODAY'S SALES
        // ==========================================

        const todaySalesResult = await Sale.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    },
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


        const todaySales =
            todaySalesResult.length > 0
                ? todaySalesResult[0].totalSales
                : 0;

        const todaySalesCount =
            todaySalesResult.length > 0
                ? todaySalesResult[0].salesCount
                : 0;


        // ==========================================
        // TODAY'S PURCHASES
        // ==========================================

        const todayPurchasesResult = await Purchase.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    },
                    status: "RECEIVED"
                }
            },
            {
                $group: {
                    _id: null,
                    totalPurchases: {
                        $sum: "$grandTotal"
                    },
                    purchasesCount: {
                        $sum: 1
                    }
                }
            }
        ]);


        const todayPurchases =
            todayPurchasesResult.length > 0
                ? todayPurchasesResult[0].totalPurchases
                : 0;

        const todayPurchasesCount =
            todayPurchasesResult.length > 0
                ? todayPurchasesResult[0].purchasesCount
                : 0;


        // ==========================================
        // UNREAD NOTIFICATIONS
        // ==========================================

        const unreadNotifications =
            await Notification.countDocuments({
                isRead: false
            });


        // ==========================================
        // RECENT SALES
        // ==========================================

        const recentSales = await Sale.find()
            .populate("customer", "name phone")
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "customer grandTotal status saleDate createdAt"
            );


        // ==========================================
        // RECENT PURCHASES
        // ==========================================

        const recentPurchases = await Purchase.find()
            .populate("supplier", "companyName phone")
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "supplier grandTotal status purchaseDate createdAt"
            );


        // ==========================================
        // FINAL RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,

            data: {

                products: {
                    total: totalProducts,
                    active: activeProducts,
                    lowStock: lowStockProducts,
                    outOfStock: outOfStockProducts
                },

                categories: {
                    total: totalCategories
                },

                suppliers: {
                    total: totalSuppliers,
                    active: activeSuppliers
                },

                customers: {
                    total: totalCustomers,
                    active: activeCustomers
                },

                sales: {
                    today: todaySales,
                    todayCount: todaySalesCount
                },

                purchases: {
                    today: todayPurchases,
                    todayCount: todayPurchasesCount
                },

                inventory: {
                    totalValue: totalInventoryValue
                },

                notifications: {
                    unread: unreadNotifications
                },

                recentSales,

                recentPurchases
            }
        });

    } catch (error) {

        console.error("Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getDashboardSummary
};