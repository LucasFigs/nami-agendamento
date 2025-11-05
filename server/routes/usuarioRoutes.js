const express = require('express');
const {
    atualizarPerfil,
    listarUsuarios,
    buscarUsuarioPorId,
    desativarConta
} = require('../controllers/usuarioController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas para usuário atual
router.put('/perfil', proteger, atualizarPerfil);
router.delete('/perfil', proteger, desativarConta);

// Rotas admin (apenas admin)
router.get('/', proteger, adminOnly, listarUsuarios);
router.get('/:id', proteger, adminOnly, buscarUsuarioPorId);

module.exports = router;