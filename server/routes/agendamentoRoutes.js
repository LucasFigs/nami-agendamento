const express = require('express');
const { criarAgendamento, listarAgendamentos } = require('../controllers/agendamentoController');
const proteger = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', proteger, criarAgendamento);
router.get('/', proteger, listarAgendamentos);

module.exports = router;