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

  const normalizarDataParaComparacao = (dataString) => {
    if (!dataString) return '';
    
    if (typeof dataString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
      return dataString;
    }
    
    const data = new Date(dataString);
    const ano = data.getUTCFullYear();
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(data.getUTCDate()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}`;
  };

  useEffect(() => {
    loadAgendamentos();
  }, [filtroStatus, filtroData]);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      const agendamentosData = await agendamentoService.getAgendamentosMedico();
      
      let agendamentosFiltrados = agendamentosData;
      
      if (filtroStatus !== 'todos') {
        agendamentosFiltrados = agendamentosData.filter(ag => ag.status === filtroStatus);
      }
      
      if (filtroData) {
        agendamentosFiltrados = agendamentosFiltrados.filter(ag => {
          if (!ag.data) return false;
          const dataAgendamento = normalizarDataParaComparacao(ag.data);
          const dataFiltro = normalizarDataParaComparacao(filtroData);
          return dataAgendamento === dataFiltro;
        });
      }
      
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
      alert('✅ Consulta marcada como realizada com sucesso!');
      loadAgendamentos();
    } catch (error) {
      alert('❌ Erro ao marcar como realizada: ' + error.message);
    }
  };

  const handleCancelarConsulta = async (agendamentoId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      try {
        await agendamentoService.cancelarAgendamento(agendamentoId);
        alert('✅ Consulta cancelada com sucesso!');
        loadAgendamentos();
      } catch (error) {
        alert('❌ Erro ao cancelar consulta: ' + error.message);
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
      alert('✅ Observações adicionadas com sucesso!');
      setObservacoes('');
      setShowModal(false);
      loadAgendamentos();
    } catch (error) {
      alert('❌ Erro ao adicionar observações: ' + error.message);
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

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    
    return `${dia}/${mes}/${ano}`;
  };

  const agendamentosFuturos = agendamentos.filter(ag => 
    new Date(ag.data) >= new Date().setHours(0, 0, 0, 0)
  );

  const agendamentosPassados = agendamentos.filter(ag => 
    new Date(ag.data) < new Date().setHours(0, 0, 0, 0)
  );

  return (
    <div className="agenda-medico-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📅 Minha Agenda</h1>
            <p>Gerencie suas consultas e agendamentos</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard-medico')}
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
            <h2>Filtros e Controles</h2>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filtroStatus} 
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos</option>
                <option value="agendado">Agendados</option>
                <option value="confirmado">Confirmados</option>
                <option value="realizado">Realizados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Data Específica</label>
              <input 
                type="date" 
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
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
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Carregando agendamentos...</p>
          </div>
        ) : (
          <>
            {/* Agendamentos Futuros */}
            <div className="content-section">
              <div className="section-header">
                <h2>🔮 Próximas Consultas</h2>
                <span className="section-badge">{agendamentosFuturos.length}</span>
              </div>
              
              {agendamentosFuturos.length > 0 ? (
                <div className="cards-grid">
                  {agendamentosFuturos.map(agendamento => (
                    <div key={agendamento._id} className="card appointment-card">
                      <div className="card-header">
                        <div className="user-info">
                          <h3 className="user-name">{agendamento.paciente?.nome || 'Paciente'}</h3>
                          <p className="user-email">{agendamento.paciente?.email || ''}</p>
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
                            <span className="info-value">{formatarData(agendamento.data)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">⏰ Horário</span>
                            <span className="info-value">{agendamento.horario}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">🩺 Tipo</span>
                            <span className="info-value">
                              {agendamento.tipoConsulta === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button 
                          className="btn btn-icon"
                          onClick={() => handleVerDetalhes(agendamento)}
                          title="Detalhes"
                        >
                          👁️
                        </button>
                        
                        {agendamento.status === 'agendado' && (
                          <>
                            <button 
                              className="btn btn-icon success"
                              onClick={() => handleMarcarRealizado(agendamento._id)}
                              title="Marcar como Realizada"
                            >
                              ✅
                            </button>
                            <button 
                              className="btn btn-icon danger"
                              onClick={() => handleCancelarConsulta(agendamento._id)}
                              title="Cancelar Consulta"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        
                        <button 
                          className="btn btn-icon info"
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
                  <div className="empty-icon">📅</div>
                  <h3>Nenhuma consulta futura</h3>
                  <p>Não há consultas agendadas para datas futuras</p>
                </div>
              )}
            </div>

            {/* Agendamentos Passados */}
            <div className="content-section">
              <div className="section-header">
                <h2>📋 Histórico de Consultas</h2>
                <span className="section-badge">{agendamentosPassados.length}</span>
              </div>
              
              {agendamentosPassados.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendamentosPassados.map(agendamento => (
                        <tr key={agendamento._id}>
                          <td>
                            <div className="user-info">
                              <span className="user-name">{agendamento.paciente?.nome || 'Paciente'}</span>
                              <span className="user-email">{agendamento.paciente?.email || ''}</span>
                            </div>
                          </td>
                          <td>{formatarData(agendamento.data)}</td>
                          <td>{agendamento.horario}</td>
                          <td>
                            <span className="tipo-badge">
                              {agendamento.tipoConsulta === 'telemedicina' ? '📱 Telemedicina' : '🏥 Presencial'}
                            </span>
                          </td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(agendamento.status) }}
                            >
                              {getStatusText(agendamento.status)}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn btn-icon"
                                onClick={() => handleVerDetalhes(agendamento)}
                                title="Detalhes"
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
      </main>

      {/* Modal */}
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
                        {agendamentoSelecionado.tipoConsulta === 'telemedicina' ? '📱 Telemedicina' : '🏥 Presencial'}
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
                <div className="modal-form">
                  <div className="form-group">
                    <label>Observações da Consulta</label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Digite as observações, diagnóstico, prescrições, etc..."
                      rows="6"
                      className="form-textarea"
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