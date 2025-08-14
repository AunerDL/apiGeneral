/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Métricas y estadísticas del sistema
 *   - name: Orders
 *     description: Operaciones con órdenes de venta
 */

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

/**
 * @swagger
 * /sql/dashboard/metrics:
 *   get:
 *     summary: Obtiene métricas completas del dashboard
 *     description: Retorna estadísticas de ventas, productos más vendidos, clientes y distribución geográfica
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salesMetrics:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     avgOrderValue:
 *                       type: number
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productName:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error al obtener métricas
 */
router.get('/dashboard/metrics', sqlController.getDashboardMetrics);

/**
 * @swagger
 * /sql/orders:
 *   post:
 *     summary: Crea una nueva orden de venta
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CustomerID
 *               - OrderDate
 *               - TotalDue
 *             properties:
 *               CustomerID:
 *                 type: integer
 *                 example: 1
 *               OrderDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-11-20T00:00:00Z"
 *               DueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-11-27T00:00:00Z"
 *               ShipMethod:
 *                 type: string
 *                 example: "STANDARD"
 *               SubTotal:
 *                 type: number
 *                 format: float
 *                 example: 1000.00
 *               TaxAmt:
 *                 type: number
 *                 format: float
 *                 example: 160.00
 *               Freight:
 *                 type: number
 *                 format: float
 *                 example: 50.00
 *               TotalDue:
 *                 type: number
 *                 format: float
 *                 example: 1210.00
 *     responses:
 *       200:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido creado correctamente"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error al crear la orden
 */
router.post('/orders', validateOrder, sqlController.createOrder);

/**
 * @swagger
 * /sql/orders/{orderId}:
 *   get:
 *     summary: Obtiene los detalles de una orden específica
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden a consultar
 *         example: 71774
 *     responses:
 *       200:
 *         description: Detalles de la orden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 SalesOrderID:
 *                   type: integer
 *                 OrderDate:
 *                   type: string
 *                   format: date-time
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ProductName:
 *                         type: string
 *                       OrderQty:
 *                         type: integer
 *                       UnitPrice:
 *                         type: number
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error al consultar la orden
 */
router.get('/orders/:orderId', sqlController.getOrderDetails);

/**
 * @swagger
 * /sql/orders/{orderId}:
 *   put:
 *     summary: Actualiza una orden existente
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Status:
 *                 type: integer
 *                 description: Nuevo estado de la orden
 *                 example: 2
 *               ShipMethod:
 *                 type: string
 *                 description: Nuevo método de envío
 *                 example: "EXPRESS"
 *     responses:
 *       200:
 *         description: Orden actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido actualizado correctamente"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error al actualizar la orden
 */
router.put('/orders/:orderId', validateOrder, sqlController.updateOrder);

/**
 * @swagger
 * /sql/orders/{orderId}:
 *   delete:
 *     summary: Elimina una orden existente
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden a eliminar
 *     responses:
 *       200:
 *         description: Orden eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido eliminado correctamente"
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error al eliminar la orden
 */
router.delete('/orders/:orderId', sqlController.deleteOrder);

module.exports = router;