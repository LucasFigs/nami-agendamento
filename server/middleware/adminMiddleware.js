const adminOnly = (req, res, next) => {
    try {
        if (req.usuario && req.usuario.tipo === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro de autorização',
            error: error.message
        });
    }
};

module.exports = adminOnly;