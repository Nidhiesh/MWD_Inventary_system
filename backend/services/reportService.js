const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const { checkExpiryStatus } = require('./inventoryService');

/**
 * Compiles a structured inventory report.
 */
const getInventoryReport = async () => {
  const products = await Product.find({})
    .populate('category', 'name')
    .populate('supplier', 'company');

  let totalProducts = products.length;
  let totalStock = 0;
  let totalValuePurchase = 0;
  let totalValueSelling = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiredCount = 0;
  let expiringSoonCount = 0;

  const productDetails = products.map((prod) => {
    totalStock += prod.quantity;
    totalValuePurchase += prod.quantity * prod.purchasePrice;
    totalValueSelling += prod.quantity * prod.sellingPrice;

    if (prod.quantity === 0) outOfStockCount++;
    else if (prod.quantity <= prod.minimumStock) lowStockCount++;

    const expiryStatus = checkExpiryStatus(prod.expiryDate);
    if (expiryStatus === 'EXPIRED') expiredCount++;
    else if (expiryStatus === 'EXPIRING_SOON') expiringSoonCount++;

    return {
      id: prod._id,
      name: prod.name,
      sku: prod.sku,
      category: prod.category ? prod.category.name : 'Uncategorized',
      supplier: prod.supplier ? prod.supplier.company : 'N/A',
      quantity: prod.quantity,
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      stockValuePurchase: prod.quantity * prod.purchasePrice,
      stockValueSelling: prod.quantity * prod.sellingPrice,
      status: prod.status,
      expiryDate: prod.expiryDate,
      expiryStatus: expiryStatus || 'SAFE'
    };
  });

  return {
    summary: {
      totalProducts,
      totalStock,
      totalValuePurchase,
      totalValueSelling,
      potentialProfit: totalValueSelling - totalValuePurchase,
      lowStockCount,
      outOfStockCount,
      expiredCount,
      expiringSoonCount
    },
    products: productDetails
  };
};

/**
 * Compiles a sales report between specified dates.
 */
const getSalesReport = async (startDate, endDate) => {
  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sales = await Sale.find(query)
    .populate('customer', 'name email')
    .populate('createdBy', 'name')
    .populate('items.product', 'name sku')
    .sort({ createdAt: -1 });

  let totalRevenue = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  let totalItemsSold = 0;

  const salesDetails = sales.map((sale) => {
    totalRevenue += sale.totalAmount;
    totalTax += sale.tax;
    totalDiscount += sale.discount;
    
    const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
    totalItemsSold += itemsCount;

    return {
      id: sale._id,
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customer ? sale.customer.name : 'Unknown Customer',
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      itemsCount,
      createdBy: sale.createdBy ? sale.createdBy.name : 'N/A',
      createdAt: sale.createdAt
    };
  });

  return {
    summary: {
      salesCount: sales.length,
      totalRevenue,
      totalTax,
      totalDiscount,
      totalItemsSold
    },
    sales: salesDetails
  };
};

/**
 * Compiles a purchase report between specified dates.
 */
const getPurchasesReport = async (startDate, endDate) => {
  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const purchases = await Purchase.find(query)
    .populate('supplier', 'company name')
    .populate('createdBy', 'name')
    .populate('items.product', 'name sku')
    .sort({ createdAt: -1 });

  let totalCost = 0;
  let totalItemsPurchased = 0;

  const purchaseDetails = purchases.map((purchase) => {
    totalCost += purchase.totalAmount;
    const itemsCount = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
    totalItemsPurchased += itemsCount;

    return {
      id: purchase._id,
      invoiceNumber: purchase.invoiceNumber,
      supplierCompany: purchase.supplier ? purchase.supplier.company : 'Unknown Supplier',
      totalAmount: purchase.totalAmount,
      status: purchase.status,
      itemsCount,
      createdBy: purchase.createdBy ? purchase.createdBy.name : 'N/A',
      createdAt: purchase.createdAt
    };
  });

  return {
    summary: {
      purchasesCount: purchases.length,
      totalCost,
      totalItemsPurchased
    },
    purchases: purchaseDetails
  };
};

/**
 * Compiles a report for low stock and out of stock items.
 */
const getLowStockReport = async () => {
  const products = await Product.find({
    $expr: { $lte: ['$quantity', '$minimumStock'] }
  })
    .populate('category', 'name')
    .populate('supplier', 'company')
    .sort({ quantity: 1 });

  const lowStockDetails = products.map((prod) => ({
    id: prod._id,
    name: prod.name,
    sku: prod.sku,
    category: prod.category ? prod.category.name : 'Uncategorized',
    supplier: prod.supplier ? prod.supplier.company : 'N/A',
    quantity: prod.quantity,
    minimumStock: prod.minimumStock,
    status: prod.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
  }));

  return {
    count: products.length,
    products: lowStockDetails
  };
};

/**
 * Compiles a report for expired and expiring soon products.
 */
const getExpiryReport = async () => {
  // Find products with expiry date
  const products = await Product.find({ expiryDate: { $ne: null } })
    .populate('category', 'name')
    .populate('supplier', 'company')
    .sort({ expiryDate: 1 });

  const expired = [];
  const expiringSoon = [];

  products.forEach((prod) => {
    const status = checkExpiryStatus(prod.expiryDate);
    const detail = {
      id: prod._id,
      name: prod.name,
      sku: prod.sku,
      category: prod.category ? prod.category.name : 'Uncategorized',
      supplier: prod.supplier ? prod.supplier.company : 'N/A',
      quantity: prod.quantity,
      expiryDate: prod.expiryDate
    };

    if (status === 'EXPIRED') {
      expired.push(detail);
    } else if (status === 'EXPIRING_SOON') {
      expiringSoon.push(detail);
    }
  });

  return {
    summary: {
      totalMonitored: products.length,
      expiredCount: expired.length,
      expiringSoonCount: expiringSoon.length
    },
    expired,
    expiringSoon
  };
};

module.exports = {
  getInventoryReport,
  getSalesReport,
  getPurchasesReport,
  getLowStockReport,
  getExpiryReport
};
