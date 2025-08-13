const sql = require('mssql');

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, // Puede ser "10.231.217.15"
  port: parseInt(process.env.SQL_PORT || '1424'), // Puerto separado
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false, // Ajustar según entorno (true si usas Azure)
    enableArithAbort: true,
    trustServerCertificate: true // Evita errores SSL en desarrollo
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 100000
  }
};
  
let poolPromise;

module.exports = async function connectSql() {
  try {
    poolPromise = await sql.connect(config);
    console.log(`✅ Conectado a SQL Server en ${process.env.SQL_SERVER}:${process.env.SQL_PORT}`);
    return poolPromise;
  } catch (err) {
    console.error('❌ Error SQL Server:', err);
    process.exit(1);
  }
};

module.exports.sql = sql;
module.exports.getPool = () => sql.connect(config);
