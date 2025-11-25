const Agendamento = require('../models/Agendamento');
const Medico = require('../models/Medico');

// @desc    Criar agendamento
// @route   POST /api/agendamentos
// @access  Private
exports.criarAgendamento = async (req, res) => {
    try {
        const { medicoid, data, horario } = req.body;
        const pacientoid = req.usuario.id;

        console.log('Data recebida do frontend:', data);

        // CORREÇÃO: Garantir que a data seja salva como UTC
        const dataUTC = new Date(data + 'T12:00:00Z'); // Usar meio-dia UTC
        
        console.log('Data que será salva no banco (UTC):', dataUTC);

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
            data: dataUTC,
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
            data: dataUTC, // ← Salvar como UTC
            horario: horario,
            especialidade: medico.especialidade
        });

        console.log('Agendamento criado com sucesso:', agendamento._id);

        res.status(201).json({
            success: true,
            message: 'Agendamento criado com sucesso',
            data: agendamento
        });

    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
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

// @desc    Get agendamentos do paciente (formato que o frontend espera)
// @route   GET /api/agendamentos/paciente
// @access  Private
exports.getAgendamentosPaciente = async (req, res) => {
    try {
        const usuarioid = req.usuario.id;
        
        // Buscar agendamentos com populate CORRETO
        const agendamentos = await Agendamento.find({ paciente: usuarioid })
            .populate({
                path: 'medico',
                select: 'especialidade consultorio usuario',
                populate: {
                    path: 'usuario',
                    select: 'nome email telefone'
                }
            })
            .sort({ data: 1 });

        console.log('Agendamentos com populate CORRETO:', JSON.stringify(agendamentos, null, 2));

        // Formatar resposta
        const agendamentosFormatados = agendamentos.map(agendamento => {
            const dataObj = new Date(agendamento.data);
            const dataFormatada = dataObj.toISOString().split('T')[0];

            // CORREÇÃO: Acessar o nome do médico corretamente
            const nomeMedico = agendamento.medico?.usuario?.nome || 'Dr. Nome não disponível';
            const especialidadeMedico = agendamento.medico?.especialidade || 'Especialidade não informada';

            return {
                _id: agendamento._id,
                data: dataFormatada,
                horario: agendamento.horario,
                status: agendamento.status,
                tipoConsulta: 'presencial',
                medico: {
                    nome: nomeMedico,
                    especialidade: especialidadeMedico
                },
                observacoes: agendamento.observacoes
            };
        });

        console.log('Agendamentos formatados FINAIS:', JSON.stringify(agendamentosFormatados, null, 2));
        res.json(agendamentosFormatados);

    } catch (error) {
        console.error('Erro completo no getAgendamentosPaciente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar agendamentos',
            error: error.message
        });
    }
};

// @desc    Reagendar consulta
// @route   PUT /api/agendamentos/:id/reagendar
// @access  Private
exports.reagendarAgendamento = async (req, res) => {
  try {
    const { data, horario } = req.body;
    const agendamentoId = req.params.id;
    const usuarioId = req.usuario.id;

    const agendamento = await Agendamento.findById(agendamentoId);

    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar se o usuário é o dono do agendamento
    if (agendamento.paciente.toString() !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Verificar se novo horário está disponível
    const conflito = await Agendamento.findOne({
      medico: agendamento.medico,
      data: data,
      horario: horario,
      status: { $in: ['agendado', 'confirmado'] },
      _id: { $ne: agendamentoId }
    });

    if (conflito) {
      return res.status(400).json({
        success: false,
        message: 'Novo horário já está ocupado'
      });
    }

    // Atualizar agendamento
    agendamento.data = data;
    agendamento.horario = horario;
    await agendamento.save();

    res.json({
      success: true,
      message: 'Consulta reagendada com sucesso',
      data: agendamento
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao reagendar consulta',
      error: error.message
    });
  }
};

// @desc    Get agendamentos do médico logado
// @route   GET /api/agendamentos/medico
// @access  Private (Médico)
exports.getAgendamentosMedico = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        
        // Buscar o médico associado a este usuário
        const Medico = require('../models/Medico');
        const medico = await Medico.findOne({ usuario: usuarioId });
        
        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico não encontrado'
            });
        }

        // Buscar agendamentos deste médico
        const agendamentos = await Agendamento.find({ 
            medico: medico._id 
        })
        .populate('paciente', 'nome email telefone')
        .populate('medico', 'nome especialidade consultorio')
        .sort({ data: -1, horario: -1 });

        // Formatar resposta
        const agendamentosFormatados = agendamentos.map(agendamento => {
            const dataObj = new Date(agendamento.data);
            const dataFormatada = dataObj.toISOString().split('T')[0];

            return {
                _id: agendamento._id,
                data: dataFormatada,
                horario: agendamento.horario,
                status: agendamento.status,
                tipoConsulta: 'presencial',
                paciente: {
                    nome: agendamento.paciente.nome,
                    email: agendamento.paciente.email,
                    telefone: agendamento.paciente.telefone
                },
                medico: {
                    nome: agendamento.medico.nome,
                    especialidade: agendamento.especialidade || agendamento.medico.especialidade
                },
                observacoes: agendamento.observacoes
            };
        });

        res.json(agendamentosFormatados);

    } catch (error) {
        console.error('Erro ao buscar agendamentos do médico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar agendamentos',
            error: error.message
        });
    }
};

// @desc    Listar todos os agendamentos (apenas admin)
// @route   GET /api/agendamentos/todos
// @access  Private/Admin
exports.getTodosAgendamentos = async (req, res) => {
    try {
        const agendamentos = await Agendamento.find()
            .populate('paciente', 'nome email telefone')
            .populate('medico', 'especialidade consultorio')
            .populate({
                path: 'medico',
                populate: {
                    path: 'usuario',
                    select: 'nome email'
                }
            })
            .sort({ data: -1, horario: -1 });

        // Formatar resposta para o frontend
        const agendamentosFormatados = agendamentos.map(agendamento => {
            const dataObj = new Date(agendamento.data);
            const dataFormatada = dataObj.toISOString().split('T')[0];

            return {
                _id: agendamento._id,
                data: dataFormatada,
                horario: agendamento.horario,
                status: agendamento.status,
                tipoConsulta: 'presencial',
                especialidade: agendamento.especialidade,
                paciente: {
                    nome: agendamento.paciente?.nome || 'Paciente não encontrado',
                    email: agendamento.paciente?.email || 'N/A',
                    telefone: agendamento.paciente?.telefone || 'N/A'
                },
                medico: {
                    nome: agendamento.medico?.usuario?.nome || 'Médico não encontrado',
                    especialidade: agendamento.medico?.especialidade || 'N/A'
                },
                observacoes: agendamento.observacoes
            };
        });

        res.json(agendamentosFormatados);

    } catch (error) {
        console.error('Erro ao listar todos os agendamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar agendamentos',
            error: error.message
        });
    }
};