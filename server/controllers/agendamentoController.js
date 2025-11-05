const Agendamento = require('../models/Agendamento');
const Medico = require('../models/Medico');

// @desc    Criar agendamento
// @route   POST /api/agendamentos
// @access  Private
exports.criarAgendamento = async (req, res) => {
    try {
        const { medicoid, data, horario } = req.body;
        const pacientoid = req.usuario.id; // Do middleware de auth

        // Verificar se médico existe
        const medico = await Medico.findById(medicoid);
        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico não encontrado'
            });
        }

        // Verificar se horário está disponível
        const agendamentoConflitante = await Agendamento.findOne({
            medico: medicoid,
            data: data,
            horario: horario,
            status: { $in: ['agendado', 'confirmado'] }
        });

        if (agendamentoConflitante) {
            return res.status(400).json({
                success: false,
                message: 'Horário já ocupado'
            });
        }

        // Criar agendamento
        const agendamento = await Agendamento.create({
            paciente: pacientoid,
            medico: medicoid,
            data: data,
            horario: horario,
            especialidade: medico.especialidade
        });

        res.status(201).json({
            success: true,
            message: 'Agendamento criado com sucesso',
            data: agendamento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar agendamento',
            error: error.message
        });
    }
};

// @desc    Listar agendamentos do usuário
// @route   GET /api/agendamentos
// @access  Private
exports.listarAgendamentos = async (req, res) => {
    try {
        const usuarioid = req.usuario.id;
        const agendamentos = await Agendamento.find({ paciente: usuarioid })
            .populate('medico', 'especialidade consultorio')
            .sort({ data: 1 });

        res.json({
            success: true,
            count: agendamentos.length,
            data: agendamentos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao listar agendamentos',
            error: error.message
        });
    }
};

exports.cancelarAgendamento = async (req, res) => {
    try {
        const agendamentoId = req.params.id;
        const usuarioId = req.usuario.id;

        const agendamento = await Agendamento.findById(agendamentoId);

        if (!agendamento) {
            return res.status(404).json({
                success: false,
                message: 'Agendamento não encontrado'
            });
        }

        // Verificar se o usuário é o paciente dono do agendamento
        if (agendamento.paciente.toString() !== usuarioId) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Este agendamento não pertence a você.'
            });
        }

        // Verificar se já não está cancelado
        if (agendamento.status === 'cancelado') {
            return res.status(400).json({
                success: false,
                message: 'Agendamento já está cancelado'
            });
        }

        agendamento.status = 'cancelado';
        await agendamento.save();

        res.json({
            success: true,
            message: 'Agendamento cancelado com sucesso',
            data: agendamento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao cancelar agendamento',
            error: error.message
        });
    }
};

// @desc    Listar todos os agendamentos (admin)
// @route   GET /api/agendamentos/todos
// @access  Private/Admin
exports.listarTodosAgendamentos = async (req, res) => {
    try {
        const agendamentos = await Agendamento.find()
            .populate('paciente', 'nome email')
            .populate('medico', 'especialidade consultorio')
            .sort({ data: -1 });

        res.json({
            success: true,
            count: agendamentos.length,
            data: agendamentos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao listar agendamentos',
            error: error.message
        });
    }
};