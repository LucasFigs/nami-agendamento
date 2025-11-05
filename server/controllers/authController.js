const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

const gerarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Registrar usuario
// @route   POST /api/auth/registro
// @access  Public
exports.registrar = async (req, res) => {
    try {
        const { nome, email, senha, tipo, matricula, telefone } = req.body;

        // Verificar se usuario existe
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({
                success: false,
                message: 'Usuário já existe com este email'
            });
        }

        // Criar usuario
        const usuario = await Usuario.create({
            nome,
            email,
            senha,
            tipo,
            matricula,
            telefone
        });

        // Gerar token
        const token = gerarToken(usuario._id);

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro no servidor',
            error: error.message
        });
    }
};

// @desc    Login usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verificar se usuário existe e senha está correta
        const usuario = await Usuario.findOne({ email }).select('+senha');

        if (usuario && (await usuario.compararSenha(senha))) {
            const token = gerarToken(usuario._id);

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                token,
                usuario: {
                    id: usuario._id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Email ou senha inválidos'
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