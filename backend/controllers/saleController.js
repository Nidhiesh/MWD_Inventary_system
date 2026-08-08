const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const generateInvoiceNumber = require('../utils/generateInvoice');
const inventoryService = require('../services/inventoryService');
const logAudit = require('../utils/auditLogger');

/**
 * @desc    Create a new sale transaction
 * @route   POST /api/sales
 * @access  Private (Admin, Manager, Staff)
 */
const createSale = async (req, res, next) => {
  try {
    const { customer, items, tax, discount, paymentMethod, paymentStatus } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer ID, a list of items, and paymentMethod'
      });
    }

    // 1. Validate Customer
    const dbCustomer = await Customer.findById(customer);
    if (!dbCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    if (dbCustomer.status === 'INACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process sale for an inactive customer'
      });
    }

    let subtotal = 0;
    const processedItems = [];

    // 2. Validate Products, Stock and Calculate subtotal
    for (const item of items) {
      const { product, quantity } = item;

      if (!product || !quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a product ID and a quantity of at least 1'
        });
      }

      // Fetch product details securely from DB
      const dbProduct = await Product.findById(product);
      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID: ${product}`
        });
      }

      // Rule 8: Inactive products cannot be sold
      if (dbProduct.status === 'INACTIVE') {
        return res.status(400).json({
          success: false,
          message: `Product '${dbProduct.name}' is inactive and cannot be sold.`
        });
      }

      // Rule 5 / Critical Inventory Rule: A sale cannot exceed available stock
      if (quantity > dbProduct.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${dbProduct.name}'. Available: ${dbProduct.quantity}, Requested: ${quantity}`
        });
      }

      const itemSubtotal = quantity * dbProduct.sellingPrice;
      subtotal += itemSubtotal;

      processedItems.push({
        product,
        quantity,
        price: dbProduct.sellingPrice,
        subtotal: itemSubtotal
      });
    }

    // Calculate tax and discount
    const calculatedTax = Number(tax) || 0;
    const calculatedDiscount = Number(discount) || 0;
    const totalAmount = subtotal + calculatedTax - calculatedDiscount;

    if (totalAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total amount cannot be negative. Please adjust discount.'
      });
    }

    // Generate Invoice Number INV-YYYY-XXXXXX
    const invoiceNumber = await generateInvoiceNumber('SALE');

    // Create the Sale document
    const sale = await Sale.create({
      customer,
      invoiceNumber,
      items: processedItems,
      subtotal,
      tax: calculatedTax,
      discount: calculatedDiscount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentStatus || 'PAID',
      createdBy: req.user._id
    });

    // 3. Decrease stock of each product and write Inventory Transaction
    for (const item of processedItems) {
      await inventoryService.decreaseStock(
        item.product,
        item.quantity,
        'SALE',
        sale.invoiceNumber,
        req.user._id,
        `Sold item via invoice ${sale.invoiceNumber}`
      );
    }

    await logAudit(req.user._id, 'CREATE_SALE', 'Sale', sale._id, `Sale invoice ${sale.invoiceNumber} processed (Total: ${sale.totalAmount})`);

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sales transactions
 * @route   GET /api/sales
 * @access  Private (Admin, Manager, Staff)
 */
const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find({})
      .populate('customer', 'name email phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Sales retrieved successfully',
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sale by ID
 * @route   GET /api/sales/:id
 * @access  Private (Admin, Manager, Staff)
 */
const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('createdBy', 'name')
      .populate('items.product', 'name sku sellingPrice');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sale retrieved successfully',
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById
};
