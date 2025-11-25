const express = require('express');
const {
    atualizarPerfil,
    listarUsuarios,
    buscarUsuarioPorId,
    desativarConta,
    getHistoricoConsultas,
    getMeusDados,
    alterarSenha,
    getTodosUsuarios,      
    criarAdmin,            
    toggleUsuarioStatus,   
    resetarSenha
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

// ✅ NOVAS ROTAS ADMIN (apenas admin)
router.get('/todos', proteger, adminOnly, getTodosUsuarios);
router.post('/admin', proteger, adminOnly, criarAdmin);
router.put('/:id/toggle-status', proteger, adminOnly, toggleUsuarioStatus);
router.put('/:id/resetar-senha', proteger, adminOnly, resetarSenha);

// Rotas admin (apenas admin) - mantendo as existentes
router.get('/', proteger, adminOnly, listarUsuarios);
router.get('/:id', proteger, adminOnly, buscarUsuarioPorId);

module.exports = router;