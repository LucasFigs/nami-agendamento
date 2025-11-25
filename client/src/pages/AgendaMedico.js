import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService';
import { authService } from '../services/authService';
import './AgendaMedico.css';

const AgendaMedico = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroData, setFiltroData] = useState('');
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('detalhes');
  const [observacoes, setObservacoes] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadAgendamentos();
  }, [filtroStatus, filtroData]);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      const agendamentosData = await agendamentoService.getAgendamentosMedico();
      
      let agendamentosFiltrados = agendamentosData;
      
      // Aplicar filtro de status
      if (filtroStatus !== 'todos') {
        agendamentosFiltrados = agendamentosData.filter(ag => ag.status === filtroStatus);
      }
      
      // Aplicar filtro de data
      if (filtroData) {
        agendamentosFiltrados = agendamentosFiltrados.filter(ag => {
          const agDate = new Date(ag.data).toISOString().split('T')[0];
          return agDate === filtroData;
        });
      }
      
      // Ordenar por data e horário
      agendamentosFiltrados.sort((a, b) => {
        const dataA = new Date(a.data + 'T' + a.horario);
        const dataB = new Date(b.data + 'T' + b.horario);
        return dataA - dataB;
      });
      
      setAgendamentos(agendamentosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      alert('Erro ao carregar agendamentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarRealizado = async (agendamentoId) => {
    try {
      await agendamentoService.marcarComoRealizado(agendamentoId);
      alert('Consulta marcada como realizada com sucesso!');
      loadAgendamentos();
    } catch (error) {
      alert('Erro ao marcar como realizada: ' + error.message);
    }
  };

  const handleCancelarConsulta = async (agendamentoId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      try {
        await agendamentoService.cancelarAgendamento(agendamentoId);
        alert('Consulta cancelada com sucesso!');
        loadAgendamentos();
      } catch (error) {
        alert('Erro ao cancelar consulta: ' + error.message);
      }
    }
  };

  const handleAdicionarObservacoes = async (agendamentoId) => {
    if (!observacoes.trim()) {
      alert('Por favor, digite as observações da consulta');
      return;
    }

    try {
      await agendamentoService.adicionarObservacoes(agendamentoId, observacoes);
      alert('Observações adicionadas com sucesso!');
      setObservacoes('');
      setShowModal(false);
      loadAgendamentos();
    } catch (error) {
      alert('Erro ao adicionar observações: ' + error.message);
    }
  };

  const handleVerDetalhes = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setModalType('detalhes');
    setShowModal(true);
  };

  const handleAbrirObservacoes = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setObservacoes(agendamento.observacoes || '');
    setModalType('observacoes');
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return '#f59e0b';
      case 'realizado': return '#10b981';
      case 'cancelado': return '#ef4444';
      case 'confirmado': return '#3b82f6';
      default: return '#6b7280';
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

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const agendamentosFuturos = agendamentos.filter(ag => 
    new Date(ag.data) >= new Date().setHours(0, 0, 0, 0)
  );

  const agendamentosPassados = agendamentos.filter(ag => 
    new Date(ag.data) < new Date().setHours(0, 0, 0, 0)
  );

  return (
    <div className="agenda-medico-container">
      <div className="agenda-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📅 Minha Agenda</h1>
            <p>Gerencie suas consultas e agendamentos</p>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard-medico')}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>

      <div className="agenda-content">
        {/* Filtros */}
        <div className="filtros-section">
          <div className="filtros-grid">
            <div className="filtro-group">
              <label>Status:</label>
              <select 
                value={filtroStatus} 
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="agendado">Agendados</option>
                <option value="confirmado">Confirmados</option>
                <option value="realizado">Realizados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            
            <div className="filtro-group">
              <label>Data específica:</label>
              <input 
                type="date" 
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
            
            <div className="filtro-group">
              <label>&nbsp;</label>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setFiltroStatus('todos');
                  setFiltroData('');
                }}
              >
                🔄 Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Carregando agendamentos...</p>
          </div>
        ) : (
          <>
            {/* Agendamentos Futuros */}
            <div className="agenda-section">
              <h2 className="section-title">
                🔮 Próximas Consultas ({agendamentosFuturos.length})
              </h2>
              
              {agendamentosFuturos.length > 0 ? (
                <div className="agendamentos-grid">
                  {agendamentosFuturos.map(agendamento => (
                    <div key={agendamento._id} className="agendamento-card">
                      <div className="card-header">
                        <div className="paciente-info">
                          <h3>{agendamento.paciente?.nome || 'Paciente'}</h3>
                          <p>{agendamento.paciente?.email || ''}</p>
                        </div>
                        <div 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(agendamento.status) }}
                        >
                          {getStatusText(agendamento.status)}
                        </div>
                      </div>
                      
                      <div className="card-details">
                        <div className="detail-row">
                          <span className="detail-label">📅 Data:</span>
                          <span className="detail-value">{formatarData(agendamento.data)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">⏰ Horário:</span>
                          <span className="detail-value">{agendamento.horario}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">🩺 Tipo:</span>
                          <span className="detail-value">
                            {agendamento.tipoConsulta === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleVerDetalhes(agendamento)}
                        >
                          👁️ Detalhes
                        </button>
                        
                        {agendamento.status === 'agendado' && (
                          <>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleMarcarRealizado(agendamento._id)}
                            >
                              ✅ Realizada
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleCancelarConsulta(agendamento._id)}
                            >
                              ❌ Cancelar
                            </button>
                          </>
                        )}
                        
                        <button 
                          className="btn btn-info"
                          onClick={() => handleAbrirObservacoes(agendamento)}
                        >
                          📝 Observações
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>Nenhuma consulta futura</h3>
                  <p>Não há consultas agendadas para datas futuras</p>
                </div>
              )}
            </div>

            {/* Agendamentos Passados */}
            <div className="agenda-section">
              <h2 className="section-title">
                📋 Histórico de Consultas ({agendamentosPassados.length})
              </h2>
              
              {agendamentosPassados.length > 0 ? (
                <div className="agendamentos-list">
                  {agendamentosPassados.map(agendamento => (
                    <div key={agendamento._id} className="agendamento-item">
                      <div className="item-main">
                        <div className="paciente-info">
                          <h4>{agendamento.paciente?.nome || 'Paciente'}</h4>
                          <p>{formatarData(agendamento.data)} às {agendamento.horario}</p>
                        </div>
                        <div className="item-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(agendamento.status) }}
                          >
                            {getStatusText(agendamento.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="item-actions">
                        <button 
                          className="btn btn-icon"
                          onClick={() => handleVerDetalhes(agendamento)}
                          title="Ver detalhes"
                        >
                          👁️
                        </button>
                        <button 
                          className="btn btn-icon"
                          onClick={() => handleAbrirObservacoes(agendamento)}
                          title="Observações"
                        >
                          📝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>Nenhuma consulta no histórico</h3>
                  <p>O histórico de consultas passadas aparecerá aqui</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalhes/Observações */}
      {showModal && agendamentoSelecionado && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {modalType === 'detalhes' ? '👁️ Detalhes da Consulta' : '📝 Observações da Consulta'}
              </h3>
              <button 
                className="btn btn-icon close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {modalType === 'detalhes' ? (
                <div className="detalhes-consulta">
                  <div className="detalhes-grid">
                    <div className="detalhe-item">
                      <label>Paciente:</label>
                      <span>{agendamentoSelecionado.paciente?.nome || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Email:</label>
                      <span>{agendamentoSelecionado.paciente?.email || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Telefone:</label>
                      <span>{agendamentoSelecionado.paciente?.telefone || 'N/A'}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Data:</label>
                      <span>{formatarData(agendamentoSelecionado.data)}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Horário:</label>
                      <span>{agendamentoSelecionado.horario}</span>
                    </div>
                    <div className="detalhe-item">
                      <label>Tipo:</label>
                      <span>
                        {agendamentoSelecionado.tipoConsulta === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                      </span>
                    </div>
                    <div className="detalhe-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(agendamentoSelecionado.status) }}
                      >
                        {getStatusText(agendamentoSelecionado.status)}
                      </span>
                    </div>
                    {agendamentoSelecionado.observacoes && (
                      <div className="detalhe-item full-width">
                        <label>Observações:</label>
                        <div className="observacoes-text">
                          {agendamentoSelecionado.observacoes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="observacoes-form">
                  <div className="form-group">
                    <label>Observações da Consulta:</label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Digite as observações, diagnóstico, prescrições, etc..."
                      rows="6"
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAdicionarObservacoes(agendamentoSelecionado._id)}
                    >
                      💾 Salvar Observações
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
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

export default AgendaMedico;