const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get all audit logs
 * @route   GET /api/audit-logs
 * @access  Private (Admin only)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments({});
    const pages = Math.ceil(total / limit);

    const logs = await AuditLog.find({})
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: logs,
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

module.exports = {
  getAuditLogs
};
