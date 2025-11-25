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
          pacientesUnicos.push({
            ...agendamento.paciente,
            totalConsultas: agendamentos.filter(ag => ag.paciente?._id === agendamento.paciente._id).length,
            ultimaConsulta: agendamentos
              .filter(ag => ag.paciente?._id === agendamento.paciente._id)
              .sort((a, b) => new Date(b.data) - new Date(a.data))[0]
          });
        }
      });
      
      setPacientes(pacientesUnicos);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      alert('Erro ao carregar pacientes: ' + error.message);
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
      alert('Erro ao carregar histórico: ' + error.message);
    }
  };

  const handleEnviarMensagem = (paciente) => {
    // Simulação de envio de mensagem
    alert(`Mensagem enviada para ${paciente.nome}`);
  };

  const pacientesFiltrados = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'realizado': return '#10b981';
      case 'cancelado': return '#ef4444';
      case 'agendado': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="pacientes-medico-container">
      <div className="pacientes-header">
        <div className="header-content">
          <div className="header-title">
            <h1>👥 Meus Pacientes</h1>
            <p>Gerencie o histórico e informações dos seus pacientes</p>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard-medico')}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>

      <div className="pacientes-content">
        {/* Filtro e Estatísticas */}
        <div className="controles-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar paciente por nome..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>
          
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{pacientes.length}</h3>
                <p>Total de Pacientes</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>{pacientes.filter(p => p.ultimaConsulta).length}</h3>
                <p>Com Consultas</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Carregando pacientes...</p>
          </div>
        ) : (
          <div className="pacientes-grid">
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map(paciente => (
                <div key={paciente._id} className="paciente-card">
                  <div className="card-header">
                    <div className="paciente-avatar">
                      {paciente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="paciente-info">
                      <h3>{paciente.nome}</h3>
                      <p>{paciente.email}</p>
                      {paciente.telefone && <p>📞 {paciente.telefone}</p>}
                    </div>
                  </div>
                  
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Consultas:</span>
                      <span className="stat-value">{paciente.totalConsultas}</span>
                    </div>
                    
                    {paciente.ultimaConsulta && (
                      <div className="stat-item">
                        <span className="stat-label">Última Consulta:</span>
                        <span className="stat-value">
                          {formatarData(paciente.ultimaConsulta.data)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleVerHistorico(paciente)}
                    >
                      📋 Histórico
                    </button>
                    
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEnviarMensagem(paciente)}
                    >
                      ✉️ Mensagem
                    </button>
                  </div>
                </div>
              ))
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
              </div>
            )}
          </div>
        )}
      </div>

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
              <div className="paciente-info-modal">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{pacienteSelecionado.email}</span>
                </div>
                {pacienteSelecionado.telefone && (
                  <div className="info-item">
                    <label>Telefone:</label>
                    <span>{pacienteSelecionado.telefone}</span>
                  </div>
                )}
                <div className="info-item">
                  <label>Total de Consultas:</label>
                  <span>{historicoPaciente.length}</span>
                </div>
              </div>
              
              <div className="historico-list">
                <h4>Consultas Realizadas</h4>
                
                {historicoPaciente.length > 0 ? (
                  <div className="consultas-table">
                    <table>
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
                              {consulta.tipoConsulta === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                            </td>
                            <td>
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(consulta.status) }}
                              >
                                {consulta.status}
                              </span>
                            </td>
                            <td>
                              {consulta.observacoes ? (
                                <span className="observacoes-preview">
                                  {consulta.observacoes.substring(0, 50)}...
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
                  <div className="empty-state">
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