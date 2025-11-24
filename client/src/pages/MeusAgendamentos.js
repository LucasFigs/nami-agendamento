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
      const agendamentosData = await agendamentoService.getAgendamentosPaciente();
      setAgendamentos(agendamentosData);
    } catch (error) {
      alert('Erro ao carregar agendamentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReagendar = (agendamento) => {
    // Para reagendar, vamos redirecionar para a página de agendamento
    // passando os dados do agendamento atual
    navigate('/agendamento', {
      state: {
        reagendamento: true, // ← ADICIONE esta flag
        agendamentoId: agendamento._id, // ← ADICIONE o ID do agendamento
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
        alert('Agendamento cancelado com sucesso!');
        loadAgendamentos(); // Recarregar lista
      } catch (error) {
        alert('Erro ao cancelar agendamento: ' + error.message);
      }
    }
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    if (filtro === 'todos') return true;
    return agendamento.status === filtro;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return '#28a745';
      case 'cancelado': return '#dc3545';
      case 'realizado': return '#17a2b8';
      default: return '#6c757d';
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

  const formatDate = (dateString) => {
  // A data já vem no formato YYYY-MM-DD do backend
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

  if (loading) {
    return (
      <div className="agendamentos-container">
        <div className="loading">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="agendamentos-container">
      <div className="agendamentos-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Voltar para Dashboard
          </button>
          <h1>Meus Agendamentos</h1>
        </div>
      </div>

      <div className="agendamentos-content">
        <div className="filtros-container">
          <h2>Filtrar por Status</h2>
          <div className="filtros">
            <button
              className={`filtro-btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos
            </button>
            <button
              className={`filtro-btn ${filtro === 'agendado' ? 'active' : ''}`}
              onClick={() => setFiltro('agendado')}
            >
              Confirmados
            </button>
            <button
              className={`filtro-btn ${filtro === 'realizado' ? 'active' : ''}`}
              onClick={() => setFiltro('realizado')}
            >
              Realizados
            </button>
            <button
              className={`filtro-btn ${filtro === 'cancelado' ? 'active' : ''}`}
              onClick={() => setFiltro('cancelado')}
            >
              Cancelados
            </button>
          </div>
        </div>

        <div className="agendamentos-list-container">
          {agendamentosFiltrados.length > 0 ? (
            <div className="agendamentos-list">
              {agendamentosFiltrados.map((agendamento) => (
                <div key={agendamento._id} className="agendamento-card">
                  <div className="agendamento-header">
                    <div className="medico-info">
                      <h3>{agendamento.medico?.nome || 'Médico'}</h3>
                      <p>{agendamento.medico?.especialidade || agendamento.especialidade || 'Especialidade'}</p>
                    </div>
                    <div
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(agendamento.status) }}
                    >
                      {getStatusText(agendamento.status)}
                    </div>
                  </div>

                  <div className="agendamento-details">
                    <div className="detail">
                      <span className="label">📅 Data:</span>
                      <span className="value">{formatDate(agendamento.data)}</span>
                    </div>
                    <div className="detail">
                      <span className="label">⏰ Horário:</span>
                      <span className="value">{agendamento.horario}</span>
                    </div>
                    <div className="detail">
                      <span className="label">🏥 Tipo:</span>
                      <span className="value">
                        {agendamento.tipoConsulta === 'telemedicina' ? 'Telemedicina' : 'Consulta Presencial'}
                      </span>
                    </div>
                    {agendamento.observacoes && (
                      <div className="detail">
                        <span className="label">📝 Observações:</span>
                        <span className="value">{agendamento.observacoes}</span>
                      </div>
                    )}
                  </div>

                  {agendamento.status === 'agendado' && (
                    <div className="agendamento-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => handleReagendar(agendamento)}
                      >
                        📅 Alterar Data/Horário
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleCancelarAgendamento(agendamento._id)}
                      >
                        ❌ Cancelar Consulta
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>Nenhum agendamento encontrado</h3>
              <p>Você não possui agendamentos {filtro !== 'todos' ? `com status ${filtro}` : ''}</p>
              <button
                className="primary-btn"
                onClick={() => navigate('/agendamento')}
              >
                Agendar Nova Consulta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeusAgendamentos;