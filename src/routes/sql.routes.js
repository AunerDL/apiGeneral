const express = require('express');
const router = express.Router();
const sqlController = require('../controllers/sql.controller');

// Middleware de validación
const validateOrder = (req, res, next) => {
  if (!req.body.CustomerID || !req.body.OrderDate) {
    return res.status(400).json({ error: 'CustomerID y OrderDate son requeridos' });
  }
  next();
};

// Rutas
router.get('/dashboard/metrics', sqlController.getDashboardMetrics);
router.post('/orders', validateOrder, sqlController.createOrder);
router.get('/orders/:orderId', sqlController.getOrderDetails);
router.put('/orders/:orderId', validateOrder, sqlController.updateOrder);
router.delete('/orders/:orderId', sqlController.deleteOrder);

module.exports = router;