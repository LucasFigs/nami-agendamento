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
    resetarSenha,
    atualizarUsuario,
    getEstatisticas
} = require('../controllers/usuarioController');

const proteger = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

// Rotas para usuário atual (SEM parâmetros :id primeiro)
router.put('/perfil', proteger, atualizarPerfil);
router.delete('/perfil', proteger, desativarConta);
router.get('/historico-consultas', proteger, getHistoricoConsultas);
router.get('/meus-dados', proteger, getMeusDados);
router.put('/alterar-senha', proteger, alterarSenha);

// ✅ ROTAS ADMIN - REORGANIZAR: rotas específicas PRIMEIRO
router.get('/todos', proteger, adminOnly, getTodosUsuarios);
router.post('/admin', proteger, adminOnly, criarAdmin);
// Adicione esta rota junto com as outras rotas admin
router.get('/estatisticas', proteger, adminOnly, getEstatisticas);

// ✅ ROTAS COM :id - Colocar DEPOIS das rotas específicas
router.put('/:id/toggle-status', proteger, adminOnly, toggleUsuarioStatus);
router.put('/:id/resetar-senha', proteger, adminOnly, resetarSenha);
router.put('/:id', proteger, adminOnly, atualizarUsuario); // ✅ AGORA VAI FUNCIONAR

// Rotas admin existentes (manter no final)
router.get('/', proteger, adminOnly, listarUsuarios);
router.get('/:id', proteger, adminOnly, buscarUsuarioPorId);

module.exports = router;