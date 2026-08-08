const AuditLog = require('../models/AuditLog');

/**
 * Log an audit trail entry.
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action identifier (e.g. CREATE_PRODUCT, LOGIN)
 * @param {string} module - Component/module name (e.g. Product, Auth)
 * @param {string} recordId - Target record's MongoDB ID
 * @param {string} description - Readable description of the action
 */
const logAudit = async (userId, action, moduleName, recordId, description) => {
  try {
    if (!userId) {
      console.warn(`AuditLog warning: Attempted to log action '${action}' without userId.`);
      return;
    }
    await AuditLog.create({
      userId,
      action,
      module: moduleName,
      recordId,
      description
    });
  } catch (error) {
    console.error(`AuditLog failure: ${error.message}`);
  }
};

module.exports = logAudit;
