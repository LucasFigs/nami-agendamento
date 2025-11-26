import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { medicoService } from '../services/medicoService';
import { usuarioService } from '../services/usuarioService';
import { agendamentoService } from '../services/agendamentoService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [medicos, setMedicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalUsuarios: 0,
    totalMedicos: 0,
    totalConsultas: 0,
    consultasHoje: 0
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [estatisticasStatus, setEstatisticasStatus] = useState({});

  // Formulários
  const [formMedico, setFormMedico] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    especialidade: '',
    crm: '',
    consultorio: '',
    diasAtendimento: [
      { diaSemana: 'segunda', horarios: [] },
      { diaSemana: 'terca', horarios: [] },
      { diaSemana: 'quarta', horarios: [] },
      { diaSemana: 'quinta', horarios: [] },
      { diaSemana: 'sexta', horarios: [] },
      { diaSemana: 'sabado', horarios: [] }
    ]
  });

  const [formAdmin, setFormAdmin] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  });

  const [relatorios, setRelatorios] = useState({
    consultasPorMes: [],
    medicosMaisSolicitados: [],
    horariosPopulares: [],
    taxas: {}
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, [activeTab]);

  const checkAdminAccess = () => {
    const user = authService.getCurrentUser();
    if (!user || user.tipo !== 'admin') {
      navigate('/unauthorized');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      switch (activeTab) {
        case 'dashboard':
          await loadDashboardData();
          break;
        case 'medicos':
          await loadMedicos();
          break;
        case 'usuarios':
          await loadUsuarios();
          break;
        case 'consultas':
          await loadAgendamentos();
          break;
        case 'relatorios':
          await loadRelatorios();
          break;
      }
    } catch (error) {
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const estatisticasReais = await usuarioService.getEstatisticas();

      setEstatisticas({
        totalUsuarios: estatisticasReais.usuarios.total,
        totalMedicos: estatisticasReais.medicos.ativos,
        totalConsultas: estatisticasReais.consultas.total,
        consultasHoje: estatisticasReais.consultas.hoje
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setEstatisticas({
        totalUsuarios: 0,
        totalMedicos: 0,
        totalConsultas: 0,
        consultasHoje: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMedicos = async () => {
    try {
      const medicosData = await medicoService.getMedicos();
      setMedicos(medicosData);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const usuariosData = await usuarioService.getTodosUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuarios([
        { _id: '1', nome: 'João Silva', email: 'joao@unifor.br', tipo: 'paciente', ativo: true },
        { _id: '2', nome: 'Dra. Maria Santos', email: 'maria@nami.com', tipo: 'medico', ativo: true },
        { _id: '3', nome: 'Admin Sistema', email: 'admin@nami.com', tipo: 'admin', ativo: true }
      ]);
    }
  };

  const loadAgendamentos = async () => {
    try {
      const agendamentosData = await agendamentoService.getTodosAgendamentos();

      if (Array.isArray(agendamentosData)) {
        setAgendamentos(agendamentosData);
      } else if (agendamentosData && Array.isArray(agendamentosData.data)) {
        setAgendamentos(agendamentosData.data);
      } else {
        console.warn('Dados de agendamentos não são um array:', agendamentosData);
        setAgendamentos([]);
      }

    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAgendamentos([]);
    }
  };

  const loadRelatorios = async (periodo = '30dias') => {
    try {
      setLoading(true);
      const relatoriosData = await agendamentoService.getRelatorios(periodo);
      console.log('Relatórios carregados:', relatoriosData);

      setRelatorios(relatoriosData);
      await loadEstatisticasStatus(periodo);

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      alert('Erro ao carregar relatórios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticasStatus = async (periodo = '30dias') => {
    try {
      const dados = await agendamentoService.getEstatisticasStatus(periodo);
      setEstatisticasStatus(dados);
      console.log('📊 Estatísticas de status carregadas:', dados);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de status:', error);
    }
  };

  // Função para criar médico
  const handleCreateMedico = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await medicoService.criarMedicoCompleto(formMedico);
      alert('✅ Médico cadastrado com sucesso!');

      setShowModal(false);
      setFormMedico({
        nome: '', email: '', telefone: '', senha: '', especialidade: '', crm: '', consultorio: '',
        diasAtendimento: [
          { diaSemana: 'segunda', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'terca', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'quarta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'quinta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'sexta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] }
        ]
      });

      loadMedicos();
    } catch (error) {
      alert('❌ Erro ao criar médico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usuarioService.criarAdmin(formAdmin);
      alert('✅ Admin cadastrado com sucesso!');

      setShowModal(false);
      setFormAdmin({ nome: '', email: '', telefone: '', senha: '' });
      loadUsuarios();
    } catch (error) {
      alert('❌ Erro ao criar admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para ativar/desativar usuário
  const handleToggleUsuarioStatus = async (usuarioId, ativoAtual) => {
    if (window.confirm(`Deseja ${ativoAtual ? 'desativar' : 'ativar'} este usuário?`)) {
      try {
        await usuarioService.toggleUsuarioStatus(usuarioId);
        alert(`✅ Usuário ${ativoAtual ? 'desativado' : 'ativado'} com sucesso!`);
        loadUsuarios();
      } catch (error) {
        alert('❌ Erro ao alterar status: ' + error.message);
      }
    }
  };

  // Função para ativar/desativar médico
  const handleToggleMedicoStatus = async (medicoId, ativoAtual) => {
    if (window.confirm(`Deseja ${ativoAtual ? 'desativar' : 'ativar'} este médico?`)) {
      try {
        await medicoService.toggleMedicoStatus(medicoId);
        alert(`✅ Médico ${ativoAtual ? 'desativado' : 'ativado'} com sucesso!`);
        loadMedicos();
      } catch (error) {
        alert('❌ Erro ao alterar status: ' + error.message);
      }
    }
  };

  // Função para resetar senha
  const handleResetarSenha = async (usuarioId) => {
    if (window.confirm('Deseja resetar a senha deste usuário para "123456"?')) {
      try {
        await usuarioService.resetarSenha(usuarioId);
        alert('✅ Senha resetada com sucesso! Nova senha: 123456');
        loadUsuarios();
      } catch (error) {
        alert('❌ Erro ao resetar senha: ' + error.message);
      }
    }
  };

  // Função para editar médico
  const handleEditarMedico = (medico) => {
    setFormMedico({
      nome: medico.usuario?.nome || '',
      email: medico.usuario?.email || '',
      telefone: medico.usuario?.telefone || '',
      senha: '',
      especialidade: medico.especialidade || '',
      crm: medico.crm || '',
      consultorio: medico.consultorio || '',
      diasAtendimento: medico.diasAtendimento || [
        { diaSemana: 'segunda', horarios: [] },
        { diaSemana: 'terca', horarios: [] },
        { diaSemana: 'quarta', horarios: [] },
        { diaSemana: 'quinta', horarios: [] },
        { diaSemana: 'sexta', horarios: [] },
        { diaSemana: 'sabado', horarios: [] }
      ]
    });

    setModalType('editar-medico');
    setShowModal(true);
    setSelectedAgendamento(medico._id);
  };

  // Função para atualizar médico
  const handleUpdateMedico = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await medicoService.atualizarMedico(selectedAgendamento, formMedico);
      alert('✅ Médico atualizado com sucesso!');

      setShowModal(false);
      setFormMedico({
        nome: '', email: '', telefone: '', senha: '', especialidade: '', crm: '', consultorio: '',
        diasAtendimento: [
          { diaSemana: 'segunda', horarios: [] },
          { diaSemana: 'terca', horarios: [] },
          { diaSemana: 'quarta', horarios: [] },
          { diaSemana: 'quinta', horarios: [] },
          { diaSemana: 'sexta', horarios: [] },
          { diaSemana: 'sabado', horarios: [] }
        ]
      });
      setSelectedAgendamento(null);

      loadMedicos();
    } catch (error) {
      alert('❌ Erro ao atualizar médico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para editar usuário
  const handleEditarUsuario = (usuario) => {
    setFormAdmin({
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      senha: ''
    });
    setModalType('editar-usuario');
    setShowModal(true);
    setSelectedAgendamento(usuario._id);
  };

  // Função para atualizar usuário
  const handleUpdateUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usuarioService.atualizarUsuario(selectedAgendamento, formAdmin);
      alert('✅ Usuário atualizado com sucesso!');

      setShowModal(false);
      setFormAdmin({ nome: '', email: '', telefone: '', senha: '' });
      setSelectedAgendamento(null);

      loadUsuarios();
    } catch (error) {
      alert('❌ Erro ao atualizar usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para ver detalhes da consulta
  const handleVerDetalhesConsulta = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setModalType('detalhes-consulta');
    setShowModal(true);
  };

  // Função para cancelar consulta (admin)
  const handleCancelarConsultaAdmin = async (agendamentoId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta como administrador?')) {
      try {
        await agendamentoService.cancelarAgendamentoAdmin(agendamentoId);
        alert('✅ Consulta cancelada com sucesso pelo administrador!');
        loadAgendamentos();
      } catch (error) {
        alert('❌ Erro ao cancelar consulta: ' + error.message);
      }
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  // Funções para gráficos
  const getChartColor = (index) => {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
    return colors[index % colors.length];
  };

  const renderBarChart = (data, title, color = '#2563eb') => {
    if (!data || data.length === 0) {
      return <div className="empty-chart">Nenhum dado disponível</div>;
    }

    const maxValue = Math.max(...data.map(item => item.total || item.value || 0));

    return (
      <div className="simple-bar-chart">
        <h4>{title}</h4>
        <div className="chart-bars">
          {data.map((item, index) => {
            const percentage = ((item.total || item.value || 0) / maxValue) * 100;
            return (
              <div key={index} className="bar-item">
                <div className="bar-label">{item.label || item.mes || item._id || 'N/A'}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  ></div>
                  <span className="bar-value">{item.total || item.value || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPieChart = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-chart">
          <div>📊</div>
          <div>Nenhum dado disponível</div>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + (item.value || item.total || 0), 0);

    if (total === 0) {
      return (
        <div className="empty-chart">
          <div>📊</div>
          <div>Dados zerados</div>
        </div>
      );
    }

    let currentAngle = -90;

    return (
      <div className="simple-pie-chart">
        <h4>{title}</h4>
        <div className="pie-container">
          <svg width="150" height="150" viewBox="0 0 150 150">
            {data.map((item, index) => {
              const value = item.value || item.total || 0;
              const percentage = value / total;
              const angle = percentage * 360;

              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 75 + 65 * Math.cos(startRad);
              const y1 = 75 + 65 * Math.sin(startRad);
              const x2 = 75 + 65 * Math.cos(endRad);
              const y2 = 75 + 65 * Math.sin(endRad);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M 75 75`,
                `L ${x1} ${y1}`,
                `A 65 65 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const segment = (
                <path
                  key={index}
                  d={pathData}
                  fill={getChartColor(index)}
                  stroke="#fff"
                  strokeWidth="2"
                />
              );

              currentAngle += angle;
              return segment;
            })}
          </svg>
        </div>
        <div className="pie-legend">
          {data.map((item, index) => {
            const value = item.value || item.total || 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            return (
              <div key={index} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: getChartColor(index) }}
                ></span>
                <span className="legend-label">
                  {item.label || item._id || 'Item'} - {value} ({Math.round(percentage)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMetricCard = (title, value, subtitle, color = 'primary') => {
    return (
      <div className={`metric-card ${color}`}>
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return '#10b981';
      case 'cancelado': return '#ef4444';
      case 'realizado': return '#06b6d4';
      default: return '#64748b';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'admin': return '#ef4444';
      case 'medico': return '#2563eb';
      case 'paciente': return '#10b981';
      default: return '#64748b';
    }
  };

  // Novas funções para gráficos melhorados (adicionar antes do return)
  const calculateStatusDistribution = (consultasPorMes) => {
    if (!consultasPorMes || consultasPorMes.length === 0) return [];

    let realizadas = 0;
    let canceladas = 0;
    let agendadas = 0;

    consultasPorMes.forEach(item => {
      realizadas += Number(item.realizadas) || 0;
      canceladas += Number(item.canceladas) || 0;
      agendadas += (Number(item.total) || 0) - realizadas - canceladas;
    });

    const dados = [];
    if (realizadas > 0) dados.push({ label: 'Realizadas', value: realizadas, color: '#10b981' });
    if (agendadas > 0) dados.push({ label: 'Agendadas', value: agendadas, color: '#3b82f6' });
    if (canceladas > 0) dados.push({ label: 'Canceladas', value: canceladas, color: '#ef4444' });

    return dados;
  };

  const renderEnhancedBarChart = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-chart">
          <div className="empty-chart-icon">📊</div>
          <p>Nenhum dado disponível</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item.total || 0));

    return (
      <div className="enhanced-bar-chart">
        <div className="chart-bars-vertical">
          {data.map((item, index) => {
            const percentage = ((item.total || 0) / maxValue) * 100;
            return (
              <div key={index} className="bar-vertical-item">
                <div className="bar-vertical-container">
                  <div
                    className="bar-vertical-fill"
                    style={{ height: `${percentage}%` }}
                  >
                    <div className="bar-value">{item.total || 0}</div>
                  </div>
                </div>
                <div className="bar-label">{item.label}</div>
                <div className="bar-details">
                  <span className="detail-success">✓{item.realizadas || 0}</span>
                  <span className="detail-danger">✗{item.canceladas || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEnhancedPieChart = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-chart">
          <div className="empty-chart-icon">📈</div>
          <p>Nenhum dado disponível</p>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

    if (total === 0) {
      return (
        <div className="empty-chart">
          <div className="empty-chart-icon">📈</div>
          <p>Dados insuficientes</p>
        </div>
      );
    }

    return (
      <div className="enhanced-pie-chart">
        <div className="pie-visual">
          <div className="pie-chart-svg">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {data.map((item, index, array) => {
                const percentage = (item.value / total) * 100;
                const offset = array.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0);
                const angle = (item.value / total) * 360;

                const startAngle = offset - 90;
                const endAngle = startAngle + angle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 60 + 50 * Math.cos(startRad);
                const y1 = 60 + 50 * Math.sin(startRad);
                const x2 = 60 + 50 * Math.cos(endRad);
                const y2 = 60 + 50 * Math.sin(endRad);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M 60 60`,
                  `L ${x1} ${y1}`,
                  `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color || getChartColor(index)}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
          <div className="pie-center">
            <div className="pie-total">{total}</div>
            <div className="pie-label">Total</div>
          </div>
        </div>
        <div className="pie-legend-enhanced">
          {data.map((item, index) => {
            const percentage = ((item.value || 0) / total) * 100;
            return (
              <div key={index} className="legend-item-enhanced">
                <div className="legend-color" style={{ backgroundColor: item.color || getChartColor(index) }}></div>
                <div className="legend-info">
                  <div className="legend-label">{item.label}</div>
                  <div className="legend-value">{item.value} ({Math.round(percentage)}%)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDoctorsChart = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-chart">
          <div className="empty-chart-icon">👨‍⚕️</div>
          <p>Nenhum médico com consultas</p>
        </div>
      );
    }

    const maxConsultas = Math.max(...data.map(item => item.totalConsultas || 0));

    return (
      <div className="doctors-chart">
        {data.map((medico, index) => {
          const percentage = ((medico.totalConsultas || 0) / maxConsultas) * 100;
          return (
            <div key={index} className="doctor-bar">
              <div className="doctor-info-compact">
                <span className="doctor-name">{medico.medico?.split(' ')[0] || 'Médico'}</span>
                <span className="doctor-specialty">{medico.especialidade}</span>
              </div>
              <div className="doctor-bar-container">
                <div
                  className="doctor-bar-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
                <span className="doctor-bar-value">{medico.totalConsultas || 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimeChart = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-chart">
          <div className="empty-chart-icon">⏰</div>
          <p>Sem dados de horários</p>
        </div>
      );
    }

    return (
      <div className="time-chart">
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="time-item">
            <span className="time-label">{item._id}</span>
            <div className="time-bar-container">
              <div
                className="time-bar-fill"
                style={{ width: `${(item.total / Math.max(...data.map(d => d.total))) * 100}%` }}
              ></div>
              <span className="time-value">{item.total}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Funções utilitárias para estatísticas
  const calculateTotalConsultas = (consultasPorMes) => {
    if (!consultasPorMes) return 0;
    return consultasPorMes.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTaxaComparecimento = (consultasPorMes) => {
    if (!consultasPorMes || consultasPorMes.length === 0) return 0;
    const total = calculateTotalConsultas(consultasPorMes);
    const realizadas = consultasPorMes.reduce((sum, item) => sum + (item.realizadas || 0), 0);
    return total > 0 ? Math.round((realizadas / total) * 100) : 0;
  };

  const calculateTaxaCancelamento = (consultasPorMes) => {
    if (!consultasPorMes || consultasPorMes.length === 0) return 0;
    const total = calculateTotalConsultas(consultasPorMes);
    const canceladas = consultasPorMes.reduce((sum, item) => sum + (item.canceladas || 0), 0);
    return total > 0 ? Math.round((canceladas / total) * 100) : 0;
  };

  const findHorarioMaisPopular = (horariosPopulares) => {
    if (!horariosPopulares || horariosPopulares.length === 0) return 'N/A';
    const maisPopular = horariosPopulares.reduce((prev, current) =>
      (prev.total > current.total) ? prev : current
    );
    return maisPopular._id;
  };

  const getPerformanceLabel = (taxa) => {
    if (taxa >= 80) return 'Excelente';
    if (taxa >= 60) return 'Boa';
    if (taxa >= 40) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Painel Administrativo</h1>
            <p>Gerencie usuários, médicos e consultas do sistema</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                authService.logout();
                navigate('/login');
              }}
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Dashboard</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'medicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicos')}
          >
            <span className="tab-icon">👨‍⚕️</span>
            <span className="tab-label">Médicos</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            <span className="tab-icon">👥</span>
            <span className="tab-label">Usuários</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'consultas' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultas')}
          >
            <span className="tab-icon">📅</span>
            <span className="tab-label">Consultas</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'relatorios' ? 'active' : ''}`}
            onClick={() => setActiveTab('relatorios')}
          >
            <span className="tab-icon">📈</span>
            <span className="tab-label">Relatórios</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Visão Geral</h2>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon user">👥</div>
                <div className="stat-content">
                  <h3>{estatisticas.totalUsuarios}</h3>
                  <p>Total de Usuários</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon doctor">👨‍⚕️</div>
                <div className="stat-content">
                  <h3>{estatisticas.totalMedicos}</h3>
                  <p>Médicos Cadastrados</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon appointment">📅</div>
                <div className="stat-content">
                  <h3>{estatisticas.totalConsultas}</h3>
                  <p>Total de Consultas</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon today">🎯</div>
                <div className="stat-content">
                  <h3>{estatisticas.consultasHoje}</h3>
                  <p>Consultas Hoje</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Ações Rápidas</h3>
              <div className="actions-grid">
                <button className="action-card" onClick={() => openModal('medico')}>
                  <div className="action-icon">➕</div>
                  <div className="action-content">
                    <h4>Cadastrar Médico</h4>
                    <p>Adicionar novo profissional ao sistema</p>
                  </div>
                </button>
                <button className="action-card" onClick={() => openModal('admin')}>
                  <div className="action-icon">🛠️</div>
                  <div className="action-content">
                    <h4>Cadastrar Admin</h4>
                    <p>Adicionar novo administrador</p>
                  </div>
                </button>
                <button className="action-card" onClick={() => setActiveTab('consultas')}>
                  <div className="action-icon">📋</div>
                  <div className="action-content">
                    <h4>Ver Consultas</h4>
                    <p>Gerenciar agendamentos</p>
                  </div>
                </button>
                <button className="action-card" onClick={() => setActiveTab('relatorios')}>
                  <div className="action-icon">📊</div>
                  <div className="action-content">
                    <h4>Relatórios</h4>
                    <p>Estatísticas do sistema</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Médicos Tab */}
        {activeTab === 'medicos' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Gerenciar Médicos</h2>
              <button className="btn btn-primary" onClick={() => openModal('medico')}>
                <span>➕</span>
                Adicionar Médico
              </button>
            </div>

            {medicos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍⚕️</div>
                <h3>Nenhum médico cadastrado</h3>
                <p>Comece adicionando o primeiro médico ao sistema</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Especialidade</th>
                      <th>CRM</th>
                      <th>Consultório</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicos.map(medico => (
                      <tr key={medico._id} className={!medico.ativo ? 'inactive' : ''}>
                        <td>
                          <div className="user-info">
                            <span className="user-name">{medico.usuario?.nome}</span>
                            {!medico.ativo && <span className="inactive-label">Inativo</span>}
                          </div>
                        </td>
                        <td>{medico.especialidade}</td>
                        <td><code className="code-badge">{medico.crm}</code></td>
                        <td>{medico.consultorio || '—'}</td>
                        <td>
                          <span className={`status-badge ${medico.ativo ? 'active' : 'inactive'}`}>
                            {medico.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-icon"
                              onClick={() => handleEditarMedico(medico)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className={`btn btn-icon ${medico.ativo ? 'warning' : 'success'}`}
                              onClick={() => handleToggleMedicoStatus(medico._id, medico.ativo)}
                              title={medico.ativo ? 'Desativar' : 'Ativar'}
                            >
                              {medico.ativo ? '⏸️' : '▶️'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Usuários Tab */}
        {activeTab === 'usuarios' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Gerenciar Usuários</h2>
              <button className="btn btn-primary" onClick={() => openModal('admin')}>
                <span>➕</span>
                Cadastrar Admin
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <tr key={usuario._id}>
                      <td>
                        <div className="user-info">
                          <span className="user-name">{usuario.nome}</span>
                        </div>
                      </td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`tipo-badge tipo-${usuario.tipo}`}>
                          {usuario.tipo === 'admin' && '👑 '}
                          {usuario.tipo === 'medico' && '👨‍⚕️ '}
                          {usuario.tipo === 'paciente' && '👤 '}
                          {usuario.tipo}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${usuario.ativo ? 'active' : 'inactive'}`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-icon"
                            onClick={() => handleEditarUsuario(usuario)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className={`btn btn-icon ${usuario.ativo ? 'warning' : 'success'}`}
                            onClick={() => handleToggleUsuarioStatus(usuario._id, usuario.ativo)}
                            title={usuario.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {usuario.ativo ? '⏸️' : '▶️'}
                          </button>
                          {usuario.tipo !== 'admin' && (
                            <button
                              className="btn btn-icon danger"
                              onClick={() => handleResetarSenha(usuario._id)}
                              title="Resetar Senha"
                            >
                              🔑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Consultas Tab */}
        {activeTab === 'consultas' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Todas as Consultas</h2>
              <div className="filters">
                <select>
                  <option value="todas">Todas</option>
                  <option value="agendado">Agendadas</option>
                  <option value="realizado">Realizadas</option>
                  <option value="cancelado">Canceladas</option>
                </select>
              </div>
            </div>

            {Array.isArray(agendamentos) && agendamentos.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Médico</th>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.map((agendamento) => (
                      <tr key={agendamento._id}>
                        <td>{agendamento.paciente?.nome || 'N/A'}</td>
                        <td>{agendamento.medico?.nome || 'N/A'} - {agendamento.especialidade || 'N/A'}</td>
                        <td>{agendamento.data ? new Date(agendamento.data).toLocaleDateString('pt-BR') : 'N/A'}</td>
                        <td>{agendamento.horario || 'N/A'}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(agendamento.status) }}>
                            {agendamento.status || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-icon"
                              onClick={() => handleVerDetalhesConsulta(agendamento)}
                              title="Detalhes"
                            >
                              👁️
                            </button>

                            {agendamento.status === 'agendado' && (
                              <button
                                className="btn btn-icon danger"
                                onClick={() => handleCancelarConsultaAdmin(agendamento._id)}
                                title="Cancelar Consulta"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>Nenhuma consulta encontrada</h3>
                <p>Não há agendamentos no sistema</p>
              </div>
            )}
          </div>
        )}

        {/* Relatórios Tab - VERSÃO MELHORADA */}
        {activeTab === 'relatorios' && (
          <div className="tab-content">
            <div className="content-header">
              <div className="header-title">
                <h2>Relatórios e Analytics</h2>
                <p>Insights e métricas do desempenho do sistema</p>
              </div>
              <div className="header-controls">
                <div className="periodo-filtros">
                  <label>Período:</label>
                  <select onChange={(e) => loadRelatorios(e.target.value)} className="period-select">
                    <option value="7dias">Últimos 7 dias</option>
                    <option value="30dias">Últimos 30 dias</option>
                    <option value="90dias">Últimos 90 dias</option>
                    <option value="1ano">Último ano</option>
                  </select>
                </div>
                <button className="btn btn-outline" onClick={() => loadRelatorios()}>
                  🔄 Atualizar
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card primary">
                <div className="kpi-icon">📊</div>
                <div className="kpi-content">
                  <div className="kpi-value">{relatorios.consultasPorMes?.reduce((sum, item) => sum + item.total, 0) || 0}</div>
                  <div className="kpi-label">Total de Consultas</div>
                  <div className="kpi-trend">
                    <span className="trend-up">↗️</span>
                    <span>Período selecionado</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card success">
                <div className="kpi-icon">✅</div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {relatorios.taxas?.comparecimento ? `${Math.round(relatorios.taxas.comparecimento)}%` : '0%'}
                  </div>
                  <div className="kpi-label">Taxa de Comparecimento</div>
                  <div className="kpi-trend">
                    <span className="trend-up">📈</span>
                    <span>Eficiência do sistema</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card warning">
                <div className="kpi-icon">⏰</div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {relatorios.taxas?.cancelamento ? `${Math.round(relatorios.taxas.cancelamento)}%` : '0%'}
                  </div>
                  <div className="kpi-label">Taxa de Cancelamento</div>
                  <div className="kpi-trend">
                    <span className="trend-down">📉</span>
                    <span>Monitoramento</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card info">
                <div className="kpi-icon">👨‍⚕️</div>
                <div className="kpi-content">
                  <div className="kpi-value">{relatorios.medicosMaisSolicitados?.length || 0}</div>
                  <div className="kpi-label">Médicos Ativos</div>
                  <div className="kpi-trend">
                    <span className="trend-up">👍</span>
                    <span>Em atividade</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos Principais */}
            <div className="charts-grid">
              {/* Gráfico de Consultas por Mês */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>📈 Evolução de Consultas</h3>
                  <span className="chart-subtitle">Volume mensal de agendamentos</span>
                </div>
                <div className="chart-container">
                  {renderEnhancedBarChart(
                    relatorios.consultasPorMes?.map(item => ({
                      label: item.mes,
                      total: item.total,
                      realizadas: item.realizadas || 0,
                      canceladas: item.canceladas || 0
                    })) || [],
                    'Consultas por Mês'
                  )}
                </div>
              </div>

              {/* Gráfico de Distribuição por Status */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>🎯 Status das Consultas</h3>
                  <span className="chart-subtitle">Distribuição por situação</span>
                </div>
                <div className="chart-container">
                  {renderEnhancedPieChart(
                    relatorios.consultasPorMes ? calculateStatusDistribution(relatorios.consultasPorMes) : [],
                    'Distribuição por Status'
                  )}
                </div>
              </div>

              {/* Top Médicos */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>🏆 Top Médicos</h3>
                  <span className="chart-subtitle">Profissionais mais solicitados</span>
                </div>
                <div className="chart-container">
                  {renderDoctorsChart(
                    relatorios.medicosMaisSolicitados?.slice(0, 6) || [],
                    'Médicos Mais Solicitados'
                  )}
                </div>
              </div>

              {/* Horários Populares */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>⏰ Horários Preferidos</h3>
                  <span className="chart-subtitle">Preferência de agendamento</span>
                </div>
                <div className="chart-container">
                  {renderTimeChart(
                    relatorios.horariosPopulares || [],
                    'Horários Mais Populares'
                  )}
                </div>
              </div>
            </div>

            {/* Tabela Detalhada */}
            <div className="detailed-reports">
              <div className="report-section">
                <div className="section-header">
                  <h3>📋 Relatório Detalhado de Médicos</h3>
                  <span className="section-description">Desempenho individual por profissional</span>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Médico</th>
                        <th>Especialidade</th>
                        <th>Total Consultas</th>
                        <th>Realizadas</th>
                        <th>Canceladas</th>
                        <th>Taxa de Sucesso</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorios.medicosMaisSolicitados && relatorios.medicosMaisSolicitados.length > 0 ? (
                        relatorios.medicosMaisSolicitados.map((medico, index) => (
                          <tr key={index}>
                            <td>
                              <div className="doctor-info">
                                <span className="doctor-name">{medico.medico}</span>
                                <span className="doctor-crm">{medico.crm || 'CRM não informado'}</span>
                              </div>
                            </td>
                            <td>{medico.especialidade}</td>
                            <td>
                              <span className="number-badge">{medico.totalConsultas}</span>
                            </td>
                            <td>
                              <span className="success-badge">{medico.consultasRealizadas || 0}</span>
                            </td>
                            <td>
                              <span className="danger-badge">{medico.consultasCanceladas || 0}</span>
                            </td>
                            <td>
                              <div className="progress-cell">
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min(medico.taxaSucesso || 0, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="progress-text">{Math.round(medico.taxaSucesso || 0)}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`performance-badge ${(medico.taxaSucesso || 0) >= 80 ? 'excellent' :
                                (medico.taxaSucesso || 0) >= 60 ? 'good' :
                                  (medico.taxaSucesso || 0) >= 40 ? 'average' : 'poor'
                                }`}>
                                {getPerformanceLabel(medico.taxaSucesso || 0)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="no-data">
                            <div className="empty-state">
                              <div className="empty-icon">📊</div>
                              <h4>Nenhum dado disponível</h4>
                              <p>Selecione um período para visualizar os relatórios</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumo Estatístico */}
              <div className="stats-summary">
                <div className="stat-item">
                  <div className="stat-value">{calculateTotalConsultas(relatorios.consultasPorMes)}</div>
                  <div className="stat-label">Total de Consultas</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{calculateTaxaComparecimento(relatorios.consultasPorMes)}%</div>
                  <div className="stat-label">Taxa Média de Comparecimento</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{calculateTaxaCancelamento(relatorios.consultasPorMes)}%</div>
                  <div className="stat-label">Taxa Média de Cancelamento</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{findHorarioMaisPopular(relatorios.horariosPopulares)}</div>
                  <div className="stat-label">Horário Mais Popular</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {modalType === 'medico' && '👨‍⚕️ Cadastrar Médico'}
                {modalType === 'admin' && '🛠️ Cadastrar Administrador'}
                {modalType === 'editar-medico' && '✏️ Editar Médico'}
                {modalType === 'editar-usuario' && '✏️ Editar Usuário'}
                {modalType === 'detalhes-consulta' && '👁️ Detalhes da Consulta'}
              </h3>
              <button
                className="btn btn-icon close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Modal Cadastrar Médico - VERSÃO MAIOR */}
              {modalType === 'medico' && (
                <form onSubmit={handleCreateMedico} className="modal-form">
                  <div className="form-section">
                    <h4>👤 Dados Pessoais</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nome Completo *</label>
                        <input
                          type="text"
                          value={formMedico.nome}
                          onChange={(e) => setFormMedico(prev => ({ ...prev, nome: e.target.value }))}
                          placeholder="Dr. João Silva"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={formMedico.email}
                          onChange={(e) => setFormMedico(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="joao.silva@clinica.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Telefone</label>
                        <input
                          type="tel"
                          value={formMedico.telefone}
                          onChange={(e) => setFormMedico(prev => ({ ...prev, telefone: e.target.value }))}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="form-group">
                        <label>Senha *</label>
                        <input
                          type="password"
                          value={formMedico.senha}
                          onChange={(e) => setFormMedico(prev => ({ ...prev, senha: e.target.value }))}
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>🏥 Dados Profissionais</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Especialidade *</label>
                        <select
                          value={formMedico.especialidade}
                          onChange={(e) => setFormMedico(prev => ({ ...prev, especialidade: e.target.value }))}
                          required
                        >
                          <option value="">Selecione uma especialidade</option>
                          <option value="Ginecologista">👩‍⚕️ Ginecologista</option>
                          <option value="Ortopedista">🦴 Ortopedista</option>
                          <option value="Endocrinologista">⚖️ Endocrinologista</option>
                          <option value="Geriatra">👵 Geriatra</option>
                          <option value="Psiquiatra">🧠 Psiquiatra</option>
                          <option value="Cardiologista">❤️ Cardiologista</option>
                          <option value="Dermatologista">🔬 Dermatologista</option>
                          <option value="Pediatra">👶 Pediatra</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>CRM *</label>
                        <input
                          type="text"
                          value={formMedico.crm}
                          onChange={(e) => setFormMedico(prev => ({ ...prev, crm: e.target.value }))}
                          placeholder="CRM-SP 123456"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Consultório</label>
                        <input
                          type="text"
                          value={formMedico.consultorio}
                          onChange={(e) => setFormMedico(prev => ({ ...prev, consultorio: e.target.value }))}
                          placeholder="Sala 205, Ala B"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Editor de Horários - VERSÃO MAIOR */}
                  <div className="form-section">
                    <div className="section-header-with-actions">
                      <div>
                        <h4>📅 Horários de Atendimento</h4>
                        <p className="section-description">
                          Configure os dias e horários em que o médico atende
                        </p>
                      </div>
                      <div className="quick-actions-buttons">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            const novosDias = formMedico.diasAtendimento.map(dia => ({
                              ...dia,
                              horarios: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
                            }));
                            setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                          }}
                        >
                          ⏰ Preencher Todos
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            const novosDias = formMedico.diasAtendimento.map(dia => ({
                              ...dia,
                              horarios: []
                            }));
                            setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                          }}
                        >
                          🗑️ Limpar Todos
                        </button>
                      </div>
                    </div>

                    <div className="dias-atendimento-grid-improved">
                      {formMedico.diasAtendimento.map((dia, index) => (
                        <div key={dia.diaSemana} className={`dia-atendimento-card-improved ${dia.horarios.length > 0 ? 'active' : ''}`}>
                          <div className="dia-header-improved">
                            <label className="dia-checkbox-improved">
                              <input
                                type="checkbox"
                                checked={dia.horarios.length > 0}
                                onChange={(e) => {
                                  const novosDias = [...formMedico.diasAtendimento];
                                  if (e.target.checked) {
                                    novosDias[index].horarios = ['08:00', '09:00', '10:00', '14:00', '15:00'];
                                  } else {
                                    novosDias[index].horarios = [];
                                  }
                                  setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                }}
                              />
                              <span className="checkmark"></span>
                              <span className="dia-nome-improved">
                                {dia.diaSemana === 'segunda' && 'Segunda-feira'}
                                {dia.diaSemana === 'terca' && 'Terça-feira'}
                                {dia.diaSemana === 'quarta' && 'Quarta-feira'}
                                {dia.diaSemana === 'quinta' && 'Quinta-feira'}
                                {dia.diaSemana === 'sexta' && 'Sexta-feira'}
                                {dia.diaSemana === 'sabado' && 'Sábado'}
                              </span>
                            </label>
                            <span className="horarios-count">
                              {dia.horarios.length} horários
                            </span>
                          </div>

                          {dia.horarios.length > 0 && (
                            <div className="horarios-list-improved">
                              <div className="horarios-header-improved">
                                <span>Horários configurados:</span>
                                <button
                                  type="button"
                                  className="btn-add-horario-improved"
                                  onClick={() => {
                                    const novosDias = [...formMedico.diasAtendimento];
                                    novosDias[index].horarios.push('09:00');
                                    setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                  }}
                                >
                                  + Add Horário
                                </button>
                              </div>

                              <div className="horarios-grid">
                                {dia.horarios.map((horario, horarioIndex) => (
                                  <div key={horarioIndex} className="horario-item-improved">
                                    <input
                                      type="time"
                                      value={horario}
                                      onChange={(e) => {
                                        const novosDias = [...formMedico.diasAtendimento];
                                        novosDias[index].horarios[horarioIndex] = e.target.value;
                                        setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                      }}
                                      className="time-input-improved"
                                    />
                                    <button
                                      type="button"
                                      className="btn-remove-horario-improved"
                                      onClick={() => {
                                        const novosDias = [...formMedico.diasAtendimento];
                                        novosDias[index].horarios.splice(horarioIndex, 1);
                                        setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                      }}
                                      title="Remover horário"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="preset-horarios">
                      <span>Predefinições rápidas:</span>
                      <div className="preset-buttons">
                        <button
                          type="button"
                          className="btn-preset"
                          onClick={() => {
                            const novosDias = formMedico.diasAtendimento.map(dia => ({
                              ...dia,
                              horarios: ['08:00', '09:00', '10:00', '11:00']
                            }));
                            setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                          }}
                        >
                          ⏰ Manhã (8h-11h)
                        </button>
                        <button
                          type="button"
                          className="btn-preset"
                          onClick={() => {
                            const novosDias = formMedico.diasAtendimento.map(dia => ({
                              ...dia,
                              horarios: ['14:00', '15:00', '16:00', '17:00']
                            }));
                            setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                          }}
                        >
                          🕒 Tarde (14h-17h)
                        </button>
                        <button
                          type="button"
                          className="btn-preset"
                          onClick={() => {
                            const novosDias = formMedico.diasAtendimento.map(dia => ({
                              ...dia,
                              horarios: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
                            }));
                            setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                          }}
                        >
                          🌅 Integral (8h-17h)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="loading-spinner-small"></div>
                          Cadastrando...
                        </>
                      ) : (
                        '👨‍⚕️ Cadastrar Médico'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Modal Cadastrar Admin */}
              {modalType === 'admin' && (
                <form onSubmit={handleCreateAdmin} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input
                        type="text"
                        value={formAdmin.nome}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={formAdmin.email}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="tel"
                        value={formAdmin.telefone}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, telefone: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Senha *</label>
                      <input
                        type="password"
                        value={formAdmin.senha}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, senha: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Cadastrando...' : 'Cadastrar Admin'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Modal Editar Médico */}
              {modalType === 'editar-medico' && (
                <form onSubmit={handleUpdateMedico} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input
                        type="text"
                        value={formMedico.nome}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={formMedico.email}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="tel"
                        value={formMedico.telefone}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, telefone: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nova Senha (deixe em branco para manter atual)</label>
                      <input
                        type="password"
                        value={formMedico.senha}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Deixe em branco para não alterar"
                      />
                    </div>
                    <div className="form-group">
                      <label>Especialidade *</label>
                      <select
                        value={formMedico.especialidade}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, especialidade: e.target.value }))}
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Ginecologista">Ginecologista</option>
                        <option value="Ortopedista">Ortopedista</option>
                        <option value="Endocrinologista">Endocrinologista</option>
                        <option value="Geriatra">Geriatra</option>
                        <option value="Psiquiatra">Psiquiatra</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>CRM *</label>
                      <input
                        type="text"
                        value={formMedico.crm}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, crm: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Consultório</label>
                      <input
                        type="text"
                        value={formMedico.consultorio}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, consultorio: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Atualizando...' : '💾 Atualizar Médico'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedAgendamento(null);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Modal Editar Usuário */}
              {modalType === 'editar-usuario' && (
                <form onSubmit={handleUpdateUsuario} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input
                        type="text"
                        value={formAdmin.nome}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={formAdmin.email}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="tel"
                        value={formAdmin.telefone}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, telefone: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nova Senha (deixe em branco para manter atual)</label>
                      <input
                        type="password"
                        value={formAdmin.senha}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Deixe em branco para não alterar"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Atualizando...' : '💾 Atualizar Usuário'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedAgendamento(null);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Modal Detalhes da Consulta */}
              {modalType === 'detalhes-consulta' && selectedAgendamento && (
                <div className="detalhes-consulta">
                  <div className="detalhes-grid">
                    <div className="detalhe-item">
                      <label>Paciente:</label>
                      <span>{selectedAgendamento.paciente?.nome || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Email do Paciente:</label>
                      <span>{selectedAgendamento.paciente?.email || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Telefone:</label>
                      <span>{selectedAgendamento.paciente?.telefone || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Médico:</label>
                      <span>{selectedAgendamento.medico?.nome || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Especialidade:</label>
                      <span>{selectedAgendamento.especialidade || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Data:</label>
                      <span>
                        {selectedAgendamento.data ?
                          new Date(selectedAgendamento.data).toLocaleDateString('pt-BR') : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="detalhe-item">
                      <label>Horário:</label>
                      <span>{selectedAgendamento.horario || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Status:</label>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedAgendamento.status) }}>
                        {selectedAgendamento.status || 'N/A'}
                      </span>
                    </div>
                    {selectedAgendamento.observacoes && (
                      <div className="detalhe-item full-width">
                        <label>Observações:</label>
                        <span>{selectedAgendamento.observacoes}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    {selectedAgendamento.status === 'agendado' && (
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          handleCancelarConsultaAdmin(selectedAgendamento._id);
                          setShowModal(false);
                        }}
                      >
                        ❌ Cancelar Consulta
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowModal(false)}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;