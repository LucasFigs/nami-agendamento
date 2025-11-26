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
  const navigate = useNavigate();

  useEffect(() => {
    loadRelatorios();
  }, [periodo]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      
      // ✅ BUSCAR DADOS REAIS - Usando a função correta do service
      console.log('🔄 Buscando agendamentos para relatórios...');
      const agendamentos = await agendamentoService.getMeusAgendamentos();
      
      if (!agendamentos || !Array.isArray(agendamentos)) {
        console.warn('❌ Nenhum agendamento retornado ou formato inválido');
        setRelatorios({
          consultasPorMes: [],
          metricas: {},
          pacientesAtivos: []
        });
        return;
      }

      console.log('📊 Agendamentos carregados para relatórios:', agendamentos.length);
      console.log('📈 Dados completos:', agendamentos);

      // ✅ CALCULAR MÉTRICAS REAIS
      const metricas = calcularMetricasReais(agendamentos);
      const consultasPorMes = agruparConsultasPorMesReais(agendamentos);
      const pacientesAtivos = extrairPacientesAtivosReais(agendamentos);
      
      console.log('✅ Métricas calculadas:', metricas);
      console.log('✅ Consultas por mês:', consultasPorMes);
      console.log('✅ Pacientes ativos:', pacientesAtivos);
      
      setRelatorios({
        consultasPorMes,
        metricas,
        pacientesAtivos
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar relatórios:', error);
      alert('Erro ao carregar relatórios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA CALCULAR MÉTRICAS REAIS
  const calcularMetricasReais = (agendamentos) => {
    if (!agendamentos || agendamentos.length === 0) {
      return {
        totalConsultas: 0,
        consultasRealizadas: 0,
        consultasCanceladas: 0,
        consultasAgendadas: 0,
        taxaComparecimento: 0,
        pacientesUnicos: 0,
        taxaCancelamento: 0
      };
    }

    const total = agendamentos.length;
    const realizadas = agendamentos.filter(ag => ag.status === 'realizado').length;
    const canceladas = agendamentos.filter(ag => ag.status === 'cancelado').length;
    const agendadas = agendamentos.filter(ag => ag.status === 'agendado').length;
    const confirmadas = agendamentos.filter(ag => ag.status === 'confirmado').length;
    
    const taxaComparecimento = total > 0 ? (realizadas / total) * 100 : 0;
    
    // Pacientes únicos
    const pacientesUnicos = [...new Set(agendamentos
      .filter(ag => ag.paciente && ag.paciente._id)
      .map(ag => ag.paciente._id)
    )].length;
    
    return {
      totalConsultas: total,
      consultasRealizadas: realizadas,
      consultasCanceladas: canceladas,
      consultasAgendadas: agendadas,
      consultasConfirmadas: confirmadas,
      taxaComparecimento: Math.round(taxaComparecimento),
      pacientesUnicos,
      taxaCancelamento: total > 0 ? Math.round((canceladas / total) * 100) : 0
    };
  };

  // ✅ FUNÇÃO REAL PARA AGRUPAR CONSULTAS POR MÊS
  const agruparConsultasPorMesReais = (agendamentos) => {
    if (!agendamentos || agendamentos.length === 0) {
      return [];
    }

    const agrupamento = {};
    
    agendamentos.forEach(agendamento => {
      if (!agendamento.data) return;
      
      try {
        const data = new Date(agendamento.data);
        if (isNaN(data.getTime())) return;
        
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const mesAno = `${mes}/${ano}`;
        
        if (!agrupamento[mesAno]) {
          agrupamento[mesAno] = {
            mes: mesAno,
            total: 0,
            realizadas: 0,
            canceladas: 0,
            agendadas: 0,
            confirmadas: 0
          };
        }
        
        agrupamento[mesAno].total++;
        
        if (agendamento.status === 'realizado') agrupamento[mesAno].realizadas++;
        if (agendamento.status === 'cancelado') agrupamento[mesAno].canceladas++;
        if (agendamento.status === 'agendado') agrupamento[mesAno].agendadas++;
        if (agendamento.status === 'confirmado') agrupamento[mesAno].confirmadas++;
      } catch (error) {
        console.warn('❌ Erro ao processar data do agendamento:', agendamento.data, error);
      }
    });
    
    const resultado = Object.values(agrupamento).sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/').map(Number);
      const [mesB, anoB] = b.mes.split('/').map(Number);
      return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1); // Ordem crescente
    });
    
    console.log('📅 Consultas agrupadas por mês:', resultado);
    return resultado;
  };

  // ✅ FUNÇÃO REAL PARA EXTRAIR PACIENTES ATIVOS
  const extrairPacientesAtivosReais = (agendamentos) => {
    if (!agendamentos || agendamentos.length === 0) {
      return [];
    }

    const pacientesMap = new Map();
    
    agendamentos.forEach(agendamento => {
      if (agendamento.paciente && agendamento.paciente._id) {
        const pacienteId = agendamento.paciente._id;
        
        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            _id: pacienteId,
            nome: agendamento.paciente.nome || 'Paciente',
            email: agendamento.paciente.email || '',
            telefone: agendamento.paciente.telefone || '',
            totalConsultas: 0,
            consultasRealizadas: 0,
            ultimaConsulta: agendamento.data
          });
        }
        
        const paciente = pacientesMap.get(pacienteId);
        paciente.totalConsultas++;
        
        if (agendamento.status === 'realizado') {
          paciente.consultasRealizadas++;
        }
        
        try {
          const dataAtual = new Date(agendamento.data);
          const dataUltima = new Date(paciente.ultimaConsulta);
          
          if (dataAtual > dataUltima) {
            paciente.ultimaConsulta = agendamento.data;
          }
        } catch (error) {
          console.warn('❌ Erro ao comparar datas:', error);
        }
      }
    });
    
    const resultado = Array.from(pacientesMap.values())
      .sort((a, b) => b.totalConsultas - a.totalConsultas)
      .slice(0, 10);
    
    console.log('👥 Pacientes ativos:', resultado);
    return resultado;
  };

  const renderBarChart = (data, title, color = '#3b82f6') => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-chart">
          <div className="empty-chart-icon">📊</div>
          <p>Nenhum dado disponível</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item.total || 0));

    return (
      <div className="simple-bar-chart">
        <h4>{title}</h4>
        <div className="chart-bars">
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? ((item.total || 0) / maxValue) * 100 : 0;
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

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="relatorios-medico-container">
      <div className="relatorios-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📊 Meus Relatórios</h1>
            <p>Analise seu desempenho e estatísticas com dados reais</p>
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
          
          <button 
            className="btn btn-outline"
            onClick={loadRelatorios}
            disabled={loading}
          >
            {loading ? '🔄 Atualizando...' : '🔄 Atualizar Dados'}
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Carregando relatórios com dados reais...</p>
          </div>
        ) : (
          <>
            {/* Métricas Principais */}
            <div className="metrics-grid">
              {renderMetricCard(
                'Total de Consultas',
                relatorios.metricas.totalConsultas || 0
              )}
              
              {renderMetricCard(
                'Taxa de Comparecimento',
                `${relatorios.metricas.taxaComparecimento || 0}%`
              )}
              
              {renderMetricCard(
                'Pacientes Únicos',
                relatorios.metricas.pacientesUnicos || 0
              )}
              
              {renderMetricCard(
                'Taxa de Cancelamento',
                `${relatorios.metricas.taxaCancelamento || 0}%`
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
                            {paciente.totalConsultas} consultas • {paciente.consultasRealizadas} realizadas
                          </div>
                        </div>
                        <div className="ranking-badge">
                          {paciente.totalConsultas}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
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
                        <th>Total</th>
                        <th>Realizadas</th>
                        <th>Agendadas</th>
                        <th>Canceladas</th>
                        <th>Taxa de Sucesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorios.consultasPorMes.map((item, index) => {
                        const taxaSucesso = item.total > 0 ? Math.round((item.realizadas / item.total) * 100) : 0;
                        return (
                          <tr key={index}>
                            <td>{item.mes}</td>
                            <td>{item.total}</td>
                            <td>{item.realizadas}</td>
                            <td>{item.agendadas}</td>
                            <td>{item.canceladas}</td>
                            <td>
                              <span className={`status-badge ${
                                taxaSucesso >= 80 ? 'success' : 
                                taxaSucesso >= 60 ? 'warning' : 'danger'
                              }`}>
                                {taxaSucesso}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {relatorios.consultasPorMes.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <p>Nenhum dado disponível para o período selecionado</p>
                    </div>
                  )}
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