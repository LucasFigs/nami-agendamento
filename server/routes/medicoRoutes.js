const express = require('express');
const {
    listarMedicos,
    buscarMedicoPorId,
    buscarMedicosPorEspecialidade,
    criarMedico,
    atualizarMedico,
    deletarMedico,
    buscarHorariosDisponiveis
} = require('../controllers/medicoController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas públicas
router.get('/', listarMedicos);
router.get('/especialidade/:especialidade', buscarMedicosPorEspecialidade);
router.get('/:id', buscarMedicoPorId);
router.get('/:id/horarios-disponiveis', buscarHorariosDisponiveis);

// Rotas protegidas - apenas admin
router.post('/', proteger, adminOnly, criarMedico);
router.put('/:id', proteger, adminOnly, atualizarMedico);
router.delete('/:id', proteger, adminOnly, deletarMedico);

module.exports = router;