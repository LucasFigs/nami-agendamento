// middleware/medicoMiddleware.js
const Medico = require('../models/Medico');

// Middleware para verificar se o usuário é médico
const medicoOnly = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    
    const medico = await Medico.findOne({ usuario: usuarioId });
    
    if (!medico) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas médicos podem acessar esta rota.'
      });
    }
    
    req.medico = medico;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões de médico',
      error: error.message
    });
  }
};

module.exports = medicoOnly;