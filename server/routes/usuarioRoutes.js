const express = require('express');
const {
    atualizarPerfil,
    listarUsuarios,
    buscarUsuarioPorId,
    desativarConta,
    getHistoricoConsultas,
    getMeusDados,
    alterarSenha
} = require('../controllers/usuarioController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas para usuário atual
router.put('/perfil', proteger, atualizarPerfil);
router.delete('/perfil', proteger, desativarConta);
router.get('/historico-consultas', proteger, getHistoricoConsultas);
router.get('/meus-dados', proteger, getMeusDados);
router.put('/alterar-senha', proteger, alterarSenha);

// Rotas admin (apenas admin)
router.get('/', proteger, adminOnly, listarUsuarios);
router.get('/:id', proteger, adminOnly, buscarUsuarioPorId);

module.exports = router;