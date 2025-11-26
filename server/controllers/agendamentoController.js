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

// ✅ ADICIONAR esta função no agendamentoController.js
// @desc    Cancelar agendamento (admin)
// @route   PUT /api/agendamentos/:id/cancelar-admin
// @access  Private/Admin
exports.cancelarAgendamentoAdmin = async (req, res) => {
    try {
        const agendamentoId = req.params.id;

        console.log('🛠️ Admin cancelando agendamento:', agendamentoId);

        const agendamento = await Agendamento.findById(agendamentoId)
            .populate('paciente', 'nome email')
            .populate('medico', 'nome especialidade');

        if (!agendamento) {
            return res.status(404).json({
                success: false,
                message: 'Agendamento não encontrado'
            });
        }

        // ✅ ADMIN pode cancelar QUALQUER agendamento, sem verificar proprietário

        // Verificar se já não está cancelado
        if (agendamento.status === 'cancelado') {
            return res.status(400).json({
                success: false,
                message: 'Agendamento já está cancelado'
            });
        }

        agendamento.status = 'cancelado';
        await agendamento.save();

        console.log('✅ Agendamento cancelado pelo admin:', agendamentoId);

        res.json({
            success: true,
            message: 'Agendamento cancelado com sucesso pelo administrador',
            data: agendamento
        });

    } catch (error) {
        console.error('❌ Erro ao cancelar agendamento (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cancelar agendamento',
            error: error.message
        });
    }
};

// @desc    Obter relatórios de consultas
// @route   GET /api/agendamentos/relatorios
// @access  Private/Admin
exports.getRelatorios = async (req, res) => {
    try {
        const { periodo = '30dias' } = req.query; // 7dias, 30dias, 90dias, 1ano
        
        console.log('📈 Gerando relatórios para período:', periodo);

        // Calcular datas baseadas no período
        const dataFim = new Date();
        const dataInicio = new Date();
        
        switch (periodo) {
            case '7dias':
                dataInicio.setDate(dataInicio.getDate() - 7);
                break;
            case '90dias':
                dataInicio.setDate(dataInicio.getDate() - 90);
                break;
            case '1ano':
                dataInicio.setFullYear(dataInicio.getFullYear() - 1);
                break;
            default: // 30 dias
                dataInicio.setDate(dataInicio.getDate() - 30);
        }

        dataInicio.setHours(0, 0, 0, 0);

        // Consultas por mês (últimos 6 meses)
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
        seisMesesAtras.setHours(0, 0, 0, 0);

        const consultasPorMes = await Agendamento.aggregate([
            {
                $match: {
                    data: { $gte: seisMesesAtras }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$data" },
                        month: { $month: "$data" }
                    },
                    total: { $sum: 1 },
                    realizadas: {
                        $sum: { $cond: [{ $eq: ["$status", "realizado"] }, 1, 0] }
                    },
                    canceladas: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelado"] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Médicos mais solicitados
        const medicosMaisSolicitados = await Agendamento.aggregate([
            {
                $group: {
                    _id: "$medico",
                    totalConsultas: { $sum: 1 },
                    consultasRealizadas: {
                        $sum: { $cond: [{ $eq: ["$status", "realizado"] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { totalConsultas: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "medicos",
                    localField: "_id",
                    foreignField: "_id",
                    as: "medicoInfo"
                }
            },
            {
                $unwind: "$medicoInfo"
            },
            {
                $lookup: {
                    from: "usuarios",
                    localField: "medicoInfo.usuario",
                    foreignField: "_id",
                    as: "usuarioInfo"
                }
            },
            {
                $unwind: "$usuarioInfo"
            },
            {
                $project: {
                    medico: "$usuarioInfo.nome",
                    especialidade: "$medicoInfo.especialidade",
                    totalConsultas: 1,
                    consultasRealizadas: 1,
                    taxaSucesso: {
                        $multiply: [
                            { $divide: ["$consultasRealizadas", "$totalConsultas"] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Horários mais populares
        const horariosPopulares = await Agendamento.aggregate([
            {
                $group: {
                    _id: "$horario",
                    total: { $sum: 1 }
                }
            },
            {
                $sort: { total: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Taxa de comparecimento
        const totalAgendamentos = await Agendamento.countDocuments({
            data: { $gte: dataInicio, $lte: dataFim }
        });
        
        const totalRealizados = await Agendamento.countDocuments({
            data: { $gte: dataInicio, $lte: dataFim },
            status: "realizado"
        });

        const taxaComparecimento = totalAgendamentos > 0 
            ? (totalRealizados / totalAgendamentos) * 100 
            : 0;

        console.log('✅ Relatórios gerados com sucesso');

        res.json({
            success: true,
            data: {
                periodo: {
                    inicio: dataInicio,
                    fim: dataFim
                },
                consultasPorMes: consultasPorMes.map(item => ({
                    mes: `${item._id.month}/${item._id.year}`,
                    total: item.total,
                    realizadas: item.realizadas,
                    canceladas: item.canceladas
                })),
                medicosMaisSolicitados,
                horariosPopulares,
                taxas: {
                    comparecimento: Math.round(taxaComparecimento * 100) / 100,
                    cancelamento: totalAgendamentos > 0 
                        ? Math.round(((totalAgendamentos - totalRealizados) / totalAgendamentos) * 100 * 100) / 100 
                        : 0
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao gerar relatórios:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao gerar relatórios',
            error: error.message
        });
    }
};

// ✅ FUNÇÃO ALTERNATIVA: Buscar status das consultas diretamente
// @desc    Obter estatísticas de status das consultas
// @route   GET /api/agendamentos/estatisticas-status
// @access  Private/Admin
exports.getEstatisticasStatus = async (req, res) => {
    try {
        const { periodo = '30dias' } = req.query;
        
        console.log('📊 Buscando estatísticas de status para período:', periodo);

        // Calcular datas
        const dataFim = new Date();
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 30); // Últimos 30 dias padrão
        dataInicio.setHours(0, 0, 0, 0);

        // Buscar contagem por status diretamente
        const statusCounts = await Agendamento.aggregate([
            {
                $match: {
                    data: { $gte: dataInicio, $lte: dataFim }
                }
            },
            {
                $group: {
                    _id: "$status",
                    total: { $sum: 1 }
                }
            }
        ]);

        console.log('✅ Estatísticas de status:', statusCounts);

        // Formatar resposta
        const estatisticas = {
            agendado: 0,
            realizado: 0,
            cancelado: 0,
            confirmado: 0,
            faltou: 0
        };

        statusCounts.forEach(item => {
            estatisticas[item._id] = item.total;
        });

        res.json({
            success: true,
            data: estatisticas
        });

    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas de status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas de status',
            error: error.message
        });
    }
};

// @desc    Buscar agendamentos do médico logado
// @route   GET /api/agendamentos/medico/meus-agendamentos
// @access  Private (Médico)
exports.getMeusAgendamentos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    console.log('Buscando agendamentos para médico:', usuarioId);

    // Primeiro, buscar o médico pelo usuário ID
    const Medico = require('../models/Medico');
    const medico = await Medico.findOne({ usuario: usuarioId });
    
    if (!medico) {
      return res.status(404).json({
        success: false,
        message: 'Médico não encontrado'
      });
    }

    console.log('Médico encontrado:', medico._id);

    // Buscar agendamentos deste médico
    const Agendamento = require('../models/Agendamento');
    const agendamentos = await Agendamento.find({
      medico: medico._id
    })
    .populate('paciente', 'nome email telefone')
    .populate('medico', 'usuario especialidade')
    .sort({ data: 1, horario: 1 });

    console.log('Agendamentos encontrados:', agendamentos.length);

    res.json({
      success: true,
      count: agendamentos.length,
      data: agendamentos
    });

  } catch (error) {
    console.error('Erro ao buscar agendamentos do médico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamentos',
      error: error.message
    });
  }
};

// @desc    Adicionar observações a um agendamento
// @route   PUT /api/agendamentos/:id/observacoes
// @access  Private (Médico)
exports.adicionarObservacoes = async (req, res) => {
  try {
    const { observacoes } = req.body;
    const agendamentoId = req.params.id;

    // Verificar se o agendamento existe
    const Agendamento = require('../models/Agendamento');
    let agendamento = await Agendamento.findById(agendamentoId);

    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar se o médico logado é o médico do agendamento
    const Medico = require('../models/Medico');
    const usuarioId = req.usuario.id;
    const medico = await Medico.findOne({ usuario: usuarioId });

    if (!medico || agendamento.medico.toString() !== medico._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Este agendamento não pertence a você.'
      });
    }

    // Atualizar observações
    agendamento.observacoes = observacoes;
    await agendamento.save();

    // Recarregar com populate
    agendamento = await Agendamento.findById(agendamentoId)
      .populate('paciente', 'nome email telefone')
      .populate('medico', 'usuario especialidade');

    res.json({
      success: true,
      message: 'Observações adicionadas com sucesso',
      data: agendamento
    });

  } catch (error) {
    console.error('Erro ao adicionar observações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar observações',
      error: error.message
    });
  }
};

// @desc    Marcar agendamento como realizado
// @route   PUT /api/agendamentos/:id/realizado
// @access  Private (Médico)
exports.marcarComoRealizado = async (req, res) => {
  try {
    const agendamentoId = req.params.id;

    // Verificar se o agendamento existe
    const Agendamento = require('../models/Agendamento');
    let agendamento = await Agendamento.findById(agendamentoId);

    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar se o médico logado é o médico do agendamento
    const Medico = require('../models/Medico');
    const usuarioId = req.usuario.id;
    const medico = await Medico.findOne({ usuario: usuarioId });

    if (!medico || agendamento.medico.toString() !== medico._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Este agendamento não pertence a você.'
      });
    }

    // Atualizar status
    agendamento.status = 'realizado';
    await agendamento.save();

    // Recarregar com populate
    agendamento = await Agendamento.findById(agendamentoId)
      .populate('paciente', 'nome email telefone')
      .populate('medico', 'usuario especialidade');

    res.json({
      success: true,
      message: 'Agendamento marcado como realizado',
      data: agendamento
    });

  } catch (error) {
    console.error('Erro ao marcar como realizado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar agendamento como realizado',
      error: error.message
    });
  }
};