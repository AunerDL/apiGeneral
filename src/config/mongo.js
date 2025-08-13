const mongoose = require('mongoose');

module.exports = async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Mongo conectado (historial)');
  } catch (err) {
    console.error('❌ Error Mongo:', err);
    process.exit(1);
  }
};
