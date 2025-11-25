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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // No DashboardMedico.js, atualize a função loadDashboardData:
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Carregando dados do dashboard médico...');

      // Carregar dados do médico
      const userData = authService.getCurrentUser();
      console.log('Usuário atual:', userData);

      if (!userData) {
        navigate('/login');
        return;
      }

      try {
        const medicoData = await medicoService.getMeusDados();
        console.log('Dados do médico:', medicoData);

        setMedico({
          nome: medicoData.nome || userData?.nome || 'Médico',
          especialidade: medicoData.especialidade || 'Especialidade',
          matricula: userData?.email || 'N/A'
        });
      } catch (medicoError) {
        console.error('Erro ao carregar dados do médico:', medicoError);
        setMedico({
          nome: userData?.nome || 'Médico',
          especialidade: 'Especialidade não informada',
          matricula: userData?.email || 'N/A'
        });
      }

      // Carregar atendimentos - COM TRATAMENTO MELHORADO
      try {
        const atendimentos = await agendamentoService.getAgendamentosMedico();
        console.log('Atendimentos carregados:', atendimentos);

        if (atendimentos && Array.isArray(atendimentos)) {
          const hoje = new Date().toISOString().split('T')[0];

          const atendimentosHoje = atendimentos.filter(ag => {
            if (!ag.data) return false;
            const agDate = new Date(ag.data).toISOString().split('T')[0];
            return agDate === hoje && ['agendado', 'confirmado'].includes(ag.status);
          });

          setProximosAtendimentos(atendimentosHoje.slice(0, 5));
          calcularEstatisticas(atendimentos);
        } else {
          console.warn('Nenhum agendamento retornado ou formato inválido');
          setProximosAtendimentos([]);
          calcularEstatisticas([]);
        }
      } catch (atendimentoError) {
        console.error('Erro ao carregar atendimentos:', atendimentoError);

        // Se for erro 404 (endpoint não existe), mostrar mensagem específica
        if (atendimentoError.message && atendimentoError.message.includes('Cannot GET')) {
          setError('Funcionalidade em desenvolvimento. O endpoint de agendamentos para médicos está sendo implementado.');
        } else {
          setError('Erro ao carregar agendamentos: ' + (atendimentoError.message || 'Erro desconhecido'));
        }

        setProximosAtendimentos([]);
        calcularEstatisticas([]);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dashboard:', error);
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido ao carregar dados';
      setError('Erro ao carregar dashboard: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const calcularEstatisticas = (atendimentos) => {
    if (!atendimentos || !Array.isArray(atendimentos)) {
      setEstatisticas({
        consultasHoje: 0,
        realizadas: 0,
        faltas: 0,
        tempoMedio: '0 min'
      });
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];

    const consultasHoje = atendimentos.filter(ag => {
      if (!ag.data) return false;
      const agDate = new Date(ag.data).toISOString().split('T')[0];
      return agDate === hoje;
    }).length;

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
      // Usar a função correta do agendamentoService
      await agendamentoService.marcarComoRealizado(atendimentoId);
      alert('Atendimento iniciado com sucesso!');
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      const errorMessage = error?.message || 'Erro ao iniciar atendimento';
      alert('Erro: ' + errorMessage);
    }
  };

  const handleFinalizarAtendimento = async (atendimentoId) => {
    try {
      // Para finalizar, também usamos marcarComoRealizado
      await agendamentoService.marcarComoRealizado(atendimentoId);
      alert('Atendimento finalizado com sucesso!');
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      const errorMessage = error?.message || 'Erro ao finalizar atendimento';
      alert('Erro: ' + errorMessage);
    }
  };

  const handleCancelarAtendimento = async (atendimentoId) => {
    if (window.confirm('Tem certeza que deseja cancelar este atendimento?')) {
      try {
        await agendamentoService.cancelarAgendamento(atendimentoId);
        alert('Atendimento cancelado com sucesso!');
        await loadDashboardData();
      } catch (error) {
        console.error('Erro ao cancelar atendimento:', error);
        const errorMessage = error?.message || 'Erro ao cancelar atendimento';
        alert('Erro: ' + errorMessage);
      }
    }
  };

  const handleVerAgenda = () => {
    navigate('/agenda-medico');
  };

  const handleVerPacientes = () => {
    navigate('/pacientes');
  };

  const handleVerRelatorios = () => {
    navigate('/relatorios-medico');
  };

  const handlePerfil = () => {
    navigate('/perfil-medico');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return '#28a745';
      case 'agendado': return '#f59e0b';
      case 'realizado': return '#10b981';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
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
    try {
      if (!data || !horario) return '0 min';

      const agora = new Date();
      const [hora, minuto] = horario.split(':');
      const horarioConsulta = new Date(data);
      horarioConsulta.setHours(parseInt(hora), parseInt(minuto));

      const diffMs = agora - horarioConsulta;
      const diffMins = Math.floor(diffMs / 60000);

      return diffMins > 0 ? `${diffMins} min` : '0 min';
    } catch {
      return '0 min';
    }
  };

  const formatarData = (dataString) => {
    try {
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
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
      </div>

      <div className="dashboard-content">
        {/* Mensagem de Erro */}
        {error && (
          <div className="error-alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>Erro ao carregar dados</h4>
              <p>{error}</p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => loadDashboardData()}
            >
              🔄 Tentar Novamente
            </button>
          </div>
        )}

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
                        {formatarData(atendimento.data)}
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
                      <>
                        <button
                          className="action-btn primary small"
                          onClick={() => handleIniciarAtendimento(atendimento._id)}
                        >
                          🩺 Iniciar Atendimento
                        </button>
                        <button
                          className="action-btn danger small"
                          onClick={() => handleCancelarAtendimento(atendimento._id)}
                        >
                          ❌ Cancelar
                        </button>
                      </>
                    )}
                    {atendimento.status === 'confirmado' && (
                      <button
                        className="action-btn success small"
                        onClick={() => handleFinalizarAtendimento(atendimento._id)}
                      >
                        ✅ Finalizar Atendimento
                      </button>
                    )}
                    {(atendimento.status === 'realizado' || atendimento.status === 'cancelado') && (
                      <span className="status-text">
                        {atendimento.status === 'realizado' ? 'Consulta realizada' : 'Consulta cancelada'}
                      </span>
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