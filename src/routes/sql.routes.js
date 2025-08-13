// routes/sql.routes.js
const express = require('express');
const {
  getDashboardOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder
} = require('../controllers/sql.controller');

const router = express.Router();

router.get('/orders', getDashboardOrders); // Dashboard filtrable
router.post('/orders', createOrder);
router.get('/orders/:orderId', getOrderById);
router.put('/orders/:orderId', updateOrder);
router.delete('/orders/:orderId', deleteOrder);

module.exports = router;
