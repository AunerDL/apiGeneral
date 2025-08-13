const express = require('express');
const { getSales, getSaleByOrderId } = require('../controllers/sql.controller');
const router = express.Router();

router.get('/sales', getSales); // /api/sql/sales?region=...&country=...&itemType=...&limit=50
router.get('/sales/:orderId', getSaleByOrderId);

module.exports = router;
