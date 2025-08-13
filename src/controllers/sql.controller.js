const { sql } = require('../config/sqlserver'); // import sql lib
// Usaremos mssql.Request con input() para parámetros

// Ejemplo: obtener filas desde SalesRecords con filtros
const getSales = async (req, res) => {
  try {
    const { region, country, itemType, limit } = req.query;

    const pool = await sql.connect(); // usa la conexión global de mssql
    const request = pool.request();

    // inputs parametrizados (evitan SQLi)
    if (region) request.input('region', sql.NVarChar(200), region);
    if (country) request.input('country', sql.NVarChar(200), country);
    if (itemType) request.input('itemType', sql.NVarChar(200), itemType);
    const top = parseInt(limit) || 100;

    // Construimos query dinámico pero con parámetros
    let where = [];
    if (region) where.push('Region = @region');
    if (country) where.push('Country = @country');
    if (itemType) where.push('ItemType = @itemType');

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const query = `SELECT TOP(${top}) * FROM dbo.SalesRecords ${whereSql};`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en consulta SQL', error: err.message });
  }
};

// Ejemplo: obtener registro por OrderID (param)
const getSaleByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ message: 'orderId requerido' });

    const pool = await sql.connect();
    const request = pool.request();
    request.input('orderId', sql.BigInt, orderId);

    const result = await request.query('SELECT * FROM dbo.SalesRecords WHERE OrderID = @orderId;');
    if (!result.recordset.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en consulta SQL', error: err.message });
  }
};

module.exports = { getSales, getSaleByOrderId };
