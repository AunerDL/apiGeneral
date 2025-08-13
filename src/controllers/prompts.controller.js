const PromptHistory = require('../models/PromptHistory');
const { sendPromptToExternalApi } = require('../services/externalApi.service');

const sendPrompt = async (req, res) => {
  try {
    const { prompt, metadata } = req.body;
    if (!prompt) return res.status(400).json({ message: 'prompt requerido' });

    // guardamos petición inicial (opcional)
    const hist = new PromptHistory({ prompt, externalRequest: { prompt, metadata } });
    await hist.save();

    // enviamos a API externa
    const externalResponse = await sendPromptToExternalApi(prompt, metadata);

    // guardamos respuesta
    hist.externalResponse = externalResponse;
    await hist.save();

    return res.json({ success: true, data: externalResponse, historyId: hist._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error enviando prompt', error: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const list = await PromptHistory.find().sort({ createdAt: -1 }).limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo historial', error: err.message });
  }
};

module.exports = { sendPrompt, getHistory };
