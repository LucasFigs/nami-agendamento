const express = require('express');
const {
    listarMedicos,
    buscarMedicoPorId,
    criarMedico,
    atualizarMedico,
    deletarMedico,
    buscarHorariosDisponiveis,
    buscarMedicosPorEspecialidade
} = require('../controllers/medicoController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas públicas
router.get('/', listarMedicos);
router.get('/:id', buscarMedicoPorId);
router.get('/:id/horarios-disponiveis', buscarHorariosDisponiveis);
router.get('/especialidade/:especialidade', buscarMedicosPorEspecialidade);

// Rotas protegidas - apenas admin
router.post('/', proteger, adminOnly, criarMedico);
router.put('/:id', proteger, adminOnly, atualizarMedico);
router.delete('/:id', proteger, adminOnly, deletarMedico);

module.exports = router;