import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService';
import './PacientesMedico.css';

const PacientesMedico = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [historicoPaciente, setHistoricoPaciente] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      const agendamentos = await agendamentoService.getAgendamentosMedico();
      
      // Extrair pacientes únicos dos agendamentos
      const pacientesUnicos = [];
      const pacientesMap = new Map();
      
      agendamentos.forEach(agendamento => {
        if (agendamento.paciente && !pacientesMap.has(agendamento.paciente._id)) {
          pacientesMap.set(agendamento.paciente._id, true);
          
          const consultasPaciente = agendamentos.filter(ag => ag.paciente?._id === agendamento.paciente._id);
          const consultasRealizadas = consultasPaciente.filter(ag => ag.status === 'realizado').length;
          const consultasCanceladas = consultasPaciente.filter(ag => ag.status === 'cancelado').length;
          
          pacientesUnicos.push({
            ...agendamento.paciente,
            totalConsultas: consultasPaciente.length,
            consultasRealizadas,
            consultasCanceladas,
            taxaComparecimento: consultasPaciente.length > 0 ? 
              Math.round((consultasRealizadas / consultasPaciente.length) * 100) : 0,
            ultimaConsulta: consultasPaciente
              .sort((a, b) => new Date(b.data) - new Date(a.data))[0]
          });
        }
      });
      
      setPacientes(pacientesUnicos);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      alert('❌ Erro ao carregar pacientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerHistorico = async (paciente) => {
    try {
      setPacienteSelecionado(paciente);
      const agendamentos = await agendamentoService.getAgendamentosMedico();
      const historico = agendamentos
        .filter(ag => ag.paciente?._id === paciente._id)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
      
      setHistoricoPaciente(historico);
      setShowModal(true);
    } catch (error) {
      alert('❌ Erro ao carregar histórico: ' + error.message);
    }
  };

  const handleEnviarMensagem = (paciente) => {
    alert(`📧 Mensagem enviada para ${paciente.nome}`);
  };

  const pacientesFiltrados = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'realizado': return '#10b981';
      case 'cancelado': return '#ef4444';
      case 'agendado': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const getPerformanceColor = (taxa) => {
    if (taxa >= 80) return '#10b981';
    if (taxa >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="pacientes-medico-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pacientes-medico-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>👥 Meus Pacientes</h1>
            <p>Gerencie o histórico e informações dos seus pacientes</p>
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
        {/* Filtro e Estatísticas */}
        <div className="content-section">
          <div className="section-header">
            <h2>🎯 Controles e Estatísticas</h2>
          </div>
          <div className="controls-grid">
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Buscar paciente por nome..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">👥</div>
                <div className="stat-content">
                  <h3>{pacientes.length}</h3>
                  <p>Total de Pacientes</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon active">📅</div>
                <div className="stat-content">
                  <h3>{pacientes.filter(p => p.ultimaConsulta).length}</h3>
                  <p>Pacientes Ativos</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">✅</div>
                <div className="stat-content">
                  <h3>{pacientes.reduce((sum, p) => sum + p.consultasRealizadas, 0)}</h3>
                  <p>Consultas Realizadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pacientes */}
        <div className="content-section">
          <div className="section-header">
            <h2>📋 Lista de Pacientes</h2>
            <span className="section-badge">{pacientesFiltrados.length}</span>
          </div>

          {pacientesFiltrados.length > 0 ? (
            <div className="cards-grid">
              {pacientesFiltrados.map(paciente => (
                <div key={paciente._id} className="card paciente-card">
                  <div className="card-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {paciente.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <h3 className="user-name">{paciente.nome}</h3>
                        <p className="user-email">{paciente.email}</p>
                        {paciente.telefone && (
                          <p className="user-phone">📞 {paciente.telefone}</p>
                        )}
                      </div>
                    </div>
                    <div className="performance-badge" style={{ 
                      backgroundColor: getPerformanceColor(paciente.taxaComparecimento),
                      color: 'white'
                    }}>
                      {paciente.taxaComparecimento}%
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">📊 Total Consultas</span>
                        <span className="info-value">{paciente.totalConsultas}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">✅ Realizadas</span>
                        <span className="info-value success">{paciente.consultasRealizadas}</span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">❌ Canceladas</span>
                        <span className="info-value danger">{paciente.consultasCanceladas}</span>
                      </div>
                      
                      {paciente.ultimaConsulta && (
                        <div className="info-item">
                          <span className="info-label">📅 Última Consulta</span>
                          <span className="info-value">
                            {formatarData(paciente.ultimaConsulta.data)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn btn-icon"
                      onClick={() => handleVerHistorico(paciente)}
                      title="Ver Histórico Completo"
                    >
                      📋
                    </button>
                    
                    <button 
                      className="btn btn-icon success"
                      onClick={() => handleEnviarMensagem(paciente)}
                      title="Enviar Mensagem"
                    >
                      ✉️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Nenhum paciente encontrado</h3>
              <p>
                {filtroNome 
                  ? 'Nenhum paciente corresponde à busca' 
                  : 'Você ainda não tem pacientes cadastrados'
                }
              </p>
              <button 
                className="btn btn-outline"
                onClick={() => setFiltroNome('')}
              >
                🔄 Limpar Filtro
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Histórico */}
      {showModal && pacienteSelecionado && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>📋 Histórico de {pacienteSelecionado.nome}</h3>
              <button 
                className="btn btn-icon close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="paciente-info-detailed">
                <div className="info-grid-detailed">
                  <div className="info-item-detailed">
                    <label>👤 Nome:</label>
                    <span>{pacienteSelecionado.nome}</span>
                  </div>
                  <div className="info-item-detailed">
                    <label>📧 Email:</label>
                    <span>{pacienteSelecionado.email}</span>
                  </div>
                  {pacienteSelecionado.telefone && (
                    <div className="info-item-detailed">
                      <label>📞 Telefone:</label>
                      <span>{pacienteSelecionado.telefone}</span>
                    </div>
                  )}
                  <div className="info-item-detailed">
                    <label>📊 Total de Consultas:</label>
                    <span className="stat-highlight">{historicoPaciente.length}</span>
                  </div>
                  <div className="info-item-detailed">
                    <label>✅ Taxa de Comparecimento:</label>
                    <span 
                      className="performance-text"
                      style={{ color: getPerformanceColor(pacienteSelecionado.taxaComparecimento) }}
                    >
                      {pacienteSelecionado.taxaComparecimento}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="historico-section">
                <h4>📅 Histórico de Consultas</h4>
                
                {historicoPaciente.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Horário</th>
                          <th>Tipo</th>
                          <th>Status</th>
                          <th>Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicoPaciente.map(consulta => (
                          <tr key={consulta._id}>
                            <td>{formatarData(consulta.data)}</td>
                            <td>{consulta.horario}</td>
                            <td>
                              <span className="tipo-badge">
                                {consulta.tipoConsulta === 'telemedicina' ? '📱 Telemedicina' : '🏥 Presencial'}
                              </span>
                            </td>
                            <td>
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(consulta.status) }}
                              >
                                {consulta.status === 'agendado' ? 'Agendado' : 
                                 consulta.status === 'realizado' ? 'Realizado' : 
                                 consulta.status === 'cancelado' ? 'Cancelado' : consulta.status}
                              </span>
                            </td>
                            <td>
                              {consulta.observacoes ? (
                                <span className="observacoes-text" title={consulta.observacoes}>
                                  {consulta.observacoes.substring(0, 30)}...
                                </span>
                              ) : (
                                <span className="no-observations">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state small">
                    <div className="empty-icon">📋</div>
                    <p>Nenhuma consulta registrada para este paciente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacientesMedico;