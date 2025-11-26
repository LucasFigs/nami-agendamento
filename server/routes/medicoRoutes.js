const express = require('express');
const {
    listarMedicos,
    buscarMedicoPorId,
    criarMedico,
    atualizarMedico,
    deletarMedico,
    buscarHorariosDisponiveis,
    buscarMedicosPorEspecialidade,
    getMeusDados,
    toggleMedicoStatus,
    criarMedicoCompleto
} = require('../controllers/medicoController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// ✅ CORREÇÃO: Rotas específicas PRIMEIRO
router.get('/meus-dados', proteger, getMeusDados); // ← DEVE VIR ANTES de /:id

// Rotas públicas
router.get('/', listarMedicos);
router.get('/:id/horarios-disponiveis', buscarHorariosDisponiveis);
router.get('/especialidade/:especialidade', buscarMedicosPorEspecialidade);

// Rotas com :id - devem vir DEPOIS das rotas específicas
router.get('/:id', buscarMedicoPorId);

// Rotas protegidas - apenas admin
router.post('/', proteger, adminOnly, criarMedico);
router.post('/completo', proteger, adminOnly, criarMedicoCompleto);
router.put('/:id', proteger, adminOnly, atualizarMedico);
router.put('/:id/toggle-status', proteger, adminOnly, toggleMedicoStatus);
router.delete('/:id', proteger, adminOnly, deletarMedico);

module.exports = router;