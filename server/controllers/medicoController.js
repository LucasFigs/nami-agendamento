const Medico = require('../models/Medico');
const Usuario = require('../models/Usuario');

// @desc    Listar todos os médicos
// @route   GET /api/medicos
// @access  Public
exports.listarMedicos = async (req, res) => {
    try {
        // ✅ REMOVER o filtro { ativo: true } para mostrar TODOS os médicos
        const medicos = await Medico.find() // ← Removido o filtro
            .populate('usuario', 'nome email telefone')
            .sort({ ativo: -1, nome: 1 }); // ✅ Ordenar por ativo primeiro

        res.json({
            success: true,
            count: medicos.length,
            data: medicos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao listar médicos',
            error: error.message
        });
    }
};

// @desc    Buscar médico por ID
// @route   GET /api/medicos/:id
// @access  Public
exports.buscarMedicoPorId = async (req, res) => {
    try {
        const medico = await Medico.findById(req.params.id)
            .populate('usuario', 'nome email telefone');

        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico não encontrado'
            });
        }

        res.json({
            success: true,
            data: medico
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar médico',
            error: error.message
        });
    }
};

// @desc    Buscar médicos por especialidade
// @route   GET /api/medicos/especialidade/:especialidade
// @access  Public
exports.buscarMedicosPorEspecialidade = async (req, res) => {
    try {
        const { especialidade } = req.params;

        const medicos = await Medico.find({
            especialidade: new RegExp(especialidade, 'i'),
            ativo: true
        }).populate('usuario', 'nome email telefone');

        res.json({
            success: true,
            count: medicos.length,
            data: medicos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar médicos por especialidade',
            error: error.message
        });
    }
};

// @desc    Buscar horários disponíveis do médico
// @route   GET /api/medicos/:id/horarios-disponiveis
// @access  Public
exports.buscarHorariosDisponiveis = async (req, res) => {
    try {
        const { data } = req.query;
        const medicoId = req.params.id;

        console.log('=== DEBUG HORÁRIOS - INÍCIO ===');
        console.log('Data recebida do frontend:', data);
        console.log('Médico ID:', medicoId);

        const medico = await Medico.findById(medicoId).populate('usuario', 'nome');
        
        if (!medico) {
            console.log('Médico não encontrado');
            return res.status(404).json({
                success: false,
                message: 'Médico não encontrado'
            });
        }

        console.log('Médico:', medico.usuario?.nome);
        console.log('Especialidade:', medico.especialidade);
        console.log('Dias atendimento COMPLETO:', JSON.stringify(medico.diasAtendimento, null, 2));

        // === CORREÇÃO: GARANTIR QUE A DATA SEJA TRATADA CORRETAMENTE ===
        const dataObj = new Date(data + 'T00:00:00Z'); // Forçar UTC
        console.log('Data UTC:', dataObj.toUTCString());

        if (isNaN(dataObj.getTime())) {
            console.log('Data inválida');
            return res.status(400).json({
                success: false,
                message: 'Data inválida'
            });
        }

        const diaSemanaNumero = dataObj.getUTCDay(); // 0=domingo, 1=segunda, etc.
        console.log('Dia da semana (número):', diaSemanaNumero);

        const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const diaSemanaSolicitado = diasSemana[diaSemanaNumero];
        console.log('Dia da semana (texto):', diaSemanaSolicitado);

        // Buscar o dia de atendimento
        const diaAtendimento = medico.diasAtendimento.find(
            dia => dia.diaSemana === diaSemanaSolicitado
        );

        console.log('Dia atendimento encontrado:', diaAtendimento);

        if (!diaAtendimento) {
            console.log('Médico não atende neste dia:', diaSemanaSolicitado);
            return res.json({
                success: true,
                data: {
                    medico: medico.usuario,
                    especialidade: medico.especialidade,
                    data: data,
                    horariosDisponiveis: [],
                    totalDisponivel: 0,
                    mensagem: `Médico não atende às ${diaSemanaSolicitado}s`
                }
            });
        }

        console.log('Horários configurados:', diaAtendimento.horarios);

        // === PARTE DOS AGENDAMENTOS (MANTENHA COMO ESTAVA) ===
        const Agendamento = require('../models/Agendamento');
        
        // Buscar agendamentos para esta data específica
        const dataInicio = new Date(data);
        dataInicio.setHours(0, 0, 0, 0);
        
        const dataFim = new Date(data);
        dataFim.setHours(23, 59, 59, 999);

        console.log('Buscando agendamentos entre:', dataInicio, 'e', dataFim);

        const agendamentos = await Agendamento.find({
            medico: medicoId,
            data: {
                $gte: dataInicio,
                $lte: dataFim
            },
            status: { $in: ['agendado', 'confirmado'] }
        });

        console.log('Agendamentos encontrados:', agendamentos.length);
        console.log('Agendamentos:', agendamentos);

        const horariosOcupados = agendamentos.map(ag => ag.horario);
        console.log('Horários ocupados:', horariosOcupados);

        // Filtrar horários disponíveis
        const horariosDisponiveis = diaAtendimento.horarios.filter(
            horario => !horariosOcupados.includes(horario)
        );

        console.log('Horários disponíveis finais:', horariosDisponiveis);
        console.log('=== DEBUG HORÁRIOS - FIM ===');

        res.json({
            success: true,
            data: {
                medico: medico.usuario,
                especialidade: medico.especialidade,
                data: data,
                horariosDisponiveis: horariosDisponiveis,
                totalDisponivel: horariosDisponiveis.length,
                diaSemana: diaSemanaSolicitado
            }
        });

    } catch (error) {
        console.error('Erro completo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar horários disponíveis',
            error: error.message
        });
    }
};

// @desc    Criar médico (apenas admin)
// @route   POST /api/medicos
// @access  Private/Admin
exports.criarMedico = async (req, res) => {
    try {
        const { usuarioId, especialidade, crm, consultorio, diasAtendimento } = req.body;

        // Verificar se usuário existe
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar se CRM já existe
        const crmExiste = await Medico.findOne({ crm });
        if (crmExiste) {
            return res.status(400).json({
                success: false,
                message: 'CRM já cadastrado'
            });
        }

        // Criar médico
        const medico = await Medico.create({
            usuario: usuarioId,
            especialidade,
            crm,
            consultorio,
            diasAtendimento
        });

        // Atualizar tipo do usuário para médico
        usuario.tipo = 'medico';
        await usuario.save();

        const medicoPopulado = await Medico.findById(medico._id)
            .populate('usuario', 'nome email telefone');

        res.status(201).json({
            success: true,
            message: 'Médico criado com sucesso',
            data: medicoPopulado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar médico',
            error: error.message
        });
    }
};

// @desc    Atualizar médico
// @route   PUT /api/medicos/:id
// @access  Private/Admin ou Médico dono
exports.atualizarMedico = async (req, res) => {
    try {
        const { especialidade, consultorio, diasAtendimento, ativo } = req.body;

        let medico = await Medico.findById(req.params.id);

        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico não encontrado'
            });
        }

        // Atualizar campos
        if (especialidade) medico.especialidade = especialidade;
        if (consultorio) medico.consultorio = consultorio;
        if (diasAtendimento) medico.diasAtendimento = diasAtendimento;
        if (typeof ativo !== 'undefined') medico.ativo = ativo;

        await medico.save();

        medico = await Medico.findById(medico._id)
            .populate('usuario', 'nome email telefone');

        res.json({
            success: true,
            message: 'Médico atualizado com sucesso',
            data: medico
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar médico',
            error: error.message
        });
    }
};

// @desc    Deletar médico (soft delete)
// @route   DELETE /api/medicos/:id
// @access  Private/Admin
exports.deletarMedico = async (req, res) => {
    try {
        const medico = await Medico.findById(req.params.id);

        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico não encontrado'
            });
        }

        // Soft delete - marcar como inativo
        medico.ativo = false;
        await medico.save();

        res.json({
            success: true,
            message: 'Médico desativado com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar médico',
            error: error.message
        });
    }
};

