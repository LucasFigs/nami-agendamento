import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardMedico.css';

const DashboardMedico = () => {
  const [medico, setMedico] = useState({ 
    nome: 'Dr. Leandro Soares', 
    especialidade: 'Cardiologia',
    matricula: '2023001234'  // 👈 Adicionado matrícula
  });
  const [proximosAtendimentos, setProximosAtendimentos] = useState([]);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();

  const mockAtendimentos = [
    {
      id: 1,
      paciente: 'Maria Santos',
      horario: '14:00',
      tipo: 'Consulta de Retorno',
      status: 'Confirmado',
      tempoEspera: '5 min'
    },
    {
      id: 2,
      paciente: 'Carlos Oliveira',
      horario: '14:30', 
      tipo: 'Primeira Consulta',
      status: 'Aguardando',
      tempoEspera: '15 min'
    },
    {
      id: 3,
      paciente: 'Ana Costa',
      horario: '15:00',
      tipo: 'Acompanhamento',
      status: 'Confirmado',
      tempoEspera: '25 min'
    }
  ];

  const estatisticas = {
    consultasHoje: 8,
    realizadas: 6,
    faltas: 1,
    tempoMedio: '22 min'
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // TODO: Integrar com API
    setProximosAtendimentos(mockAtendimentos);
  };

  const handleIniciarAtendimento = (atendimentoId) => {
    alert(`Iniciando atendimento do paciente #${atendimentoId}`);
    // navigate('/atendimento/' + atendimentoId);
  };

  const handleVerAgenda = () => {
    navigate('/agenda-medico');
  };

  const handleVerPacientes = () => {
    navigate('/pacientes');
  };

  const handleVerRelatorios = () => {
    navigate('/relatorios');
  };

  const handlePerfil = () => {
    navigate('/perfil-medico');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return '#28a745';
      case 'Aguardando': return '#ffc107';
      case 'Em Atendimento': return '#17a2b8';
      case 'Finalizado': return '#6c757d';
      default: return '#003366';
    }
  };

  return (
    <div className="dashboard-medico-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar-container">
              <div className="avatar">👨‍⚕️</div>
              <div className="online-indicator"></div>
            </div>
            <div className="user-details">
              <h1 className="greeting">{medico.nome}</h1>
              <p className="especialidade">{medico.especialidade}</p>
              <p className="matricula">Matrícula: {medico.matricula}</p> {/* 👈 Nova linha */}
            </div>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">2</span>
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Cards de Métricas */}
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">📅</div>
            <div className="metric-info">
              <h3>{estatisticas.consultasHoje}</h3>
              <p>Consultas Hoje</p>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon">✅</div>
            <div className="metric-info">
              <h3>{estatisticas.realizadas}</h3>
              <p>Realizadas</p>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">⏰</div>
            <div className="metric-info">
              <h3>{estatisticas.tempoMedio}</h3>
              <p>Tempo Médio</p>
            </div>
          </div>

          <div className="metric-card danger">
            <div className="metric-icon">❌</div>
            <div className="metric-info">
              <h3>{estatisticas.faltas}</h3>
              <p>Faltas</p>
            </div>
          </div>
        </div>

        {/* Card de Ações Rápidas */}
        <div className="section-card">
          <h2 className="section-title">⚡ Ações Rápidas</h2>
          <div className="quick-actions-grid">
            <button className="action-btn primary" onClick={handleVerAgenda}>
              <span className="action-icon">📋</span>
              <span className="action-text">Minha Agenda</span>
            </button>
            
            <button className="action-btn success" onClick={handleVerPacientes}>
              <span className="action-icon">👥</span>
              <span className="action-text">Meus Pacientes</span>
            </button>
            
            <button className="action-btn info" onClick={handleVerRelatorios}>
              <span className="action-icon">📊</span>
              <span className="action-text">Relatórios</span>
            </button>
            
            <button className="action-btn secondary" onClick={handlePerfil}>
              <span className="action-icon">👤</span>
              <span className="action-text">Meu Perfil</span>
            </button>
          </div>
        </div>

        {/* Card de Próximos Atendimentos */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">🩺 Próximos Atendimentos</h2>
            <button className="see-all-button" onClick={handleVerAgenda}>
              Ver Agenda Completa
            </button>
          </div>
          
          {proximosAtendimentos.length > 0 ? (
            <div className="atendimentos-list">
              {proximosAtendimentos.map((atendimento) => (
                <div key={atendimento.id} className="atendimento-card">
                  <div className="atendimento-header">
                    <div className="paciente-info">
                      <h4 className="paciente-nome">{atendimento.paciente}</h4>
                      <p className="consulta-tipo">{atendimento.tipo}</p>
                    </div>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(atendimento.status) }}
                    >
                      {atendimento.status}
                    </div>
                  </div>
                  
                  <div className="atendimento-details">
                    <div className="detail-item">
                      <span className="detail-label">Horário:</span>
                      <span className="detail-value">{atendimento.horario}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tempo de Espera:</span>
                      <span className="detail-value">{atendimento.tempoEspera}</span>
                    </div>
                  </div>
                  
                  <div className="atendimento-actions">
                    <button 
                      className="action-btn primary small"
                      onClick={() => handleIniciarAtendimento(atendimento.id)}
                    >
                      🩺 Iniciar Atendimento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>Nenhum atendimento agendado</h3>
              <p>Não há consultas agendadas para hoje</p>
            </div>
          )}
        </div>

        {/* Notificações */}
        <div className="notification-banner info">
          <div className="notification-icon">💡</div>
          <div className="notification-content">
            <strong>Lembrete:</strong> Você tem 2 consultas em espera. Tempo médio de atendimento: 22min
          </div>
        </div>
      </div>

      {/* Menu Inferior Médico */}
      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveMenu('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'agenda' ? 'active' : ''}`}
          onClick={() => {
            setActiveMenu('agenda');
            handleVerAgenda();
          }}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">Agenda</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'pacientes' ? 'active' : ''}`}
          onClick={() => {
            setActiveMenu('pacientes');
            handleVerPacientes();
          }}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Pacientes</span>
        </button>
        
        <button 
          className={`nav-item ${activeMenu === 'relatorios' ? 'active' : ''}`}
          onClick={() => {
            setActiveMenu('relatorios');
            handleVerRelatorios();
          }}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Relatórios</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardMedico;