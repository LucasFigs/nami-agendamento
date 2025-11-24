import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { agendamentoService } from '../services/agendamentoService';
import { medicoService } from '../services/medicoService';
import './DashboardMedico.css';

const DashboardMedico = () => {
  const [medico, setMedico] = useState({ 
    nome: '', 
    especialidade: '',
    matricula: ''
  });
  const [proximosAtendimentos, setProximosAtendimentos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    consultasHoje: 0,
    realizadas: 0,
    faltas: 0,
    tempoMedio: '0 min'
  });
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do médico
      const userData = authService.getCurrentUser();
      const medicoData = await medicoService.getMeusDados();
      
      setMedico({
        nome: medicoData.nome || userData?.nome || 'Médico',
        especialidade: medicoData.especialidade || 'Especialidade',
        matricula: userData?.email || 'N/A'
      });

      // Carregar atendimentos
      const atendimentos = await agendamentoService.getAgendamentosMedico();
      const hoje = new Date().toISOString().split('T')[0];
      
      const atendimentosHoje = atendimentos.filter(ag => 
        ag.data.split('T')[0] === hoje && 
        ['agendado', 'confirmado'].includes(ag.status)
      );
      
      setProximosAtendimentos(atendimentosHoje.slice(0, 5));

      // Calcular estatísticas
      calcularEstatisticas(atendimentos);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard médico:', error);
      alert('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (atendimentos) => {
    const hoje = new Date().toISOString().split('T')[0];
    
    const consultasHoje = atendimentos.filter(ag => 
      ag.data.split('T')[0] === hoje
    ).length;

    const realizadas = atendimentos.filter(ag => 
      ag.status === 'realizado'
    ).length;

    const faltas = atendimentos.filter(ag => 
      ag.status === 'cancelado'
    ).length;

    // Calcular tempo médio (simulação)
    const tempoMedio = consultasHoje > 0 ? '22 min' : '0 min';

    setEstatisticas({
      consultasHoje,
      realizadas,
      faltas,
      tempoMedio
    });
  };

  const handleIniciarAtendimento = async (atendimentoId) => {
    try {
      await agendamentoService.confirmarAgendamento(atendimentoId);
      alert('Atendimento iniciado com sucesso!');
      loadDashboardData(); // Recarregar dados
    } catch (error) {
      alert('Erro ao iniciar atendimento: ' + error.message);
    }
  };

  const handleFinalizarAtendimento = async (atendimentoId) => {
    try {
      await agendamentoService.finalizarAgendamento(atendimentoId);
      alert('Atendimento finalizado com sucesso!');
      loadDashboardData(); // Recarregar dados
    } catch (error) {
      alert('Erro ao finalizar atendimento: ' + error.message);
    }
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
      case 'confirmado': return '#28a745';
      case 'agendado': return '#ffc107';
      case 'realizado': return '#17a2b8';
      case 'cancelado': return '#6c757d';
      default: return '#003366';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'agendado': return 'Aguardando';
      case 'confirmado': return 'Confirmado';
      case 'realizado': return 'Realizado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const calcularTempoEspera = (data, horario) => {
    // Simulação de tempo de espera
    const agora = new Date();
    const [hora, minuto] = horario.split(':');
    const horarioConsulta = new Date(data);
    horarioConsulta.setHours(parseInt(hora), parseInt(minuto));
    
    const diffMs = agora - horarioConsulta;
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins > 0 ? `${diffMins} min` : '0 min';
  };

  if (loading) {
    return (
      <div className="dashboard-medico-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando dados médicos...</p>
        </div>
      </div>
    );
  }

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
              <p className="matricula">Email: {medico.matricula}</p>
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
                <div key={atendimento._id} className="atendimento-card">
                  <div className="atendimento-header">
                    <div className="paciente-info">
                      <h4 className="paciente-nome">{atendimento.paciente?.nome || 'Paciente'}</h4>
                      <p className="consulta-tipo">
                        {atendimento.tipoConsulta === 'telemedicina' ? 'Telemedicina' : 'Consulta Presencial'}
                      </p>
                    </div>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(atendimento.status) }}
                    >
                      {getStatusText(atendimento.status)}
                    </div>
                  </div>
                  
                  <div className="atendimento-details">
                    <div className="detail-item">
                      <span className="detail-label">Horário:</span>
                      <span className="detail-value">{atendimento.horario}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Data:</span>
                      <span className="detail-value">
                        {new Date(atendimento.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {atendimento.status === 'agendado' && (
                      <div className="detail-item">
                        <span className="detail-label">Tempo de Espera:</span>
                        <span className="detail-value">
                          {calcularTempoEspera(atendimento.data, atendimento.horario)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="atendimento-actions">
                    {atendimento.status === 'agendado' && (
                      <button 
                        className="action-btn primary small"
                        onClick={() => handleIniciarAtendimento(atendimento._id)}
                      >
                        🩺 Iniciar Atendimento
                      </button>
                    )}
                    {atendimento.status === 'confirmado' && (
                      <button 
                        className="action-btn success small"
                        onClick={() => handleFinalizarAtendimento(atendimento._id)}
                      >
                        ✅ Finalizar Atendimento
                      </button>
                    )}
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
        {estatisticas.consultasHoje > 0 && (
          <div className="notification-banner info">
            <div className="notification-icon">💡</div>
            <div className="notification-content">
              <strong>Lembrete:</strong> Você tem {estatisticas.consultasHoje} consultas hoje. 
              Tempo médio de atendimento: {estatisticas.tempoMedio}
            </div>
          </div>
        )}
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