import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService';
import './MeusAgendamentos.css';

const MeusAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [showReagendarModal, setShowReagendarModal] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAgendamentos();
  }, []);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      const agendamentosData = await agendamentoService.getAgendamentosPaciente();
      setAgendamentos(agendamentosData);
    } catch (error) {
      alert('❌ Erro ao carregar agendamentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReagendar = (agendamento) => {
    navigate('/agendamento', {
      state: {
        reagendamento: true,
        agendamentoId: agendamento._id,
        medicoSelecionado: agendamento.medico,
        especialidadeSelecionada: agendamento.especialidade || agendamento.medico?.especialidade,
        dataAtual: agendamento.data,
        horarioAtual: agendamento.horario
      }
    });
  };

  const handleCancelarAgendamento = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await agendamentoService.cancelarAgendamento(id);
        alert('✅ Agendamento cancelado com sucesso!');
        loadAgendamentos();
      } catch (error) {
        alert('❌ Erro ao cancelar agendamento: ' + error.message);
      }
    }
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    if (filtro === 'todos') return true;
    return agendamento.status === filtro;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return '#f59e0b';
      case 'cancelado': return '#ef4444';
      case 'realizado': return '#10b981';
      case 'confirmado': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'cancelado': return 'Cancelado';
      case 'realizado': return 'Realizado';
      case 'confirmado': return 'Confirmado';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="meus-agendamentos-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meus-agendamentos-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📋 Meus Agendamentos</h1>
            <p>Gerencie e visualize todos os seus agendamentos</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {/* Filtros */}
        <div className="content-section">
          <div className="section-header">
            <h2>🎯 Filtrar Agendamentos</h2>
          </div>
          <div className="filters-grid">
            <button
              className={`filter-btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              📊 Todos
            </button>
            <button
              className={`filter-btn ${filtro === 'agendado' ? 'active' : ''}`}
              onClick={() => setFiltro('agendado')}
            >
              📅 Agendados
            </button>
            <button
              className={`filter-btn ${filtro === 'realizado' ? 'active' : ''}`}
              onClick={() => setFiltro('realizado')}
            >
              ✅ Realizados
            </button>
            <button
              className={`filter-btn ${filtro === 'cancelado' ? 'active' : ''}`}
              onClick={() => setFiltro('cancelado')}
            >
              ❌ Cancelados
            </button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="content-section">
          <div className="section-header">
            <h2>📅 Lista de Agendamentos</h2>
            <span className="section-badge">{agendamentosFiltrados.length}</span>
          </div>

          {agendamentosFiltrados.length > 0 ? (
            <div className="cards-grid">
              {agendamentosFiltrados.map((agendamento) => (
                <div key={agendamento._id} className="card appointment-card">
                  <div className="card-header">
                    <div className="user-info">
                      <h3 className="user-name">{agendamento.medico?.nome || 'Médico'}</h3>
                      <p className="user-email">{agendamento.medico?.especialidade || agendamento.especialidade || 'Especialidade'}</p>
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
                        <span className="info-value">{formatDate(agendamento.data)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">⏰ Horário</span>
                        <span className="info-value">{agendamento.horario}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">🏥 Tipo</span>
                        <span className="info-value">
                          {agendamento.tipoConsulta === 'telemedicina' ? '📱 Telemedicina' : '🏥 Presencial'}
                        </span>
                      </div>
                      {agendamento.observacoes && (
                        <div className="info-item full-width">
                          <span className="info-label">📝 Observações</span>
                          <span className="info-value">{agendamento.observacoes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    {agendamento.status === 'agendado' && (
                      <>
                        <button 
                          className="btn btn-icon warning"
                          onClick={() => handleReagendar(agendamento)}
                          title="Alterar Data/Horário"
                        >
                          📅
                        </button>
                        <button 
                          className="btn btn-icon danger"
                          onClick={() => handleCancelarAgendamento(agendamento._id)}
                          title="Cancelar Consulta"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-icon"
                      onClick={() => {
                        // Aqui poderia abrir um modal com detalhes completos
                        console.log('Detalhes do agendamento:', agendamento);
                      }}
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
              <h3>Nenhum agendamento encontrado</h3>
              <p>
                {filtro !== 'todos' 
                  ? `Você não possui agendamentos com status "${getStatusText(filtro).toLowerCase()}"`
                  : 'Você não possui agendamentos no momento'
                }
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/agendamento')}
              >
                📝 Agendar Nova Consulta
              </button>
            </div>
          )}
        </div>

        {/* Resumo Estatístico */}
        {agendamentos.length > 0 && (
          <div className="content-section">
            <div className="section-header">
              <h2>📊 Resumo</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">📋</div>
                <div className="stat-content">
                  <h3>{agendamentos.length}</h3>
                  <p>Total de Agendamentos</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon agendado">📅</div>
                <div className="stat-content">
                  <h3>{agendamentos.filter(a => a.status === 'agendado').length}</h3>
                  <p>Agendados</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon realizado">✅</div>
                <div className="stat-content">
                  <h3>{agendamentos.filter(a => a.status === 'realizado').length}</h3>
                  <p>Realizados</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon cancelado">❌</div>
                <div className="stat-content">
                  <h3>{agendamentos.filter(a => a.status === 'cancelado').length}</h3>
                  <p>Cancelados</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeusAgendamentos;