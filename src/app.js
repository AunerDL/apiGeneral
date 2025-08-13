const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const promptsRoutes = require('./routes/prompts.routes');
const sqlRoutes = require('./routes/sql.routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/prompts', promptsRoutes);
app.use('/api/sql', sqlRoutes);

module.exports = app;
