const sql = require('mssql');

// Convertir las opciones de cadena a objeto
const parseOptions = (optionsString) => {
  return optionsString.split(';').reduce((acc, option) => {
    const [key, value] = option.split('=');
    if (key && value) {
      acc[key] = value === 'true';
    }
    return acc;
  }, {});
};

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  options: {
    ...parseOptions(process.env.SQL_OPTIONS),
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 120000
  }
};

async function connectSql() {
  try {
    await sql.connect(config);
    console.log(`✅ Conectado a SQL Server en ${config.server}:${config.port}`);
  } catch (err) {
    console.error('❌ Error SQL Server:', err.message);
    // No salgas del proceso inmediatamente, permite reintentos
    throw err;
  }
}

// Conexión de prueba al iniciar
connectSql().catch(console.error);

module.exports = {
  sql,
  getPool: () => sql, // Ya está conectado globalmente
  connectSql,
  close: async () => await sql.close()
};