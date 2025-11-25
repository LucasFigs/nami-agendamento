// No arquivo server/routes/agendamentoRoutes.js, adicione:

const express = require('express');
const { 
    criarAgendamento, 
    listarAgendamentos,
    cancelarAgendamento,
    listarTodosAgendamentos, // ← ADICIONAR ESTA IMPORT
    getAgendamentosPaciente,
    getAgendamentosMedico,
    getTodosAgendamentos      // ← ADICIONAR ESTA IMPORT
} = require('../controllers/agendamentoController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas para pacientes
router.post('/', proteger, criarAgendamento);
router.get('/paciente', proteger, getAgendamentosPaciente);

// Rotas para médicos
router.get('/medico', proteger, getAgendamentosMedico);

// ✅ NOVA ROTA: Todos os agendamentos (apenas admin)
router.get('/todos', proteger, adminOnly, getTodosAgendamentos);

// Rotas comuns
router.get('/', proteger, listarAgendamentos);
router.put('/:id/cancelar', proteger, cancelarAgendamento);

module.exports = router;