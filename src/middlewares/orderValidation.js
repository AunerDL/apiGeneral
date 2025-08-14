// src/middlewares/orderValidation.js
const validateOrder = (req, res, next) => {
  const { CustomerID, OrderDate, TotalDue } = req.body;
  
  if (!CustomerID || !OrderDate || !TotalDue) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos',
      details: {
        required: ['CustomerID', 'OrderDate', 'TotalDue'],
        received: req.body
      }
    });
  }
  
  next();
};

module.exports = { validateOrder };