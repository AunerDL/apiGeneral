const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const setupSwagger = require('./swagger');
const promptsRoutes = require('./routes/prompts.routes');
const sqlRoutes = require('./routes/sql.routes');

const app = express();

// Configuración mejorada de middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Documentación Swagger
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// Rutas
app.use('/api/prompts', promptsRoutes);
app.use('/api/sql', sqlRoutes);

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;