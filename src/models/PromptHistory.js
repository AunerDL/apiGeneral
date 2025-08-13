const mongoose = require('mongoose');

const PromptHistorySchema = new mongoose.Schema({
  userId: { type: String, default: null },
  prompt: { type: String, required: true },
  externalRequest: { type: Object, default: null }, // lo que enviamos
  externalResponse: { type: Object, default: null }, // lo que recibimos
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PromptHistory', PromptHistorySchema);
