import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService';
import './RelatoriosMedico.css';

const RelatoriosMedico = () => {
  const [relatorios, setRelatorios] = useState({
    consultasPorMes: [],
    metricas: {},
    pacientesAtivos: []
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30dias');
  const [dadosFiltrados, setDadosFiltrados] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadRelatorios();
  }, [periodo]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      // Simulação de dados - você precisará implementar o endpoint no backend
      const agendamentos = await agendamentoService.getAgendamentosMedico();
      
      // Processar dados para relatórios
      const metricas = calcularMetricas(agendamentos);
      const consultasPorMes = agruparConsultasPorMes(agendamentos);
      const pacientesAtivos = extrairPacientesAtivos(agendamentos);
      
      setRelatorios({
        consultasPorMes,
        metricas,
        pacientesAtivos
      });
      
      setDadosFiltrados(consultasPorMes);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      alert('Erro ao carregar relatórios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = (agendamentos) => {
    const total = agendamentos.length;
    const realizadas = agendamentos.filter(ag => ag.status === 'realizado').length;
    const canceladas = agendamentos.filter(ag => ag.status === 'cancelado').length;
    const taxaComparecimento = total > 0 ? (realizadas / total) * 100 : 0;
    
    // Pacientes únicos
    const pacientesUnicos = [...new Set(agendamentos.map(ag => ag.paciente?._id))].length;
    
    return {
      totalConsultas: total,
      consultasRealizadas: realizadas,
      consultasCanceladas: canceladas,
      taxaComparecimento: Math.round(taxaComparecimento),
      pacientesUnicos,
      taxaCancelamento: total > 0 ? Math.round((canceladas / total) * 100) : 0
    };
  };

  const agruparConsultasPorMes = (agendamentos) => {
    const agrupamento = {};
    
    agendamentos.forEach(agendamento => {
      const data = new Date(agendamento.data);
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
      
      if (!agrupamento[mesAno]) {
        agrupamento[mesAno] = {
          mes: mesAno,
          total: 0,
          realizadas: 0,
          canceladas: 0
        };
      }
      
      agrupamento[mesAno].total++;
      if (agendamento.status === 'realizado') agrupamento[mesAno].realizadas++;
      if (agendamento.status === 'cancelado') agrupamento[mesAno].canceladas++;
    });
    
    return Object.values(agrupamento).sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/').map(Number);
      const [mesB, anoB] = b.mes.split('/').map(Number);
      return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
    });
  };

  const extrairPacientesAtivos = (agendamentos) => {
    const pacientesMap = new Map();
    
    agendamentos.forEach(agendamento => {
      if (agendamento.paciente) {
        const pacienteId = agendamento.paciente._id;
        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            ...agendamento.paciente,
            totalConsultas: 0,
            ultimaConsulta: agendamento.data
          });
        }
        
        const paciente = pacientesMap.get(pacienteId);
        paciente.totalConsultas++;
        
        if (new Date(agendamento.data) > new Date(paciente.ultimaConsulta)) {
          paciente.ultimaConsulta = agendamento.data;
        }
      }
    });
    
    return Array.from(pacientesMap.values())
      .sort((a, b) => b.totalConsultas - a.totalConsultas)
      .slice(0, 10);
  };

  const renderBarChart = (data, title, color = '#3b82f6') => {
    if (!data || data.length === 0) {
      return <div className="empty-chart">Nenhum dado disponível</div>;
    }

    const maxValue = Math.max(...data.map(item => item.total || 0));

    return (
      <div className="simple-bar-chart">
        <h4>{title}</h4>
        <div className="chart-bars">
          {data.map((item, index) => {
            const percentage = ((item.total || 0) / maxValue) * 100;
            return (
              <div key={index} className="bar-item">
                <div className="bar-label">{item.mes}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  ></div>
                  <span className="bar-value">{item.total || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMetricCard = (title, value, subtitle, color = 'primary') => {
    return (
      <div className={`metric-card ${color}`}>
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
    );
  };

  return (
    <div className="relatorios-medico-container">
      <div className="relatorios-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📊 Meus Relatórios</h1>
            <p>Analise seu desempenho e estatísticas</p>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard-medico')}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>

      <div className="relatorios-content">
        {/* Filtros */}
        <div className="filtros-section">
          <div className="filtro-group">
            <label>Período:</label>
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="90dias">Últimos 90 dias</option>
              <option value="1ano">Último ano</option>
              <option value="todos">Todo o período</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Carregando relatórios...</p>
          </div>
        ) : (
          <>
            {/* Métricas Principais */}
            <div className="metrics-grid">
              {renderMetricCard(
                'Total de Consultas',
                relatorios.metricas.totalConsultas || 0,
                'Período selecionado',
                'primary'
              )}
              
              {renderMetricCard(
                'Taxa de Comparecimento',
                `${relatorios.metricas.taxaComparecimento || 0}%`,
                'Consultas realizadas',
                'success'
              )}
              
              {renderMetricCard(
                'Pacientes Únicos',
                relatorios.metricas.pacientesUnicos || 0,
                'Pacientes atendidos',
                'info'
              )}
              
              {renderMetricCard(
                'Taxa de Cancelamento',
                `${relatorios.metricas.taxaCancelamento || 0}%`,
                'Consultas canceladas',
                'warning'
              )}
            </div>

            {/* Gráficos e Tabelas */}
            <div className="reports-grid">
              {/* Gráfico de Consultas por Mês */}
              <div className="report-card">
                <h3>📈 Consultas por Mês</h3>
                {renderBarChart(
                  relatorios.consultasPorMes,
                  'Evolução Mensal',
                  '#3b82f6'
                )}
              </div>

              {/* Top Pacientes */}
              <div className="report-card">
                <h3>🏆 Top Pacientes</h3>
                <div className="pacientes-ranking">
                  {relatorios.pacientesAtivos.length > 0 ? (
                    relatorios.pacientesAtivos.map((paciente, index) => (
                      <div key={paciente._id} className="ranking-item">
                        <div className="ranking-position">#{index + 1}</div>
                        <div className="ranking-info">
                          <div className="paciente-name">{paciente.nome}</div>
                          <div className="paciente-stats">
                            {paciente.totalConsultas} consultas
                          </div>
                        </div>
                        <div className="ranking-badge">
                          {paciente.totalConsultas}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>Nenhum paciente com consultas</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estatísticas Detalhadas */}
              <div className="report-card full-width">
                <h3>📋 Estatísticas Detalhadas</h3>
                <div className="stats-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Mês</th>
                        <th>Total Consultas</th>
                        <th>Realizadas</th>
                        <th>Canceladas</th>
                        <th>Taxa de Sucesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorios.consultasPorMes.map((item, index) => (
                        <tr key={index}>
                          <td>{item.mes}</td>
                          <td>{item.total}</td>
                          <td>{item.realizadas}</td>
                          <td>{item.canceladas}</td>
                          <td>
                            <span className={`status-badge ${
                              item.realizadas / item.total > 0.7 ? 'success' : 
                              item.realizadas / item.total > 0.5 ? 'warning' : 'danger'
                            }`}>
                              {Math.round((item.realizadas / item.total) * 100)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RelatoriosMedico;