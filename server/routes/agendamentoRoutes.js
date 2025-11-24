const express = require('express');
const { 
    criarAgendamento, 
    listarAgendamentos,
    cancelarAgendamento,
    listarTodosAgendamentos,
    getAgendamentosPaciente,
     getAgendamentosMedico
} = require('../controllers/agendamentoController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas para pacientes
router.post('/', proteger, criarAgendamento);
router.get('/paciente', proteger, getAgendamentosPaciente); // Paciente vê só os dele

// Rotas para médicos
router.get('/medico', proteger, getAgendamentosMedico); // ← NOVA ROTA: Médico vê consultas dele

// Rotas para admin
router.get('/todos', proteger, adminOnly, listarTodosAgendamentos); // Admin vê tudo

// Rotas comuns
router.get('/', proteger, listarAgendamentos);
router.put('/:id/cancelar', proteger, cancelarAgendamento);

module.exports = router;