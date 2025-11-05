const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para proteger rotas
const proteger = async (req, res, next) => {
    try {
        let token;

        // Verificar se o token está no header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Verificar se o token existe
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Acesso negado. Token não fornecido.'
            });
        }

        // Verificar token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Buscar usuário pelo ID do token
            const usuario = await Usuario.findById(decoded.id).select('-senha');
            
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido. Usuário não encontrado.'
                });
            }

            // Adicionar usuário ao request
            req.usuario = usuario;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro no servidor',
            error: error.message
        });
    }
};

module.exports = proteger;