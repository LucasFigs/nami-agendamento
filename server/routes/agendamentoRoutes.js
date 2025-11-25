const express = require('express');
const { 
    criarAgendamento, 
    listarAgendamentos,
    cancelarAgendamento,
    listarTodosAgendamentos,
    getAgendamentosPaciente,
    getAgendamentosMedico,
    getTodosAgendamentos,
    cancelarAgendamentoAdmin,
    getRelatorios,
    getEstatisticasStatus,
    // ✅ ADICIONAR AS NOVAS FUNÇÕES
    getMeusAgendamentos,
    adicionarObservacoes,
    marcarComoRealizado
} = require('../controllers/agendamentoController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas para pacientes
router.post('/', proteger, criarAgendamento);
router.get('/paciente', proteger, getAgendamentosPaciente);

// Rotas para médicos
router.get('/medico', proteger, getAgendamentosMedico);

// ✅ NOVAS ROTAS PARA MÉDICOS - Funcionalidades completas
router.get('/medico/meus-agendamentos', proteger, getMeusAgendamentos);
router.put('/:id/observacoes', proteger, adicionarObservacoes);
router.put('/:id/realizado', proteger, marcarComoRealizado);

// ✅ ROTAS ADMIN
router.get('/todos', proteger, adminOnly, getTodosAgendamentos);
router.put('/:id/cancelar-admin', proteger, adminOnly, cancelarAgendamentoAdmin);
router.get('/relatorios', proteger, adminOnly, getRelatorios);
router.get('/estatisticas-status', proteger, adminOnly, getEstatisticasStatus);

// Rotas comuns
router.get('/', proteger, listarAgendamentos);
router.put('/:id/cancelar', proteger, cancelarAgendamento);

module.exports = router;