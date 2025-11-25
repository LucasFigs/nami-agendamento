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

// @desc    Buscar histórico de consultas do usuário logado
// @route   GET /api/usuarios/historico-consultas
// @access  Private
exports.getHistoricoConsultas = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        
        // Buscar agendamentos do usuário
        const Agendamento = require('../models/Agendamento');
        const agendamentos = await Agendamento.find({ 
            paciente: usuarioId 
        })
        .populate('medico', 'nome especialidade consultorio')
        .sort({ data: -1, horario: -1 });

        // Formatar resposta
        const historicoFormatado = agendamentos.map(agendamento => ({
            _id: agendamento._id,
            data: agendamento.data,
            horario: agendamento.horario,
            status: agendamento.status,
            tipoConsulta: 'presencial', // Default por enquanto
            medico: {
                nome: agendamento.medico.nome,
                especialidade: agendamento.especialidade || agendamento.medico.especialidade
            },
            observacoes: agendamento.observacoes
        }));

        res.json(historicoFormatado);

    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico de consultas',
            error: error.message
        });
    }
};

// @desc    Buscar dados do usuário logado
// @route   GET /api/usuarios/meus-dados
// @access  Private
exports.getMeusDados = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const usuario = await Usuario.findById(usuarioId).select('-senha');

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
        console.error('Erro ao buscar dados do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados do usuário',
            error: error.message
        });
    }
};

// @desc    Alterar senha do usuário logado
// @route   PUT /api/usuarios/alterar-senha
// @access  Private
exports.alterarSenha = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { senhaAtual, novaSenha } = req.body;

        console.log('Alterando senha para usuário:', usuarioId);

        // Buscar usuário com senha
        const usuario = await Usuario.findById(usuarioId).select('+senha');

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar senha atual
        const isSenhaCorreta = await usuario.compararSenha(senhaAtual);
        if (!isSenhaCorreta) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        // Atualizar senha
        usuario.senha = novaSenha;
        await usuario.save();

        console.log('Senha alterada com sucesso para usuário:', usuarioId);

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao alterar senha',
            error: error.message
        });
    }
};

// @desc    Listar todos os usuários (apenas admin)
// @route   GET /api/usuarios/todos
// @access  Private/Admin
exports.getTodosUsuarios = async (req, res) => {
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

// @desc    Ativar/desativar usuário
// @route   PUT /api/usuarios/:id/toggle-status
// @access  Private/Admin
exports.toggleUsuarioStatus = async (req, res) => {
    try {
        const usuarioId = req.params.id;
        
        const usuario = await Usuario.findById(usuarioId);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Não permitir desativar a si mesmo
        if (usuarioId === req.usuario.id) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível desativar sua própria conta'
            });
        }

        usuario.ativo = !usuario.ativo;
        await usuario.save();

        res.json({
            success: true,
            message: `Usuário ${usuario.ativo ? 'ativado' : 'desativado'} com sucesso`,
            data: usuario
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao alterar status do usuário',
            error: error.message
        });
    }
};

// @desc    Resetar senha do usuário
// @route   PUT /api/usuarios/:id/resetar-senha
// @access  Private/Admin
exports.resetarSenha = async (req, res) => {
    try {
        const usuarioId = req.params.id;
        
        const usuario = await Usuario.findById(usuarioId);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Resetar para senha padrão
        const senhaPadrao = '123456'; // Senha padrão
        usuario.senha = senhaPadrao;
        await usuario.save();

        res.json({
            success: true,
            message: 'Senha resetada com sucesso. Nova senha: 123456',
            data: { id: usuario._id }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao resetar senha',
            error: error.message
        });
    }
};

// @desc    Criar administrador
// @route   POST /api/usuarios/admin
// @access  Private/Admin
exports.criarAdmin = async (req, res) => {
    try {
        const { nome, email, telefone, senha } = req.body;

        // Verificar se usuário já existe
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({
                success: false,
                message: 'Usuário já existe com este email'
            });
        }

        // Criar admin
        const admin = await Usuario.create({
            nome,
            email,
            telefone,
            senha,
            tipo: 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Administrador criado com sucesso',
            data: {
                id: admin._id,
                nome: admin.nome,
                email: admin.email,
                tipo: admin.tipo
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar administrador',
            error: error.message
        });
    }
};

// @desc    Criar administrador
// @route   POST /api/usuarios/admin
// @access  Private/Admin
exports.criarAdmin = async (req, res) => {
    try {
        const { nome, email, telefone, senha } = req.body;

        console.log('📝 Tentando criar admin:', { nome, email });

        // Verificar se usuário já existe
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({
                success: false,
                message: 'Usuário já existe com este email'
            });
        }

        // Criar admin
        const admin = await Usuario.create({
            nome,
            email,
            telefone,
            senha,
            tipo: 'admin'
        });

        console.log('✅ Admin criado com sucesso:', admin._id);

        res.status(201).json({
            success: true,
            message: 'Administrador criado com sucesso',
            data: {
                id: admin._id,
                nome: admin.nome,
                email: admin.email,
                tipo: admin.tipo
            }
        });

    } catch (error) {
        console.error('❌ Erro ao criar administrador:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar administrador',
            error: error.message
        });
    }
};