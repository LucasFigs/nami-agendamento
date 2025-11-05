const express = require('express');
const router = express.Router();

// Rota temporária
router.get('/', (req, res) => {
  res.json({ message: 'Rota de agendamentos funcionando!' });
});

module.exports = router;