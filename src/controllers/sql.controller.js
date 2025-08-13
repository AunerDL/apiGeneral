// controllers/sql.controller.js
const { sql, getPool } = require('../config/sqlserver');

// 📌 Consulta general parametrizada para dashboard
const getDashboardOrders = async (req, res) => {
  try {
    const { customerId, status, limit } = req.query;
    const pool = await getPool();
    const request = pool.request();

    if (customerId) request.input('customerId', sql.Int, customerId);
    if (status) request.input('status', sql.Int, status);
    const top = parseInt(limit) || 100;

    let where = [];
    if (customerId) where.push('soh.CustomerID = @customerId');
    if (status) where.push('soh.Status = @status');

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const query = `
      SELECT TOP(${top})
        soh.SalesOrderID,
        soh.OrderDate,
        soh.Status,
        c.FirstName + ' ' + c.LastName AS CustomerName,
        a.City, a.StateProvince, a.CountryRegion,
        p.Name AS ProductName,
        sod.OrderQty, sod.UnitPrice, sod.LineTotal
      FROM SalesLT.SalesOrderHeader soh
      JOIN SalesLT.Customer c ON soh.CustomerID = c.CustomerID
      JOIN SalesLT.CustomerAddress ca ON c.CustomerID = ca.CustomerID
      JOIN SalesLT.Address a ON ca.AddressID = a.AddressID
      JOIN SalesLT.SalesOrderDetail sod ON soh.SalesOrderID = sod.SalesOrderID
      JOIN SalesLT.Product p ON sod.ProductID = p.ProductID
      ${whereSql}
      ORDER BY soh.OrderDate DESC;
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error getDashboardOrders:', err);
    res.status(500).json({ message: 'Error en consulta SQL', error: err.message });
  }
};

// 📌 Crear un pedido
const createOrder = async (req, res) => {
  try {
    const { CustomerID, OrderDate, DueDate, ShipMethod, SubTotal, TaxAmt, Freight, TotalDue } = req.body;

    const pool = await getPool();
    const request = pool.request();
    request.input('CustomerID', sql.Int, CustomerID);
    request.input('OrderDate', sql.DateTime, OrderDate);
    request.input('DueDate', sql.DateTime, DueDate);
    request.input('ShipMethod', sql.NVarChar(50), ShipMethod);
    request.input('SubTotal', sql.Money, SubTotal);
    request.input('TaxAmt', sql.Money, TaxAmt);
    request.input('Freight', sql.Money, Freight);
    request.input('TotalDue', sql.Money, TotalDue);

    const query = `
      INSERT INTO SalesLT.SalesOrderHeader
      (RevisionNumber, OrderDate, DueDate, ShipDate, Status, OnlineOrderFlag,
       SalesOrderNumber, PurchaseOrderNumber, AccountNumber, CustomerID,
       ShipToAddressID, BillToAddressID, ShipMethod, SubTotal, TaxAmt, Freight, TotalDue, rowguid, ModifiedDate)
      VALUES (1, @OrderDate, @DueDate, NULL, 1, 1,
       'SO' + CAST(NEWID() AS NVARCHAR(36)), NULL, NULL, @CustomerID,
       NULL, NULL, @ShipMethod, @SubTotal, @TaxAmt, @Freight, @TotalDue, NEWID(), GETDATE());
    `;

    await request.query(query);
    res.json({ message: 'Pedido creado correctamente' });
  } catch (err) {
    console.error('❌ Error createOrder:', err);
    res.status(500).json({ message: 'Error creando pedido', error: err.message });
  }
};

// 📌 Leer pedido por ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = await getPool();
    const request = pool.request();
    request.input('orderId', sql.Int, orderId);

    const result = await request.query('SELECT * FROM SalesLT.SalesOrderHeader WHERE SalesOrderID = @orderId');
    if (!result.recordset.length) return res.status(404).json({ message: 'Pedido no encontrado' });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ Error getOrderById:', err);
    res.status(500).json({ message: 'Error consultando pedido', error: err.message });
  }
};

// 📌 Actualizar pedido
const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { Status, ShipMethod } = req.body;

    const pool = await getPool();
    const request = pool.request();
    request.input('orderId', sql.Int, orderId);
    request.input('Status', sql.Int, Status);
    request.input('ShipMethod', sql.NVarChar(50), ShipMethod);

    const query = `
      UPDATE SalesLT.SalesOrderHeader
      SET Status = @Status, ShipMethod = @ShipMethod, ModifiedDate = GETDATE()
      WHERE SalesOrderID = @orderId;
    `;

    await request.query(query);
    res.json({ message: 'Pedido actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error updateOrder:', err);
    res.status(500).json({ message: 'Error actualizando pedido', error: err.message });
  }
};

// 📌 Eliminar pedido
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = await getPool();
    const request = pool.request();
    request.input('orderId', sql.Int, orderId);

    await request.query('DELETE FROM SalesLT.SalesOrderHeader WHERE SalesOrderID = @orderId');
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error deleteOrder:', err);
    res.status(500).json({ message: 'Error eliminando pedido', error: err.message });
  }
};

module.exports = {
  getDashboardOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder
};
