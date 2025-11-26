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
    canceladas: 0,
    tempoMedio: '0 min'
  });
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const userData = authService.getCurrentUser();

      if (!userData) {
        navigate('/login');
        return;
      }

      let medicoData = null;
      try {
        medicoData = await medicoService.getMeusDados();
      } catch (medicoError) {
        try {
          const todosMedicos = await medicoService.getMedicos();
          medicoData = todosMedicos.find(medico => {
            const matchById = medico.usuario?._id === userData.id;
            const matchByEmail = medico.usuario?.email === userData.email;
            return matchById || matchByEmail;
          });
        } catch (altError) {
          console.error('❌ Erro no método alternativo:', altError);
        }
      }

      if (medicoData) {
        setMedico({
          nome: medicoData.nome || medicoData.usuario?.nome || userData.nome || 'Médico',
          especialidade: medicoData.especialidade || 'Especialidade não informada',
          matricula: userData.email || 'N/A'
        });
      } else {
        setMedico({
          nome: userData.nome || 'Médico',
          especialidade: 'Especialidade não configurada',
          matricula: userData.email || 'N/A'
        });
      }

      try {
        const atendimentos = await agendamentoService.getAgendamentosMedico();

        if (atendimentos && Array.isArray(atendimentos)) {
          const hoje = new Date().toISOString().split('T')[0];

          const atendimentosHoje = atendimentos.filter(ag => {
            if (!ag.data) return false;
            const agDate = new Date(ag.data).toISOString().split('T')[0];
            const isHoje = agDate === hoje;
            const statusValido = ['agendado', 'confirmado'].includes(ag.status);
            return isHoje && statusValido;
          });

          setProximosAtendimentos(atendimentosHoje.slice(0, 5));
          calcularEstatisticas(atendimentos);
        } else {
          setProximosAtendimentos([]);
          calcularEstatisticas([]);
        }
      } catch (atendimentoError) {
        if (atendimentoError.message && atendimentoError.message.includes('Cannot GET')) {
          setError('Funcionalidade em desenvolvimento. O endpoint de agendamentos para médicos está sendo implementado.');
        } else if (atendimentoError.response?.status === 404) {
          setError('Endpoint de agendamentos não encontrado. O sistema está em desenvolvimento.');
        } else {
          setError('Erro ao carregar agendamentos: ' + (atendimentoError.message || 'Erro desconhecido'));
        }

        setProximosAtendimentos([]);
        calcularEstatisticas([]);
      }

    } catch (error) {
      console.error('❌ Erro geral ao carregar dashboard:', error);
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido ao carregar dados';
      setError('Erro ao carregar dashboard: ' + errorMessage);

      const userData = authService.getCurrentUser();
      if (userData) {
        setMedico({
          nome: userData.nome || 'Médico',
          especialidade: 'Erro ao carregar especialidade',
          matricula: userData.email || 'N/A'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (atendimentos) => {
    if (!atendimentos || !Array.isArray(atendimentos)) {
      setEstatisticas({
        consultasHoje: 0,
        realizadas: 0,
        canceladas: 0,
        tempoMedio: '0 min'
      });
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];

    const consultasHoje = atendimentos.filter(ag => {
      if (!ag.data) return false;
      const agDate = new Date(ag.data).toISOString().split('T')[0];
      return agDate === hoje && ['agendado', 'confirmado'].includes(ag.status);
    }).length;

    const realizadas = atendimentos.filter(ag => ag.status === 'realizado').length;
    const canceladas = atendimentos.filter(ag => ag.status === 'cancelado').length;
    const consultasRealizadas = atendimentos.filter(ag => ag.status === 'realizado');
    const tempoMedio = consultasRealizadas.length > 0 ? '25 min' : '0 min';

    setEstatisticas({
      consultasHoje,
      realizadas,
      canceladas,
      tempoMedio
    });
  };

  const handleIniciarAtendimento = async (atendimentoId) => {
    try {
      await agendamentoService.marcarComoRealizado(atendimentoId);
      alert('✅ Atendimento iniciado com sucesso!');
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      const errorMessage = error?.message || 'Erro ao iniciar atendimento';
      alert('❌ Erro: ' + errorMessage);
    }
  };

  const handleFinalizarAtendimento = async (atendimentoId) => {
    try {
      await agendamentoService.marcarComoRealizado(atendimentoId);
      alert('✅ Atendimento finalizado com sucesso!');
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      const errorMessage = error?.message || 'Erro ao finalizar atendimento';
      alert('❌ Erro: ' + errorMessage);
    }
  };

  const handleCancelarAtendimento = async (atendimentoId) => {
    if (window.confirm('Tem certeza que deseja cancelar este atendimento?')) {
      try {
        await agendamentoService.cancelarAgendamento(atendimentoId);
        alert('✅ Atendimento cancelado com sucesso!');
        await loadDashboardData();
      } catch (error) {
        console.error('Erro ao cancelar atendimento:', error);
        const errorMessage = error?.message || 'Erro ao cancelar atendimento';
        alert('❌ Erro: ' + errorMessage);
      }
    }
  };

  const handleVerAgenda = () => {
    navigate('/agenda-medico');
  };

  const handleVerPacientes = () => {
    navigate('/pacientes-medico');
  };

  const handleVerRelatorios = () => {
    navigate('/relatorios-medico');
  };

  const handlePerfil = () => {
    navigate('/perfil-medico');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return '#10b981';
      case 'agendado': return '#f59e0b';
      case 'realizado': return '#3b82f6';
      case 'cancelado': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'agendado': return 'Agendado';
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
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando dashboard médico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-medico-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>👨‍⚕️ Olá, {medico.nome}</h1>
            <p>{medico.especialidade} • {medico.matricula}</p>
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

      {/* Main Content */}
      <main className="admin-main">
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

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon today">📅</div>
            <div className="stat-content">
              <h3>{estatisticas.consultasHoje}</h3>
              <p>Consultas Hoje</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">✅</div>
            <div className="stat-content">
              <h3>{estatisticas.realizadas}</h3>
              <p>Realizadas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">⏰</div>
            <div className="stat-content">
              <h3>{estatisticas.tempoMedio}</h3>
              <p>Tempo Médio</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">❌</div>
            <div className="stat-content">
              <h3>{estatisticas.canceladas}</h3>
              <p>Canceladas</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-header">
            <h2>🚀 Ações Rápidas</h2>
          </div>
          <div className="actions-grid">
            <button className="action-card primary" onClick={handleVerAgenda}>
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h3>Minha Agenda</h3>
                <p>Gerencie seus agendamentos e horários</p>
              </div>
              <div className="action-arrow">→</div>
            </button>

            <div className="secondary-actions">
              <button className="action-card" onClick={handleVerPacientes}>
                <div className="action-icon">👥</div>
                <div className="action-content">
                  <h4>Meus Pacientes</h4>
                  <p>Visualize o histórico de pacientes</p>
                </div>
              </button>

              <button className="action-card" onClick={handleVerRelatorios}>
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h4>Relatórios</h4>
                  <p>Acesse relatórios e estatísticas</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Próximos Atendimentos */}
        <div className="content-section">
          <div className="section-header">
            <h2>🩺 Próximos Atendimentos</h2>
            <button className="btn btn-outline" onClick={handleVerAgenda}>
              Ver Agenda Completa
            </button>
          </div>

          {proximosAtendimentos.length > 0 ? (
            <div className="cards-grid">
              {proximosAtendimentos.map((atendimento) => (
                <div key={atendimento._id} className="card appointment-card">
                  <div className="card-header">
                    <div className="user-info">
                      <h3 className="user-name">{atendimento.paciente?.nome || 'Paciente'}</h3>
                      <p className="user-email">
                        {atendimento.tipoConsulta === 'telemedicina' ? '📱 Telemedicina' : '🏥 Presencial'}
                      </p>
                    </div>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(atendimento.status) }}
                    >
                      {getStatusText(atendimento.status)}
                    </span>
                  </div>

                  <div className="card-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">📅 Data</span>
                        <span className="info-value">{formatarData(atendimento.data)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">⏰ Horário</span>
                        <span className="info-value">{atendimento.horario}</span>
                      </div>
                      {atendimento.status === 'agendado' && (
                        <div className="info-item">
                          <span className="info-label">⏱️ Espera</span>
                          <span className="info-value">
                            {calcularTempoEspera(atendimento.data, atendimento.horario)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-actions">
                    {atendimento.status === 'agendado' && (
                      <>
                        <button
                          className="btn btn-icon success"
                          onClick={() => handleIniciarAtendimento(atendimento._id)}
                          title="Iniciar Atendimento"
                        >
                          🩺
                        </button>
                        <button
                          className="btn btn-icon danger"
                          onClick={() => handleCancelarAtendimento(atendimento._id)}
                          title="Cancelar Atendimento"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    {atendimento.status === 'confirmado' && (
                      <button
                        className="btn btn-icon primary"
                        onClick={() => handleFinalizarAtendimento(atendimento._id)}
                        title="Finalizar Atendimento"
                      >
                        ✅
                      </button>
                    )}
                    <button
                      className="btn btn-icon"
                      onClick={() => navigate(`/agenda-medico`)}
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
              <h3>Nenhum atendimento hoje</h3>
              <p>Não há consultas agendadas para hoje</p>
              <button className="btn btn-outline" onClick={handleVerAgenda}>
                Ver Agenda Completa
              </button>
            </div>
          )}
        </div>

        {/* Lembrete */}
        {estatisticas.consultasHoje > 0 && (
          <div className="notification-banner">
            <div className="notification-icon">🔔</div>
            <div className="notification-content">
              <strong>Lembrete:</strong> Você tem {estatisticas.consultasHoje} consultas hoje.
              Tempo médio de atendimento: {estatisticas.tempoMedio}
            </div>
            <button className="btn btn-outline btn-sm">OK</button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Dashboard</span>
          </button>

          <button
            className={`nav-tab ${activeMenu === 'agenda' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('agenda');
              handleVerAgenda();
            }}
          >
            <span className="tab-icon">📅</span>
            <span className="tab-label">Agenda</span>
          </button>

          <button
            className={`nav-tab ${activeMenu === 'pacientes' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('pacientes');
              handleVerPacientes();
            }}
          >
            <span className="tab-icon">👥</span>
            <span className="tab-label">Pacientes</span>
          </button>

          <button
            className={`nav-tab ${activeMenu === 'relatorios' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('relatorios');
              handleVerRelatorios();
            }}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">Relatórios</span>
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

export default DashboardMedico;