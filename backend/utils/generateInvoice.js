const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

/**
 * Generates a unique, sequential invoice number.
 * @param {string} type - 'SALE' or 'PURCHASE'
 * @returns {Promise<string>} The generated invoice number (e.g. INV-2026-000001 or PO-2026-000001)
 */
const generateInvoiceNumber = async (type) => {
  const year = new Date().getFullYear();
  const isSale = type === 'SALE';
  const prefix = isSale ? `INV-${year}-` : `PO-${year}-`;
  const Model = isSale ? Sale : Purchase;

  // Retrieve the latest invoice matching the prefix sorted by creation date descending
  const latestRecord = await Model.findOne({
    invoiceNumber: new RegExp(`^${prefix}`)
  })
    .sort({ createdAt: -1 })
    .select('invoiceNumber')
    .lean();

  let seqNumber = 1;

  if (latestRecord && latestRecord.invoiceNumber) {
    const parts = latestRecord.invoiceNumber.split('-');
    const lastSeqPart = parts[parts.length - 1];
    const parsedSeq = parseInt(lastSeqPart, 10);
    if (!isNaN(parsedSeq)) {
      seqNumber = parsedSeq + 1;
    }
  }

  const paddedSeq = String(seqNumber).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
};

module.exports = generateInvoiceNumber;
