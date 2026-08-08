const reportService = require('../services/reportService');

/**
 * @desc    Get inventory report
 * @route   GET /api/reports/inventory
 * @access  Private (Admin, Manager)
 */
const getInventoryReport = async (req, res, next) => {
  try {
    const report = await reportService.getInventoryReport();
    res.status(200).json({
      success: true,
      message: 'Inventory report generated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sales report
 * @route   GET /api/reports/sales
 * @access  Private (Admin, Manager)
 */
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportService.getSalesReport(startDate, endDate);
    res.status(200).json({
      success: true,
      message: 'Sales report generated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get purchases report
 * @route   GET /api/reports/purchases
 * @access  Private (Admin, Manager)
 */
const getPurchasesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportService.getPurchasesReport(startDate, endDate);
    res.status(200).json({
      success: true,
      message: 'Purchases report generated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock report
 * @route   GET /api/reports/low-stock
 * @access  Private (Admin, Manager)
 */
const getLowStockReport = async (req, res, next) => {
  try {
    const report = await reportService.getLowStockReport();
    res.status(200).json({
      success: true,
      message: 'Low stock report generated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get product expiry report
 * @route   GET /api/reports/expiry
 * @access  Private (Admin, Manager)
 */
const getExpiryReport = async (req, res, next) => {
  try {
    const report = await reportService.getExpiryReport();
    res.status(200).json({
      success: true,
      message: 'Product expiry report generated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryReport,
  getSalesReport,
  getPurchasesReport,
  getLowStockReport,
  getExpiryReport
};
