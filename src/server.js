require('dotenv').config();
const app = require('./app');
const connectMongo = require('./config/mongo');
const connectSql = require('./config/sqlserver');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectMongo();
  await connectSql(); // esto solo crea pool, no bloquea ejecucion
  app.listen(PORT, () => console.log(`API central en http://localhost:${PORT}`));
})();
