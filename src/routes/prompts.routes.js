const express = require('express');
const { sendPrompt, getHistory } = require('../controllers/prompts.controller');
const router = express.Router();

router.post('/', sendPrompt);         // enviar prompt a la API externa
router.get('/history', getHistory);   // ver historial en Mongo

module.exports = router;
