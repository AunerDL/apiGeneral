// server.js
require('dotenv').config();
const app = require('./app');
const { getPool, close } = require('./config/sqlserver');

const PORT = process.env.PORT || 5000;

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  console.log('\n🔴 Recibido SIGINT. Cerrando servidor...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔴 Recibido SIGTERM. Cerrando servidor...');
  await close();
  process.exit(0);
});

// Iniciar servidor con manejo de errores
(async () => {
  try {
    // Verificar conexiones antes de iniciar
    await getPool();
    
    app.listen(PORT, () => {
      console.log(`🚀 API Dashboard ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Endpoints disponibles:`);
      console.log(`- GET /api/sql/dashboard/metrics`);
      console.log(`- GET /api/sql/orders/:orderId`);
      console.log(`- POST /api/sql/orders`);
    });
  } catch (err) {
    console.error('⛔ No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
})();