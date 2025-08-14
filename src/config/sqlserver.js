// config/sqlserver.js
const sql = require('mssql');

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true, // Siempre usar en producción
    trustServerCertificate: true, // Solo para desarrollo
    enableArithAbort: true
  },
  pool: {
    max: 20, // Aumentar para dashboard
    min: 5,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000
  }
};

let pool;

async function getPool() {
  if (pool) return pool;
  
  try {
    pool = await new sql.ConnectionPool(config).connect();
    console.log(`✅ Conectado a SQL Server en ${config.server}:${config.port}`);
    return pool;
  } catch (err) {
    console.error('❌ Error SQL Server:', err);
    throw err;
  }
}

// Manejador de errores global para la conexión
sql.on('error', err => {
  console.error('SQL Server Error:', err);
  // Aquí podrías implementar reconexión automática
});

module.exports = {
  sql,
  getPool,
  close: async () => {
    if (pool) {
      await pool.close();
      pool = null;
    }
  }
};