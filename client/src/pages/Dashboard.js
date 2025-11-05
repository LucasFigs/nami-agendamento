import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userName, setUserName] = useState('Paciente');
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);
  const [activeMenu, setActiveMenu] = useState('home');
  const navigate = useNavigate();

  const mockAgendamentos = [
    {
      id: 1,
      data: '2024-01-15',
      horario: '14:00',
      medico: 'Dr. João Silva',
      especialidade: 'Cardiologia',
      status: 'Confirmado',
      local: 'Consultório A - Bloco Z'
    },
    {
      id: 2,
      data: '2024-01-20',
      horario: '10:30',
      medico: 'Dra. Maria Santos',
      especialidade: 'Dermatologia',
      status: 'Agendado',
      local: 'Consultório B - Bloco Y'
    }
  ];

  const estatisticas = {
    consultasHoje: 2,
    proximaConsulta: '15/01/2024 - 14:00',
    totalRealizadas: 12,
    totalFaltas: 1
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // TODO: Integrar com API
    setProximosAgendamentos(mockAgendamentos);
    setUserName('Leandro Soares');
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

  const handleCancelarAgendamento = (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      alert(`Agendamento #${id} cancelado com sucesso!`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmado': return '✅';
      case 'Agendado': return '⏰';
      case 'Cancelado': return '❌';
      case 'Realizado': return '✅';
      default: return '📅';
    }
  };

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
              <h1 className="greeting">Olá, {userName}</h1>
              <p className="welcome">Bem-vindo ao NAMI</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
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

            <div className="action-card" onClick={handleVerHistorico}>
              <div className="action-icon">📊</div>
              <div className="action-text">
                <h4>Histórico</h4>
                <p>Consultas realizadas</p>
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
                <div key={agendamento.id} className="agendamento-card">
                  <div className="agendamento-header">
                    <div className="agendamento-date">
                      <span className="date-badge">
                        {formatDate(agendamento.data)}
                      </span>
                      <span className="time">{agendamento.horario}</span>
                    </div>
                    <div className={`status-badge ${agendamento.status.toLowerCase()}`}>
                      {getStatusIcon(agendamento.status)} {agendamento.status}
                    </div>
                  </div>
                  
                  <div className="agendamento-info">
                    <h4 className="medico-name">{agendamento.medico}</h4>
                    <p className="especialidade">{agendamento.especialidade}</p>
                    <p className="local">📍 {agendamento.local}</p>
                  </div>
                  
                  <div className="agendamento-actions">
                    <button className="action-btn secondary">
                      📞 Lembrar
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => handleCancelarAgendamento(agendamento.id)}
                    >
                      ❌ Cancelar
                    </button>
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
        <div className="notification-banner">
          <div className="notification-icon">🔔</div>
          <div className="notification-content">
            <strong>Lembrete:</strong> Sua consulta com Dr. João Silva é amanhã às 14:00
          </div>
          <button className="notification-action">OK</button>
        </div>
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
          className={`nav-item ${activeMenu === 'historico' ? 'active' : ''}`}
          onClick={() => {
            setActiveMenu('historico');
            handleVerHistorico();
          }}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Histórico</span>
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