import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService'; 
import { authService } from '../services/authService';
import './HistoricoConsultas.css';

const HistoricoConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [userType, setUserType] = useState('paciente');
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    setUserType(user?.tipo || 'paciente');
    loadHistorico();
  }, []);

  const loadHistorico = async () => {
    try {
      let historico;
      
      // VERIFICAÇÃO DO TIPO DE USUÁRIO
      if (userType === 'medico') {
        historico = await agendamentoService.getAgendamentosMedico();
      } else if (userType === 'admin') {
        historico = await agendamentoService.getTodosAgendamentos(); // Você precisa criar esta função no service
      } else {
        // Paciente (default)
        historico = await agendamentoService.getAgendamentosPaciente();
      }
      
      setConsultas(historico);
    } catch (error) {
      alert('Erro ao carregar histórico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const consultasFiltradas = consultas.filter(consulta => {
    if (filtro === 'todas') return true;
    return consulta.status === filtro;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'realizado': return '#28a745';
      case 'cancelado': return '#dc3545';
      case 'agendado': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="loading">Carregando histórico...</div>;
  }

  return (
    <div className="historico-container">
      <div className="historico-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <h1>Histórico de Consultas</h1>
      </div>

      <div className="filtros">
        <button 
          className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas
        </button>
        <button 
          className={`filtro-btn ${filtro === 'realizado' ? 'active' : ''}`}
          onClick={() => setFiltro('realizado')}
        >
          Realizadas
        </button>
        <button 
          className={`filtro-btn ${filtro === 'cancelado' ? 'active' : ''}`}
          onClick={() => setFiltro('cancelado')}
        >
          Canceladas
        </button>
      </div>

      <div className="consultas-list">
        {consultasFiltradas.length > 0 ? (
          consultasFiltradas.map(consulta => (
            <div key={consulta._id} className="consulta-card">
              <div className="consulta-header">
                <div className="historico-medico-info">
                  <h3>{consulta.medico?.nome || 'Médico'}</h3>
                  <p>{consulta.medico?.especialidade || 'Especialidade'}</p>
                </div>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(consulta.status) }}
                >
                  {consulta.status === 'realizado' ? 'Realizada' : 
                   consulta.status === 'cancelado' ? 'Cancelada' : 'Agendada'}
                </div>
              </div>

              <div className="consulta-details">
                <div className="detail">
                  <span className="label">📅 Data:</span>
                  <span className="value">{formatDate(consulta.data)}</span>
                </div>
                <div className="detail">
                  <span className="label">⏰ Horário:</span>
                  <span className="value">{consulta.horario}</span>
                </div>
                <div className="detail">
                  <span className="label">🏥 Tipo:</span>
                  <span className="value">
                    {consulta.tipoConsulta === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                  </span>
                </div>
                {consulta.observacoes && (
                  <div className="detail">
                    <span className="label">📝 Observações:</span>
                    <span className="value">{consulta.observacoes}</span>
                  </div>
                )}
              </div>

              {consulta.status === 'agendado' && (
                <div className="consulta-actions">
                  <button className="btn-secondary">
                    📞 Reagendar
                  </button>
                  <button className="btn-danger">
                    ❌ Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Nenhuma consulta encontrada</h3>
            <p>Não há consultas no histórico</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoConsultas;