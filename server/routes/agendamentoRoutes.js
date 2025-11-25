// No arquivo server/routes/agendamentoRoutes.js, adicione:

const express = require('express');
const { 
    criarAgendamento, 
    listarAgendamentos,
    cancelarAgendamento,
    listarTodosAgendamentos, // ← ADICIONAR ESTA IMPORT
    getAgendamentosPaciente,
    getAgendamentosMedico,
    getTodosAgendamentos,
    cancelarAgendamentoAdmin,
    getRelatorios,
    getEstatisticasStatus
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
router.put('/:id/cancelar-admin', proteger, adminOnly, cancelarAgendamentoAdmin);
// Adicione esta rota
router.get('/relatorios', proteger, adminOnly, getRelatorios);
router.get('/estatisticas-status', proteger, adminOnly, getEstatisticasStatus);

// Rotas comuns
router.get('/', proteger, listarAgendamentos);
router.put('/:id/cancelar', proteger, cancelarAgendamento);

module.exports = router;