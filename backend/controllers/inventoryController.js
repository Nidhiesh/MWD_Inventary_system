const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const inventoryService = require('../services/inventoryService');
const logAudit = require('../utils/auditLogger');

/**
 * @desc    Get current stock levels of all products
 * @route   GET /api/inventory/stock
 * @access  Private (Admin, Manager, Staff)
 */
const getStockLevels = async (req, res, next) => {
  try {
    const products = await Product.find({})
      .populate('category', 'name')
      .select('name sku quantity minimumStock maximumStock status warehouse')
      .sort({ name: 1 });

    const stockData = products.map((prod) => {
      let stockStatus = 'SAFE';
      if (prod.quantity === 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (prod.quantity <= prod.minimumStock) {
        stockStatus = 'LOW_STOCK';
      }

      return {
        id: prod._id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category ? prod.category.name : 'Uncategorized',
        quantity: prod.quantity,
        minimumStock: prod.minimumStock,
        maximumStock: prod.maximumStock,
        warehouse: prod.warehouse,
        status: prod.status,
        stockStatus
      };
    });

    res.status(200).json({
      success: true,
      message: 'Stock levels retrieved successfully',
      data: stockData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inventory transactions
 * @route   GET /api/inventory/transactions
 * @access  Private (Admin, Manager, Staff)
 */
const getTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const total = await InventoryTransaction.countDocuments({});
    const pages = Math.ceil(total / limit);

    const transactions = await InventoryTransaction.find({})
      .populate('productId', 'name sku')
      .populate('userId', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock products
 * @route   GET /api/inventory/low-stock
 * @access  Private (Admin, Manager, Staff)
 */
const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    })
      .populate('category', 'name')
      .populate('supplier', 'company')
      .sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      message: 'Low stock products retrieved successfully',
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manually adjust product stock level
 * @route   POST /api/inventory/adjust
 * @access  Private (Admin, Manager)
 */
const adjustStock = async (req, res, next) => {
  try {
    const { productId, newQty, notes } = req.body;

    if (!productId || newQty === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId and newQty'
      });
    }

    const parsedQty = parseInt(newQty, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock adjustment quantity must be a non-negative integer'
      });
    }

    const updatedProduct = await inventoryService.adjustStock(productId, parsedQty, req.user._id, notes);

    await logAudit(req.user._id, 'ADJUST_STOCK', 'Inventory', productId, `Manual stock adjustment to ${parsedQty}. Notes: ${notes}`);

    res.status(200).json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockLevels,
  getTransactions,
  getLowStockProducts,
  adjustStock
};
