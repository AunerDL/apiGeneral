const { sql, getPool } = require('../config/sqlserver');

// Cache simple para métricas frecuentes
const dashboardCache = {
  lastUpdated: null,
  data: null,
  ttl: 30000 // 30 segundos
};

// Funciones auxiliares para métricas
async function getSalesMetrics(pool) {
  const result = await pool.request().query(`
    SELECT 
      COUNT(*) AS totalOrders,
      SUM(TotalDue) AS totalRevenue,
      AVG(TotalDue) AS avgOrderValue,
      MIN(OrderDate) AS oldestOrderDate,
      MAX(OrderDate) AS newestOrderDate
    FROM SalesLT.SalesOrderHeader
  `);
  return result.recordset[0];
}

async function getTopProducts(pool, limit = 5) {
  const result = await pool.request()
    .input('limit', sql.Int, limit)
    .query(`
      SELECT TOP (@limit)
        p.Name AS productName,
        SUM(sod.OrderQty) AS totalQuantity,
        SUM(sod.LineTotal) AS totalRevenue
      FROM SalesLT.SalesOrderDetail sod
      JOIN SalesLT.Product p ON sod.ProductID = p.ProductID
      GROUP BY p.Name
      ORDER BY totalRevenue DESC
    `);
  return result.recordset;
}

async function getRecentOrders(pool, limit = 5) {
  const result = await pool.request()
    .input('limit', sql.Int, limit)
    .query(`
      SELECT TOP (@limit)
        soh.SalesOrderID,
        soh.OrderDate,
        soh.TotalDue,
        c.FirstName + ' ' + c.LastName AS customerName,
        a.City
      FROM SalesLT.SalesOrderHeader soh
      JOIN SalesLT.Customer c ON soh.CustomerID = c.CustomerID
      JOIN SalesLT.CustomerAddress ca ON c.CustomerID = ca.CustomerID
      JOIN SalesLT.Address a ON ca.AddressID = a.AddressID
      ORDER BY soh.OrderDate DESC
    `);
  return result.recordset;
}

async function getCustomersMetrics(pool) {
  const result = await pool.request().query(`
    SELECT 
      COUNT(*) AS totalCustomers,
      (SELECT COUNT(DISTINCT CustomerID) FROM SalesLT.SalesOrderHeader) AS customersWithOrders,
      (SELECT COUNT(*) FROM SalesLT.Customer WHERE CompanyName IS NOT NULL) AS businessCustomers,
      (SELECT COUNT(*) FROM SalesLT.Customer WHERE CompanyName IS NULL) AS individualCustomers
    FROM SalesLT.Customer
  `);
  return result.recordset[0];
}

async function getGeographicData(pool) {
  const result = await pool.request().query(`
    SELECT 
      a.CountryRegion,
      a.StateProvince,
      COUNT(DISTINCT soh.SalesOrderID) AS orderCount,
      SUM(soh.TotalDue) AS totalRevenue
    FROM SalesLT.SalesOrderHeader soh
    JOIN SalesLT.Customer c ON soh.CustomerID = c.CustomerID
    JOIN SalesLT.CustomerAddress ca ON c.CustomerID = ca.CustomerID
    JOIN SalesLT.Address a ON ca.AddressID = a.AddressID
    GROUP BY a.CountryRegion, a.StateProvince
    ORDER BY totalRevenue DESC
  `);
  return result.recordset;
}

// Métricas para el dashboard
const getDashboardMetrics = async (req, res) => {
  try {
    // Verificar cache primero
    if (dashboardCache.data && new Date() - dashboardCache.lastUpdated < dashboardCache.ttl) {
      return res.json(dashboardCache.data);
    }

    const pool = await getPool();
    
    // Ejecutar todas las consultas en paralelo
    const [
      salesMetrics,
      topProducts,
      recentOrders,
      customersMetrics,
      geographicData
    ] = await Promise.all([
      getSalesMetrics(pool),
      getTopProducts(pool),
      getRecentOrders(pool),
      getCustomersMetrics(pool),
      getGeographicData(pool)
    ]);

    const result = {
      salesMetrics,
      topProducts,
      recentOrders,
      customersMetrics,
      geographicData,
      lastUpdated: new Date().toISOString()
    };

    // Actualizar cache
    dashboardCache.data = result;
    dashboardCache.lastUpdated = new Date();

    res.json(result);
  } catch (err) {
    console.error('❌ Error getDashboardMetrics:', err);
    res.status(500).json({ error: 'Error al obtener métricas', detalle: err.message });
  }
};

// Operaciones CRUD
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

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = await getPool();
    
    const [order, items] = await Promise.all([
      pool.request()
        .input('orderId', sql.Int, orderId)
        .query('SELECT * FROM SalesLT.SalesOrderHeader WHERE SalesOrderID = @orderId'),
      pool.request()
        .input('orderId', sql.Int, orderId)
        .query(`
          SELECT 
            sod.*, 
            p.Name AS ProductName,
            p.ProductNumber
          FROM SalesLT.SalesOrderDetail sod
          JOIN SalesLT.Product p ON sod.ProductID = p.ProductID
          WHERE sod.SalesOrderID = @orderId
        `)
    ]);

    if (!order.recordset.length) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({
      ...order.recordset[0],
      items: items.recordset
    });
  } catch (err) {
    console.error('❌ Error getOrderDetails:', err);
    res.status(500).json({ message: 'Error consultando pedido', error: err.message });
  }
};

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

// Exportar todas las funciones que se usan en las rutas
module.exports = {
  getDashboardMetrics,
  createOrder,
  getOrderDetails,
  updateOrder,
  deleteOrder
};