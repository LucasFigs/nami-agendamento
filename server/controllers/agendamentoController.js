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