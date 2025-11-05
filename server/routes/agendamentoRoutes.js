const express = require('express');
const { 
    criarAgendamento, 
    listarAgendamentos,
    cancelarAgendamento,
    listarTodosAgendamentos
} = require('../controllers/agendamentoController');

const proteger = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', proteger, criarAgendamento);
router.get('/', proteger, listarAgendamentos);
router.get('/todos', proteger, listarTodosAgendamentos); // Para admin ver todos
router.put('/:id/cancelar', proteger, cancelarAgendamento);

module.exports = router;