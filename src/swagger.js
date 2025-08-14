const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AdventureWorks Dashboard API',
      version: '1.0.0',
      description: 'API para el dashboard de AdventureWorksLT2022',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor local'
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Ruta corregida a tus archivos de rutas
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(specs, {
      explorer: true,
      customSiteTitle: "AdventureWorks API Docs"
    })
  );
};