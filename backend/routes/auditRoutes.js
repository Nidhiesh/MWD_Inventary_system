const express = require("express");

const router = express.Router();

const { getAuditLogs } = require("../controllers/auditController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");


// ==========================================
// AUDIT LOGS
// ADMIN ONLY
// ==========================================

router.use(protect);
router.use(authorize("admin"));


// ==========================================
// GET AUDIT LOGS
// ==========================================

router.get(
    "/",
    getAuditLogs
);


module.exports = router;