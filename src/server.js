require('dotenv').config();
const app = require('./app');
const connectMongo = require('./config/mongo');
const { getPool } = require('./config/sqlserver');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectMongo();
  await getPool(); // esto abre la conexión
  app.listen(PORT, () => console.log(`API central en http://localhost:${PORT}`));
})();

