import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { agendamentoService } from '../services/agendamentoService';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    consultasHoje: 0,
    proximaConsulta: 'Nenhuma',
    totalRealizadas: 0,
    totalFaltas: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar dados do usuário
      const userData = authService.getCurrentUser();
      setUser(userData);

      // Carregar agendamentos
      const agendamentos = await agendamentoService.getAgendamentosPaciente();
      setProximosAgendamentos(agendamentos.slice(0, 3)); // Mostrar apenas 3 próximos

      // Calcular estatísticas
      calcularEstatisticas(agendamentos);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      alert('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Função para formatar data sem problemas de timezone
  const formatarDataLocal = (dataString) => {
    try {
      // Divide a string YYYY-MM-DD e cria a data no timezone local
      const [ano, mes, dia] = dataString.split('-').map(Number);
      const dataLocal = new Date(ano, mes - 1, dia); // mes - 1 porque JavaScript usa 0-11
      return dataLocal.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', dataString, error);
      return 'Data inválida';
    }
  };

  const calcularEstatisticas = (agendamentos) => {
    console.log('📊 CALCULANDO ESTATÍSTICAS - Agendamentos:', agendamentos);

    // Data de HOJE em formato ISO (YYYY-MM-DD)
    const hoje = new Date();
    const hojeISO = hoje.toISOString().split('T')[0];

    console.log('📅 HOJE (ISO):', hojeISO);

    // Consultas de HOJE - comparação direta por string ISO
    const consultasHoje = agendamentos.filter(ag => {
      if (!ag.data) return false;

      // A data já vem no formato YYYY-MM-DD do backend
      const isHoje = ag.data === hojeISO;
      const isAgendado = ag.status === 'agendado';

      console.log(`🔍 ${ag.medico?.nome} - Data: ${ag.data} - Hoje: ${isHoje} - Status: ${ag.status}`);

      return isHoje && isAgendado;
    }).length;

    console.log('🎯 CONSULTAS HOJE ENCONTRADAS:', consultasHoje);

    // PRÓXIMA consulta (hoje ou futura) - comparação por string ISO
    const proxima = agendamentos
      .filter(ag => {
        if (!ag.data || ag.status !== 'agendado') return false;

        // Comparação por string ISO (YYYY-MM-DD)
        return ag.data >= hojeISO;
      })
      .sort((a, b) => a.data.localeCompare(b.data))[0]; // Ordena por string

    if (proxima) {
      console.log('✅ PRÓXIMA CONSULTA:', {
        medico: proxima.medico?.nome,
        data: proxima.data,
        dataFormatada: new Date(proxima.data).toLocaleDateString('pt-BR'),
        horario: proxima.horario
      });
    }

    const totalRealizadas = agendamentos.filter(ag =>
      ag.status === 'realizado'
    ).length;

    const totalFaltas = agendamentos.filter(ag =>
      ag.status === 'cancelado'
    ).length;

    setEstatisticas({
      consultasHoje,
      proximaConsulta: proxima ?
        `${formatarDataLocal(proxima.data)} - ${proxima.horario}` :
        'Nenhuma',
      totalRealizadas,
      totalFaltas
    });
  };

  const handleAgendarConsulta = () => {
    navigate('/agendamento');
  };

  const handleVerAgendamentos = () => {
    navigate('/agendamentos');
  };

  const handleVerHistorico = () => {
    navigate('/historico');
  };

  const handlePerfil = () => {
    navigate('/perfil');
  };

  const handleCancelarAgendamento = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await agendamentoService.cancelarAgendamento(id);
        alert('Agendamento cancelado com sucesso!');
        loadDashboardData(); // Recarregar dados
      } catch (error) {
        alert('Erro ao cancelar agendamento: ' + error.message);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'agendado':
      case 'Confirmado': return '✅';
      case 'cancelado': return '❌';
      case 'realizado': return '✅';
      default: return '📅';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'agendado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      case 'realizado': return 'Realizado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar-container">
              <div className="avatar">👤</div>
              <div className="online-indicator"></div>
            </div>
            <div className="user-details">
              <h1 className="greeting">Olá, {user?.nome || 'Paciente'}</h1>
              <p className="welcome">Bem-vindo ao NAMI</p>
            </div>
          </div>
          <div className="header-actions">
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Cards de Ação Rápida */}
        <div className="quick-actions">
          <div className="action-card primary" onClick={handleAgendarConsulta}>
            <div className="action-icon">📅</div>
            <div className="action-text">
              <h3>Agendar Consulta</h3>
              <p>Marque uma nova consulta</p>
            </div>
            <div className="action-arrow">→</div>
          </div>

          <div className="action-grid">
            <div className="action-card" onClick={handleVerAgendamentos}>
              <div className="action-icon">📋</div>
              <div className="action-text">
                <h4>Meus Agendamentos</h4>
                <p>Ver todos os agendamentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Próximos Agendamentos */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">📅 Próximos Agendamentos</h2>
            <button className="see-all-button" onClick={handleVerAgendamentos}>
              Ver Todos
            </button>
          </div>

          {proximosAgendamentos.length > 0 ? (
            <div className="agendamentos-list">
              {proximosAgendamentos.map((agendamento) => (
                <div key={agendamento._id} className="agendamento-card">
                  <div className="agendamento-header">
                    <div className="agendamento-date">
                      <span className="date-badge">
                        {formatarDataLocal(agendamento.data)}
                      </span>
                      <span className="time">{agendamento.horario}</span>
                    </div>
                    <div className={`status-badge ${agendamento.status.toLowerCase()}`}>
                      {getStatusIcon(agendamento.status)} {getStatusText(agendamento.status)}
                    </div>
                  </div>

                  <div className="agendamento-info">
                    <h4 className="medico-name">{agendamento.medico?.nome || 'Médico'}</h4>
                    <p className="especialidade">{agendamento.medico?.especialidade || 'Especialidade'}</p>
                    <p className="local">📍 {agendamento.tipoConsulta === 'telemedicina' ? 'Consulta Online' : 'Consultório'}</p>
                  </div>

                  <div className="agendamento-actions">
                    {agendamento.status === 'agendado' && (
                      <button
                        className="action-btn danger"
                        onClick={() => handleCancelarAgendamento(agendamento._id)}
                      >
                        ❌ Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>Nenhum agendamento</h3>
              <p>Você não possui agendamentos futuros</p>
              <button className="primary-btn" onClick={handleAgendarConsulta}>
                Agendar Primeira Consulta
              </button>
            </div>
          )}
        </div>

        {/* Card de Estatísticas */}
        <div className="section-card">
          <h2 className="section-title">📊 Suas Estatísticas</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3>{estatisticas.consultasHoje}</h3>
                <p>Consultas Hoje</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <h3>{estatisticas.proximaConsulta.split(' - ')[0]}</h3>
                <p>Próxima Consulta</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{estatisticas.totalRealizadas}</h3>
                <p>Realizadas</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <h3>{estatisticas.totalFaltas}</h3>
                <p>Faltas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lembrete */}
        {estatisticas.proximaConsulta !== 'Nenhuma' && (
          <div className="notification-banner">
            <div className="notification-icon">🔔</div>
            <div className="notification-content">
              <strong>Lembrete:</strong> Sua próxima consulta é {estatisticas.proximaConsulta}
            </div>
            <button className="notification-action">OK</button>
          </div>
        )}
      </div>

      {/* Menu Inferior */}
      <div className="bottom-nav">
        <button
          className={`nav-item ${activeMenu === 'home' ? 'active' : ''}`}
          onClick={() => setActiveMenu('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>

        <button
          className={`nav-item ${activeMenu === 'agendar' ? 'active' : ''}`}
          onClick={() => {
            setActiveMenu('agendar');
            handleAgendarConsulta();
          }}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">Agendar</span>
        </button>

        <button
          className={`nav-item ${activeMenu === 'perfil' ? 'active' : ''}`}
          onClick={() => {
            setActiveMenu('perfil');
            handlePerfil();
          }}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;