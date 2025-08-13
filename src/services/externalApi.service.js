const axios = require('axios');

async function sendPromptToExternalApi(prompt, metadata = {}) {
  const url = process.env.EXTERNAL_API_URL;
  // estructura que la API externa espera; ajusta según tu API
  const body = { prompt, metadata };

  const resp = await axios.post(url, body, { timeout: 120000 }); // 2 minutos
  return resp.data;
}

module.exports = { sendPromptToExternalApi };
