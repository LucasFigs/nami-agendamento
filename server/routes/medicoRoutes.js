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
    toggleMedicoStatus,           // ← ADICIONADA
    criarMedicoCompleto          // ← ADICIONADA
} = require('../controllers/medicoController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas públicas
router.get('/', listarMedicos);
router.get('/:id', buscarMedicoPorId);
router.get('/:id/horarios-disponiveis', buscarHorariosDisponiveis);
router.get('/especialidade/:especialidade', buscarMedicosPorEspecialidade);

// NOVA ROTA: Dados do médico logado
router.get('/meus-dados', proteger, getMeusDados);

// Rotas protegidas - apenas admin
router.post('/', proteger, adminOnly, criarMedico);
router.post('/completo', proteger, adminOnly, criarMedicoCompleto); // ← AGORA FUNCIONA
router.put('/:id', proteger, adminOnly, atualizarMedico);
router.put('/:id/toggle-status', proteger, adminOnly, toggleMedicoStatus); // ← AGORA FUNCIONA
router.delete('/:id', proteger, adminOnly, deletarMedico);

module.exports = router;