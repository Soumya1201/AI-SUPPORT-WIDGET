/**
 * routes/analytics.routes.js — Analytics Routes
 */

const express = require("express");
const router = express.Router();
const { getBotAnalytics, getOverviewAnalytics } = require("../controllers/analytics.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/overview", getOverviewAnalytics);
router.get("/:botId", getBotAnalytics);

module.exports = router;
