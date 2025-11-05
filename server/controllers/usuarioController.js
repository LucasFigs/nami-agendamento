const Usuario = require('../models/Usuario');

// @desc    Atualizar próprio perfil
// @route   PUT /api/usuarios/perfil
// @access  Private
exports.atualizarPerfil = async (req, res) => {
    try {
        const { nome, telefone, email } = req.body;
        const usuarioId = req.usuario.id;

        const usuario = await Usuario.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Atualizar campos
        if (nome) usuario.nome = nome;
        if (telefone) usuario.telefone = telefone;
        if (email) {
            // Verificar se email já existe
            const emailExiste = await Usuario.findOne({ email, _id: { $ne: usuarioId } });
            if (emailExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
            usuario.email = email;
        }

        await usuario.save();

        const usuarioAtualizado = await Usuario.findById(usuarioId).select('-senha');

        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            data: usuarioAtualizado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar perfil',
            error: error.message
        });
    }
};

// @desc    Listar todos os usuários (apenas admin)
// @route   GET /api/usuarios
// @access  Private/Admin
exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find()
            .select('-senha')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: usuarios.length,
            data: usuarios
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao listar usuários',
            error: error.message
        });
    }
};

// @desc    Buscar usuário por ID
// @route   GET /api/usuarios/:id
// @access  Private/Admin
exports.buscarUsuarioPorId = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-senha');

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            data: usuario
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário',
            error: error.message
        });
    }
};

// @desc    Desativar própria conta
// @route   DELETE /api/usuarios/perfil
// @access  Private
exports.desativarConta = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const usuario = await Usuario.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        usuario.ativo = false;
        await usuario.save();

        res.json({
            success: true,
            message: 'Conta desativada com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao desativar conta',
            error: error.message
        });
    }
};