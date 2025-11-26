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
    totalCanceladas: 0
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

      const userData = authService.getCurrentUser();
      setUser(userData);

      const agendamentos = await agendamentoService.getAgendamentosPaciente();
      setProximosAgendamentos(agendamentos.slice(0, 3));

      calcularEstatisticas(agendamentos);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      alert('❌ Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatarDataLocal = (dataString) => {
    try {
      const [ano, mes, dia] = dataString.split('-').map(Number);
      const dataLocal = new Date(ano, mes - 1, dia);
      return dataLocal.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', dataString, error);
      return 'Data inválida';
    }
  };

  const calcularEstatisticas = (agendamentos) => {
    const hoje = new Date();
    const hojeISO = hoje.toISOString().split('T')[0];

    const consultasHoje = agendamentos.filter(ag => {
      if (!ag.data) return false;
      return ag.data === hojeISO && ag.status === 'agendado';
    }).length;

    const proxima = agendamentos
      .filter(ag => {
        if (!ag.data || ag.status !== 'agendado') return false;
        return ag.data >= hojeISO;
      })
      .sort((a, b) => a.data.localeCompare(b.data))[0];

    const totalRealizadas = agendamentos.filter(ag =>
      ag.status === 'realizado'
    ).length;

    const totalCanceladas = agendamentos.filter(ag =>
      ag.status === 'cancelado'
    ).length;

    setEstatisticas({
      consultasHoje,
      proximaConsulta: proxima ?
        `${formatarDataLocal(proxima.data)} - ${proxima.horario}` :
        'Nenhuma',
      totalRealizadas,
      totalCanceladas
    });
  };

  const handleAgendarConsulta = () => {
    navigate('/agendamento');
  };

  const handleVerAgendamentos = () => {
    navigate('/agendamentos');
  };

  const handlePerfil = () => {
    navigate('/perfil');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCancelarAgendamento = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await agendamentoService.cancelarAgendamento(id);
        alert('✅ Agendamento cancelado com sucesso!');
        loadDashboardData();
      } catch (error) {
        alert('❌ Erro ao cancelar agendamento: ' + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return '#f59e0b';
      case 'realizado': return '#10b981';
      case 'cancelado': return '#ef4444';
      case 'confirmado': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'realizado': return 'Realizado';
      case 'cancelado': return 'Cancelado';
      case 'confirmado': return 'Confirmado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>👋 Olá, {user?.nome || 'Paciente'}</h1>
            <p>Bem-vindo de volta ao NAMI</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={handleLogout}
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-header">
            <h2>🚀 Ações Rápidas</h2>
          </div>
          <div className="actions-grid">
            <button className="action-card primary" onClick={handleAgendarConsulta}>
              <div className="action-icon">📅</div>
              <div className="action-content">
                <h3>Agendar Consulta</h3>
                <p>Marque uma nova consulta com nossos especialistas</p>
              </div>
              <div className="action-arrow">→</div>
            </button>

            <div className="secondary-actions">
              <button className="action-card" onClick={handleVerAgendamentos}>
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h4>Meus Agendamentos</h4>
                  <p>Veja todos os seus agendamentos</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="content-section">
          <div className="section-header">
            <h2>📊 Visão Geral</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon today">🎯</div>
              <div className="stat-content">
                <h3>{estatisticas.consultasHoje}</h3>
                <p>Consultas Hoje</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon upcoming">⏰</div>
              <div className="stat-content">
                <h3>{estatisticas.proximaConsulta.split(' - ')[0]}</h3>
                <p>Próxima Consulta</p>
                {estatisticas.proximaConsulta !== 'Nenhuma' && (
                  <div className="stat-subtitle">{estatisticas.proximaConsulta.split(' - ')[1]}</div>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">✅</div>
              <div className="stat-content">
                <h3>{estatisticas.totalRealizadas}</h3>
                <p>Realizadas</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon danger">❌</div>
              <div className="stat-content">
                <h3>{estatisticas.totalCanceladas}</h3>
                <p>Canceladas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Agendamentos */}
        <div className="content-section">
          <div className="section-header">
            <h2>📅 Próximos Agendamentos</h2>
            <button className="btn btn-outline" onClick={handleVerAgendamentos}>
              Ver Todos
            </button>
          </div>

          {proximosAgendamentos.length > 0 ? (
            <div className="cards-grid">
              {proximosAgendamentos.map((agendamento) => (
                <div key={agendamento._id} className="card appointment-card">
                  <div className="card-header">
                    <div className="user-info">
                      <h3 className="user-name">{agendamento.medico?.nome || 'Médico'}</h3>
                      <p className="user-email">{agendamento.medico?.especialidade || 'Especialidade'}</p>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(agendamento.status) }}
                    >
                      {getStatusText(agendamento.status)}
                    </span>
                  </div>
                  
                  <div className="card-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">📅 Data</span>
                        <span className="info-value">{formatarDataLocal(agendamento.data)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">⏰ Horário</span>
                        <span className="info-value">{agendamento.horario}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">📍 Tipo</span>
                        <span className="info-value">
                          {agendamento.tipoConsulta === 'telemedicina' ? '📱 Telemedicina' : '🏥 Presencial'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    {agendamento.status === 'agendado' && (
                      <button 
                        className="btn btn-icon danger"
                        onClick={() => handleCancelarAgendamento(agendamento._id)}
                        title="Cancelar Consulta"
                      >
                        ❌
                      </button>
                    )}
                    <button 
                      className="btn btn-icon"
                      onClick={() => navigate(`/agendamentos`)}
                      title="Ver Detalhes"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>Nenhum agendamento futuro</h3>
              <p>Você não possui agendamentos futuros no momento</p>
              <button className="btn btn-primary" onClick={handleAgendarConsulta}>
                Agendar Primeira Consulta
              </button>
            </div>
          )}
        </div>

        {/* Lembrete */}
        {estatisticas.proximaConsulta !== 'Nenhuma' && (
          <div className="notification-banner">
            <div className="notification-icon">🔔</div>
            <div className="notification-content">
              <strong>Lembrete:</strong> Sua próxima consulta é {estatisticas.proximaConsulta}
            </div>
            <button className="btn btn-outline btn-sm">OK</button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeMenu === 'home' ? 'active' : ''}`}
            onClick={() => setActiveMenu('home')}
          >
            <span className="tab-icon">🏠</span>
            <span className="tab-label">Início</span>
          </button>

          <button
            className={`nav-tab ${activeMenu === 'agendar' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('agendar');
              handleAgendarConsulta();
            }}
          >
            <span className="tab-icon">📅</span>
            <span className="tab-label">Agendar</span>
          </button>

          <button
            className={`nav-tab ${activeMenu === 'perfil' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('perfil');
              handlePerfil();
            }}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;