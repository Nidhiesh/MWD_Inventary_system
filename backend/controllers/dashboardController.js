const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Category = require('../models/Category');

/**
 * @desc    Get dashboard metrics summary
 * @route   GET /api/dashboard
 * @access  Private (Admin, Manager, Staff)
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Products and Stock calculations
    const products = await Product.find({});
    const totalProducts = products.length;
    let totalStock = 0;
    let stockValue = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    products.forEach((prod) => {
      totalStock += prod.quantity;
      stockValue += prod.quantity * prod.purchasePrice;

      if (prod.quantity === 0) {
        outOfStockProducts++;
      } else if (prod.quantity <= prod.minimumStock) {
        lowStockProducts++;
      }
    });

    // 2. Sales calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today sales
    const salesTodayList = await Sale.find({
      createdAt: { $gte: today }
    });
    const todaySales = salesTodayList.reduce((sum, s) => sum + s.totalAmount, 0);

    // Monthly sales
    const salesMonthList = await Sale.find({
      createdAt: { $gte: startOfMonth }
    });
    const monthlySales = salesMonthList.reduce((sum, s) => sum + s.totalAmount, 0);

    // 3. Purchase calculation (total of RECEIVED purchase orders)
    const receivedPurchases = await Purchase.find({ status: 'RECEIVED' });
    const totalPurchases = receivedPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

    res.status(200).json({
      success: true,
      message: 'Dashboard metrics retrieved successfully',
      data: {
        totalProducts,
        totalStock,
        stockValue: Number(stockValue.toFixed(2)),
        lowStockProducts,
        outOfStockProducts,
        todaySales: Number(todaySales.toFixed(2)),
        monthlySales: Number(monthlySales.toFixed(2)),
        totalPurchases: Number(totalPurchases.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sales history chart data (last 7 days daily summary)
 * @route   GET /api/dashboard/sales-chart
 * @access  Private (Admin, Manager, Staff)
 */
const getSalesChartData = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Sales chart data retrieved successfully',
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top selling products
 * @route   GET /api/dashboard/top-products
 * @access  Private (Admin, Manager, Staff)
 */
const getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const topSelling = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit }
    ]);

    // Populate product details manually to maintain clean design
    const populatedTopSelling = await Promise.all(
      topSelling.map(async (item) => {
        const prod = await Product.findById(item._id).select('name sku quantity sellingPrice').lean();
        return {
          product: prod || { name: 'Unknown Product', sku: 'N/A' },
          totalQuantitySold: item.totalQuantitySold,
          totalRevenue: Number(item.totalRevenue.toFixed(2))
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Top selling products retrieved successfully',
      data: populatedTopSelling
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category summary (product count and stock value per category)
 * @route   GET /api/dashboard/category-summary
 * @access  Private (Admin, Manager, Staff)
 */
const getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$quantity' },
          stockValue: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } }
        }
      }
    ]);

    const populatedSummary = await Promise.all(
      summary.map(async (item) => {
        let catName = 'Uncategorized';
        if (item._id) {
          const cat = await Category.findById(item._id).select('name').lean();
          if (cat) catName = cat.name;
        }
        return {
          categoryName: catName,
          productCount: item.productCount,
          totalStock: item.totalStock,
          stockValue: Number(item.stockValue.toFixed(2))
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Category summary retrieved successfully',
      data: populatedSummary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getSalesChartData,
  getTopProducts,
  getCategorySummary
};
