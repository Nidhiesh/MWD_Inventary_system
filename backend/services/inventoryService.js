const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { createNotification } = require('./notificationService');

/**
 * Increases the stock of a product and records an inventory transaction.
 */
const increaseStock = async (productId, quantity, type, referenceId, userId, notes = '') => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(`Product not found with ID: ${productId}`);
  }

  const previousStock = product.quantity;
  const newStock = previousStock + Number(quantity);

  product.quantity = newStock;
  await product.save();

  // Record transaction
  await InventoryTransaction.create({
    productId,
    type,
    quantity,
    previousStock,
    newStock,
    referenceId: String(referenceId),
    userId,
    notes
  });

  return product;
};

/**
 * Decreases the stock of a product, enforces non-negative stock, and records an inventory transaction.
 */
const decreaseStock = async (productId, quantity, type, referenceId, userId, notes = '') => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(`Product not found with ID: ${productId}`);
  }

  const previousStock = product.quantity;
  const newStock = previousStock - Number(quantity);

  if (newStock < 0) {
    throw new Error(`Insufficient stock for product '${product.name}'. Available: ${previousStock}, Requested: ${quantity}`);
  }

  product.quantity = newStock;
  await product.save();

  // Record transaction
  await InventoryTransaction.create({
    productId,
    type,
    quantity,
    previousStock,
    newStock,
    referenceId: String(referenceId),
    userId,
    notes
  });

  // Trigger low stock checks after decrease
  await checkLowStock(product);

  return product;
};

/**
 * Adjusts stock manually.
 */
const adjustStock = async (productId, newQty, userId, notes = '') => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(`Product not found with ID: ${productId}`);
  }

  const diff = Number(newQty) - product.quantity;
  if (diff > 0) {
    return await increaseStock(productId, diff, 'ADJUSTMENT', null, userId, notes);
  } else if (diff < 0) {
    return await decreaseStock(productId, Math.abs(diff), 'ADJUSTMENT', null, userId, notes);
  }
  return product; // no change
};

/**
 * Retrieves the transaction history for a product.
 */
const getStockHistory = async (productId) => {
  return await InventoryTransaction.find({ productId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email');
};

/**
 * Evaluates if a product is low stock / out of stock and sends alerts.
 */
const checkLowStock = async (product) => {
  if (product.quantity === 0) {
    await createNotification(
      null,
      'OUT_OF_STOCK',
      `Product '${product.name}' (SKU: ${product.sku}) is OUT OF STOCK.`,
      product._id
    );
  } else if (product.quantity <= product.minimumStock) {
    await createNotification(
      null,
      'LOW_STOCK',
      `Product '${product.name}' (SKU: ${product.sku}) is low on stock. Current: ${product.quantity}, Minimum: ${product.minimumStock}`,
      product._id
    );
  }
};

/**
 * Calculates a rule-based reorder recommendation.
 * Reorder Point = Average Daily Sales (last 30 days) * Supplier Lead Time (defaults to 7 days)
 */
const getReorderRecommendation = async (productId, leadTimeDays = 7) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Get sales of this product in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await InventoryTransaction.find({
    productId,
    type: 'SALE',
    createdAt: { $gte: thirtyDaysAgo }
  });

  const totalSold = transactions.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0);
  const averageDailySales = totalSold / 30;
  const reorderPoint = averageDailySales * leadTimeDays;

  const reorderRecommended = product.quantity < reorderPoint;

  if (reorderRecommended) {
    await createNotification(
      null,
      'REORDER',
      `Reorder recommended for '${product.name}'. Current stock: ${product.quantity}, calculated Reorder Point: ${reorderPoint.toFixed(2)} (based on 30-day average daily sales).`,
      product._id
    );
  }

  return {
    productId: product._id,
    productName: product.name,
    sku: product.sku,
    currentStock: product.quantity,
    averageDailySales: Number(averageDailySales.toFixed(4)),
    reorderPoint: Number(reorderPoint.toFixed(2)),
    reorderRecommended
  };
};

/**
 * Expire detection logic
 */
const checkExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expiryDate);
  expDate.setHours(0, 0, 0, 0);

  if (expDate < today) {
    return 'EXPIRED';
  }

  // Check if expiring within 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  thirtyDaysFromNow.setHours(23, 59, 59, 999);

  if (expDate <= thirtyDaysFromNow) {
    return 'EXPIRING_SOON';
  }

  return 'SAFE';
};

module.exports = {
  increaseStock,
  decreaseStock,
  adjustStock,
  getStockHistory,
  checkLowStock,
  getReorderRecommendation,
  checkExpiryStatus
};