// @desc    Buscar dados do médico logado
// @route   GET /api/medicos/meus-dados
// @access  Private (Médico)
exports.getMeusDados = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        
        console.log('🔄 Buscando dados do médico para usuário:', usuarioId);

        // Buscar médico pelo ID do usuário
        const medico = await Medico.findOne({ usuario: usuarioId })
            .populate('usuario', 'nome email telefone');

        if (!medico) {
            console.log('❌ Médico não encontrado para o usuário:', usuarioId);
            
            // ✅ CORREÇÃO: Retornar estrutura vazia em vez de erro 404
            return res.json({
                success: true,
                data: {
                    nome: req.usuario.nome || '',
                    email: req.usuario.email || '',
                    telefone: '',
                    especialidade: '',
                    crm: '',
                    consultorio: '',
                    diasAtendimento: []
                }
            });
        }

        console.log('✅ Médico encontrado:', medico);

        res.json({
            success: true,
            data: {
                nome: medico.usuario.nome,
                email: medico.usuario.email,
                telefone: medico.usuario.telefone,
                especialidade: medico.especialidade,
                crm: medico.crm,
                consultorio: medico.consultorio,
                diasAtendimento: medico.diasAtendimento
            }
        });

    } catch (error) {
        console.error('❌ Erro ao buscar dados do médico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados do médico',
            error: error.message
        });
    }
};

// @desc    Ativar/desativar médico
// @route   PUT /api/medicos/:id/toggle-status
// @access  Private/Admin
exports.toggleMedicoStatus = async (req, res) => {
    try {
        const medicoId = req.params.id;
        
        const medico = await Medico.findById(medicoId)
            .populate('usuario', 'nome email ativo');
        
        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico não encontrado'
            });
        }

        // ✅ SINCRONIZAR: Alterar status do médico E do usuário
        medico.ativo = !medico.ativo;
        await medico.save();

        // ✅ ATUALIZAR também o status do usuário associado
        if (medico.usuario) {
            medico.usuario.ativo = medico.ativo;
            await medico.usuario.save();
        }

        const medicoPopulado = await Medico.findById(medicoId)
            .populate('usuario', 'nome email telefone ativo');

        res.json({
            success: true,
            message: `Médico ${medico.ativo ? 'ativado' : 'desativado'} com sucesso`,
            data: medicoPopulado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao alterar status do médico',
            error: error.message
        });
    }
};

// @desc    Criar médico completo (usuário + médico)
// @route   POST /api/medicos/completo
// @access  Private/Admin
exports.criarMedicoCompleto = async (req, res) => {
    try {
        const { 
            nome, 
            email, 
            telefone, 
            senha, 
            especialidade, 
            crm, 
            consultorio, 
            diasAtendimento 
        } = req.body;

        // Verificar se usuário já existe
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({
                success: false,
                message: 'Usuário já existe com este email'
            });
        }

        // Verificar se CRM já existe
        const crmExiste = await Medico.findOne({ crm });
        if (crmExiste) {
            return res.status(400).json({
                success: false,
                message: 'CRM já cadastrado'
            });
        }

        // Criar usuário primeiro
        const usuario = await Usuario.create({
            nome,
            email,
            telefone,
            senha,
            tipo: 'medico'
        });

        // Criar médico
        const medico = await Medico.create({
            usuario: usuario._id,
            especialidade,
            crm,
            consultorio,
            diasAtendimento: diasAtendimento || [
                { diaSemana: 'segunda', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
                { diaSemana: 'terca', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
                { diaSemana: 'quarta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
                { diaSemana: 'quinta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
                { diaSemana: 'sexta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] }
            ]
        });

        const medicoPopulado = await Medico.findById(medico._id)
            .populate('usuario', 'nome email telefone');

        res.status(201).json({
            success: true,
            message: 'Médico criado com sucesso',
            data: medicoPopulado
        });

    } catch (error) {
        // Se der erro, deletar usuário criado
        if (req.body.email) {
            await Usuario.findOneAndDelete({ email: req.body.email });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erro ao criar médico',
            error: error.message
        });
    }
};