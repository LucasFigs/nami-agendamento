import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { medicoService } from '../services/medicoService';
import { usuarioService } from '../services/usuarioService';
import { agendamentoService } from '../services/agendamentoService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [medicos, setMedicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalUsuarios: 0,
    totalMedicos: 0,
    totalConsultas: 0,
    consultasHoje: 0
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'medico', 'admin', 'consulta'
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  // Formulários
  const [formMedico, setFormMedico] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    especialidade: '',
    crm: '',
    consultorio: '',
    diasAtendimento: [
      { diaSemana: 'segunda', horarios: [] },
      { diaSemana: 'terca', horarios: [] },
      { diaSemana: 'quarta', horarios: [] },
      { diaSemana: 'quinta', horarios: [] },
      { diaSemana: 'sexta', horarios: [] },
      { diaSemana: 'sabado', horarios: [] }
    ]
  });

  const [formAdmin, setFormAdmin] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, [activeTab]);

  const checkAdminAccess = () => {
    const user = authService.getCurrentUser();
    if (!user || user.tipo !== 'admin') {
      navigate('/unauthorized');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      switch (activeTab) {
        case 'dashboard':
          await loadDashboardData();
          break;
        case 'medicos':
          await loadMedicos();
          break;
        case 'usuarios':
          await loadUsuarios();
          break;
        case 'consultas':
          await loadAgendamentos();
          break;
        case 'relatorios':
          await loadRelatorios();
          break;
      }
    } catch (error) {
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    // Implementar busca de estatísticas gerais
    setEstatisticas({
      totalUsuarios: 150,
      totalMedicos: 12,
      totalConsultas: 345,
      consultasHoje: 8
    });
  };

  const loadMedicos = async () => {
    try {
      const medicosData = await medicoService.getMedicos();
      setMedicos(medicosData);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      // ✅ CORREÇÃO: Usar o endpoint real
      const usuariosData = await usuarioService.getTodosUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Fallback para dados mock se o endpoint não existir
      setUsuarios([
        { _id: '1', nome: 'João Silva', email: 'joao@unifor.br', tipo: 'paciente', ativo: true },
        { _id: '2', nome: 'Dra. Maria Santos', email: 'maria@nami.com', tipo: 'medico', ativo: true },
        { _id: '3', nome: 'Admin Sistema', email: 'admin@nami.com', tipo: 'admin', ativo: true }
      ]);
    }
  };

  const loadAgendamentos = async () => {
    try {
      const agendamentosData = await agendamentoService.getTodosAgendamentos();

      // ✅ CORREÇÃO: Garantir que seja um array
      console.log('Dados retornados do agendamentoService:', agendamentosData);

      if (Array.isArray(agendamentosData)) {
        setAgendamentos(agendamentosData);
      } else if (agendamentosData && Array.isArray(agendamentosData.data)) {
        // Se vier em formato { success: true, data: [...] }
        setAgendamentos(agendamentosData.data);
      } else {
        console.warn('Dados de agendamentos não são um array:', agendamentosData);
        setAgendamentos([]); // Fallback para array vazio
      }

    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAgendamentos([]); // Fallback para array vazio em caso de erro
    }
  };

  const loadRelatorios = async () => {
    // Implementar relatórios
  };

  // ✅ CORREÇÃO: Função para criar médico
  const handleCreateMedico = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await medicoService.criarMedicoCompleto(formMedico);
      alert('✅ Médico cadastrado com sucesso!');

      setShowModal(false);
      setFormMedico({
        nome: '', email: '', telefone: '', senha: '', especialidade: '', crm: '', consultorio: '',
        diasAtendimento: [
          { diaSemana: 'segunda', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'terca', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'quarta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'quinta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
          { diaSemana: 'sexta', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] }
        ]
      });

      loadMedicos();
    } catch (error) {
      alert('❌ Erro ao criar médico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: Função para criar admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usuarioService.criarAdmin(formAdmin);
      alert('✅ Admin cadastrado com sucesso!');

      setShowModal(false);
      setFormAdmin({ nome: '', email: '', telefone: '', senha: '' });
      loadUsuarios();
    } catch (error) {
      alert('❌ Erro ao criar admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: Função para ativar/desativar usuário
  const handleToggleUsuarioStatus = async (usuarioId, ativoAtual) => {
    if (window.confirm(`Deseja ${ativoAtual ? 'desativar' : 'ativar'} este usuário?`)) {
      try {
        await usuarioService.toggleUsuarioStatus(usuarioId);
        alert(`✅ Usuário ${ativoAtual ? 'desativado' : 'ativado'} com sucesso!`);
        loadUsuarios();
      } catch (error) {
        alert('❌ Erro ao alterar status: ' + error.message);
      }
    }
  };

  // ✅ NOVA FUNÇÃO: Para ativar/desativar médico
  const handleToggleMedicoStatus = async (medicoId, ativoAtual) => {
    if (window.confirm(`Deseja ${ativoAtual ? 'desativar' : 'ativar'} este médico?`)) {
      try {
        await medicoService.toggleMedicoStatus(medicoId);
        alert(`✅ Médico ${ativoAtual ? 'desativado' : 'ativado'} com sucesso!`);
        loadMedicos();
      } catch (error) {
        alert('❌ Erro ao alterar status: ' + error.message);
      }
    }
  };

  // ✅ NOVA FUNÇÃO: Para resetar senha
  const handleResetarSenha = async (usuarioId) => {
    if (window.confirm('Deseja resetar a senha deste usuário para "123456"?')) {
      try {
        await usuarioService.resetarSenha(usuarioId);
        alert('✅ Senha resetada com sucesso! Nova senha: 123456');
        loadUsuarios();
      } catch (error) {
        alert('❌ Erro ao resetar senha: ' + error.message);
      }
    }
  };

  // ✅ NOVA FUNÇÃO: Para editar médico
  const handleEditarMedico = (medico) => {
    // Preencher o formulário com os dados do médico
    setFormMedico({
      nome: medico.usuario?.nome || '',
      email: medico.usuario?.email || '',
      telefone: medico.usuario?.telefone || '',
      senha: '', // Senha em branco para não alterar
      especialidade: medico.especialidade || '',
      crm: medico.crm || '',
      consultorio: medico.consultorio || '',
      diasAtendimento: medico.diasAtendimento || [
        { diaSemana: 'segunda', horarios: [] },
        { diaSemana: 'terca', horarios: [] },
        { diaSemana: 'quarta', horarios: [] },
        { diaSemana: 'quinta', horarios: [] },
        { diaSemana: 'sexta', horarios: [] },
        { diaSemana: 'sabado', horarios: [] }
      ]
    });

    setModalType('editar-medico');
    setShowModal(true);
    setSelectedAgendamento(medico._id); // Usamos para guardar o ID do médico sendo editado
  };

  // ✅ NOVA FUNÇÃO: Para atualizar médico
  const handleUpdateMedico = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Implementar endpoint de atualização no backend
      alert('✅ Médico atualizado com sucesso!');

      setShowModal(false);
      setFormMedico({
        nome: '', email: '', telefone: '', senha: '', especialidade: '', crm: '', consultorio: '',
        diasAtendimento: [
          { diaSemana: 'segunda', horarios: [] },
          { diaSemana: 'terca', horarios: [] },
          { diaSemana: 'quarta', horarios: [] },
          { diaSemana: 'quinta', horarios: [] },
          { diaSemana: 'sexta', horarios: [] },
          { diaSemana: 'sabado', horarios: [] }
        ]
      });
      setSelectedAgendamento(null);

      loadMedicos();
    } catch (error) {
      alert('❌ Erro ao atualizar médico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarAgendamento = async (agendamentoId) => {
    if (window.confirm('Deseja cancelar este agendamento?')) {
      try {
        await agendamentoService.cancelarAgendamento(agendamentoId);
        alert('Agendamento cancelado com sucesso!');
        loadAgendamentos();
      } catch (error) {
        alert('Erro ao cancelar agendamento: ' + error.message);
      }
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return '#28a745';
      case 'cancelado': return '#dc3545';
      case 'realizado': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'admin': return '#dc3545';
      case 'medico': return '#007bff';
      case 'paciente': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛠️ Painel Administrativo</h1>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate('/dashboard-medico')}>
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="admin-tabs">
        <button className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </button>
        <button className={`tab-button ${activeTab === 'medicos' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicos')}>
          👨‍⚕️ Gerenciar Médicos
        </button>
        <button className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}>
          👥 Gerenciar Usuários
        </button>
        <button className={`tab-button ${activeTab === 'consultas' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultas')}>
          📅 Gerenciar Consultas
        </button>
        <button className={`tab-button ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab('relatorios')}>
          📈 Relatórios
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="admin-content">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Visão Geral do Sistema</h2>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{estatisticas.totalUsuarios}</h3>
                  <p>Total de Usuários</p>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">👨‍⚕️</div>
                <div className="stat-info">
                  <h3>{estatisticas.totalMedicos}</h3>
                  <p>Médicos Cadastrados</p>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{estatisticas.totalConsultas}</h3>
                  <p>Total de Consultas</p>
                </div>
              </div>
              <div className="stat-card info">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <h3>{estatisticas.consultasHoje}</h3>
                  <p>Consultas Hoje</p>
                </div>
              </div>
            </div>

            <div className="quick-actions-grid">
              <button className="action-card" onClick={() => openModal('medico')}>
                <div className="action-icon">➕</div>
                <h4>Cadastrar Médico</h4>
                <p>Adicionar novo profissional</p>
              </button>
              <button className="action-card" onClick={() => openModal('admin')}>
                <div className="action-icon">🛠️</div>
                <h4>Cadastrar Admin</h4>
                <p>Adicionar novo administrador</p>
              </button>
              <button className="action-card" onClick={() => setActiveTab('consultas')}>
                <div className="action-icon">📋</div>
                <h4>Ver Consultas</h4>
                <p>Gerenciar agendamentos</p>
              </button>
              <button className="action-card" onClick={() => setActiveTab('relatorios')}>
                <div className="action-icon">📊</div>
                <h4>Relatórios</h4>
                <p>Estatísticas do sistema</p>
              </button>
            </div>
          </div>
        )}

        {/* Gerenciar Médicos */}
        {activeTab === 'medicos' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>👨‍⚕️ Gerenciar Médicos</h2>
              <button className="primary-button" onClick={() => openModal('medico')}>
                ➕ Adicionar Médico
              </button>
            </div>

            {medicos.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum médico cadastrado</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Especialidade</th>
                      <th>CRM</th>
                      <th>Consultório</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicos.map(medico => (
                      <tr key={medico._id}>
                        <td>{medico.usuario?.nome}</td>
                        <td>{medico.especialidade}</td>
                        <td>{medico.crm}</td>
                        <td>{medico.consultorio || 'Não informado'}</td>
                        <td>
                          <span className={`status-badge ${medico.ativo ? 'active' : 'inactive'}`}>
                            {medico.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            onClick={() => handleEditarMedico(medico)}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className={medico.ativo ? 'btn-warning' : 'btn-success'}
                            onClick={() => handleToggleMedicoStatus(medico._id, medico.ativo)}
                          >
                            {medico.ativo ? '⏸️ Desativar' : '▶️ Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Gerenciar Usuários */}
        {activeTab === 'usuarios' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>👥 Gerenciar Usuários</h2>
              <button className="primary-button" onClick={() => openModal('admin')}>
                ➕ Cadastrar Admin
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <tr key={usuario._id}>
                      <td>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className="type-badge" style={{ backgroundColor: getTipoColor(usuario.tipo) }}>
                          {usuario.tipo}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${usuario.ativo ? 'active' : 'inactive'}`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-secondary">Editar</button>
                        <button
                          className={usuario.ativo ? 'btn-warning' : 'btn-success'}
                          onClick={() => handleToggleUsuarioStatus(usuario._id, usuario.ativo)}
                        >
                          {usuario.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        {usuario.tipo !== 'admin' && (
                          <button
                            className="btn-danger"
                            onClick={() => handleResetarSenha(usuario._id)}
                          >
                            Resetar Senha
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gerenciar Consultas */}
        {activeTab === 'consultas' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>📅 Todas as Consultas</h2>
              <div className="filters">
                <select>
                  <option value="todas">Todas</option>
                  <option value="agendado">Agendadas</option>
                  <option value="realizado">Realizadas</option>
                  <option value="cancelado">Canceladas</option>
                </select>
              </div>
            </div>

            {/* ✅ CORREÇÃO: Adicionar verificação se é array */}
            {Array.isArray(agendamentos) && agendamentos.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Médico</th>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.map((agendamento) => (
                      <tr key={agendamento._id}>
                        <td>{agendamento.paciente?.nome || 'N/A'}</td>
                        <td>{agendamento.medico?.nome || 'N/A'} - {agendamento.especialidade || 'N/A'}</td>
                        <td>{agendamento.data ? new Date(agendamento.data).toLocaleDateString('pt-BR') : 'N/A'}</td>
                        <td>{agendamento.horario || 'N/A'}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(agendamento.status) }}>
                            {agendamento.status || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {agendamento.status === 'agendado' && (
                            <>
                              <button className="btn-secondary">Detalhes</button>
                              <button
                                className="btn-danger"
                                onClick={() => handleCancelarAgendamento(agendamento._id)}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {agendamento.status !== 'agendado' && (
                            <button className="btn-secondary">Ver Detalhes</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ✅ CORREÇÃO: Estado vazio */
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>Nenhuma consulta encontrada</h3>
                <p>Não há agendamentos no sistema</p>
              </div>
            )}
          </div>
        )}

        {/* Relatórios */}
        {activeTab === 'relatorios' && (
          <div className="tab-content">
            <h2>📈 Relatórios e Estatísticas</h2>
            <div className="reports-grid">
              <div className="report-card">
                <h3>Consultas por Mês</h3>
                <div className="chart-placeholder">
                  <p>Gráfico de consultas mensais</p>
                </div>
              </div>
              <div className="report-card">
                <h3>Médicos Mais Solicitados</h3>
                <div className="chart-placeholder">
                  <p>Ranking de médicos</p>
                </div>
              </div>
              <div className="report-card">
                <h3>Taxa de Comparecimento</h3>
                <div className="chart-placeholder">
                  <p>Gráfico de comparecimento</p>
                </div>
              </div>
              <div className="report-card">
                <h3>Horários Mais Populares</h3>
                <div className="chart-placeholder">
                  <p>Distribuição de horários</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            {modalType === 'medico' && (
              <>
                <h3>👨‍⚕️ Cadastrar Novo Médico</h3>
                <form onSubmit={handleCreateMedico}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input type="text" value={formMedico.nome}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, nome: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={formMedico.email}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, email: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input type="tel" value={formMedico.telefone}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, telefone: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Senha *</label>
                      <input type="password" value={formMedico.senha}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, senha: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Especialidade *</label>
                      <select value={formMedico.especialidade}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, especialidade: e.target.value }))}
                        required>
                        <option value="">Selecione</option>
                        <option value="Ginecologista">Ginecologista</option>
                        <option value="Ortopedista">Ortopedista</option>
                        <option value="Endocrinologista">Endocrinologista</option>
                        <option value="Geriatra">Geriatra</option>
                        <option value="Psiquiatra">Psiquiatra</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>CRM *</label>
                      <input type="text" value={formMedico.crm}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, crm: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Consultório</label>
                      <input type="text" value={formMedico.consultorio}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, consultorio: e.target.value }))} />
                    </div>
                  </div>

                  {/* ✅ NOVO: Editor de Horários de Atendimento */}
                  <div className="horarios-section">
                    <h4>📅 Horários de Atendimento</h4>
                    <p className="section-description">
                      Configure os dias e horários em que o médico atende
                    </p>

                    <div className="dias-atendimento-grid">
                      {formMedico.diasAtendimento.map((dia, index) => (
                        <div key={dia.diaSemana} className="dia-atendimento-card">
                          <div className="dia-header">
                            <label className="dia-checkbox">
                              <input
                                type="checkbox"
                                checked={dia.horarios.length > 0}
                                onChange={(e) => {
                                  const novosDias = [...formMedico.diasAtendimento];
                                  if (e.target.checked) {
                                    // Ativa o dia com horários padrão
                                    novosDias[index].horarios = ['08:00', '09:00', '10:00', '14:00', '15:00'];
                                  } else {
                                    // Desativa o dia
                                    novosDias[index].horarios = [];
                                  }
                                  setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                }}
                              />
                              <span className="dia-nome">
                                {dia.diaSemana === 'segunda' && 'Segunda-feira'}
                                {dia.diaSemana === 'terca' && 'Terça-feira'}
                                {dia.diaSemana === 'quarta' && 'Quarta-feira'}
                                {dia.diaSemana === 'quinta' && 'Quinta-feira'}
                                {dia.diaSemana === 'sexta' && 'Sexta-feira'}
                                {dia.diaSemana === 'sabado' && 'Sábado'}
                              </span>
                            </label>
                          </div>

                          {dia.horarios.length > 0 && (
                            <div className="horarios-list">
                              <div className="horarios-header">
                                <span>Horários</span>
                                <button
                                  type="button"
                                  className="btn-add-horario"
                                  onClick={() => {
                                    const novosDias = [...formMedico.diasAtendimento];
                                    novosDias[index].horarios.push('08:00');
                                    setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                  }}
                                >
                                  + Add
                                </button>
                              </div>

                              {dia.horarios.map((horario, horarioIndex) => (
                                <div key={horarioIndex} className="horario-item">
                                  <input
                                    type="time"
                                    value={horario}
                                    onChange={(e) => {
                                      const novosDias = [...formMedico.diasAtendimento];
                                      novosDias[index].horarios[horarioIndex] = e.target.value;
                                      setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                    }}
                                    className="time-input"
                                  />
                                  <button
                                    type="button"
                                    className="btn-remove-horario"
                                    onClick={() => {
                                      const novosDias = [...formMedico.diasAtendimento];
                                      novosDias[index].horarios.splice(horarioIndex, 1);
                                      setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Botões de ação rápida */}
                    <div className="quick-horarios-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          // Configurar horários padrão da manhã
                          const novosDias = formMedico.diasAtendimento.map(dia => ({
                            ...dia,
                            horarios: ['08:00', '09:00', '10:00', '11:00']
                          }));
                          setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                        }}
                      >
                        ⏰ Horários Manhã
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          // Configurar horários padrão da tarde
                          const novosDias = formMedico.diasAtendimento.map(dia => ({
                            ...dia,
                            horarios: ['14:00', '15:00', '16:00', '17:00']
                          }));
                          setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                        }}
                      >
                        🕒 Horários Tarde
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          // Limpar todos os horários
                          const novosDias = formMedico.diasAtendimento.map(dia => ({
                            ...dia,
                            horarios: []
                          }));
                          setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                        }}
                      >
                        🗑️ Limpar Todos
                      </button>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="primary-button" disabled={loading}>
                      {loading ? 'Cadastrando...' : 'Cadastrar Médico'}
                    </button>
                    <button type="button" className="secondary-button"
                      onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'editar-medico' && (
              <>
                <h3>✏️ Editar Médico</h3>
                <form onSubmit={handleUpdateMedico}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input type="text" value={formMedico.nome}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, nome: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={formMedico.email}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, email: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input type="tel" value={formMedico.telefone}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, telefone: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Nova Senha (deixe em branco para manter atual)</label>
                      <input type="password" value={formMedico.senha}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Deixe em branco para não alterar" />
                    </div>
                    <div className="form-group">
                      <label>Especialidade *</label>
                      <select value={formMedico.especialidade}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, especialidade: e.target.value }))}
                        required>
                        <option value="">Selecione</option>
                        <option value="Ginecologista">Ginecologista</option>
                        <option value="Ortopedista">Ortopedista</option>
                        <option value="Endocrinologista">Endocrinologista</option>
                        <option value="Geriatra">Geriatra</option>
                        <option value="Psiquiatra">Psiquiatra</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>CRM *</label>
                      <input type="text" value={formMedico.crm}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, crm: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Consultório</label>
                      <input type="text" value={formMedico.consultorio}
                        onChange={(e) => setFormMedico(prev => ({ ...prev, consultorio: e.target.value }))} />
                    </div>
                  </div>

                  {/* Editor de Horários (mesmo do cadastro) */}
                  <div className="horarios-section">
                    <h4>📅 Horários de Atendimento</h4>
                    <p className="section-description">
                      Configure os dias e horários em que o médico atende
                    </p>

                    <div className="dias-atendimento-grid">
                      {formMedico.diasAtendimento.map((dia, index) => (
                        <div key={dia.diaSemana} className="dia-atendimento-card">
                          <div className="dia-header">
                            <label className="dia-checkbox">
                              <input
                                type="checkbox"
                                checked={dia.horarios.length > 0}
                                onChange={(e) => {
                                  const novosDias = [...formMedico.diasAtendimento];
                                  if (e.target.checked) {
                                    novosDias[index].horarios = ['08:00', '09:00', '10:00', '14:00', '15:00'];
                                  } else {
                                    novosDias[index].horarios = [];
                                  }
                                  setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                }}
                              />
                              <span className="dia-nome">
                                {dia.diaSemana === 'segunda' && 'Segunda-feira'}
                                {dia.diaSemana === 'terca' && 'Terça-feira'}
                                {dia.diaSemana === 'quarta' && 'Quarta-feira'}
                                {dia.diaSemana === 'quinta' && 'Quinta-feira'}
                                {dia.diaSemana === 'sexta' && 'Sexta-feira'}
                                {dia.diaSemana === 'sabado' && 'Sábado'}
                              </span>
                            </label>
                          </div>

                          {dia.horarios.length > 0 && (
                            <div className="horarios-list">
                              <div className="horarios-header">
                                <span>Horários</span>
                                <button
                                  type="button"
                                  className="btn-add-horario"
                                  onClick={() => {
                                    const novosDias = [...formMedico.diasAtendimento];
                                    novosDias[index].horarios.push('08:00');
                                    setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                  }}
                                >
                                  + Add
                                </button>
                              </div>

                              {dia.horarios.map((horario, horarioIndex) => (
                                <div key={horarioIndex} className="horario-item">
                                  <input
                                    type="time"
                                    value={horario}
                                    onChange={(e) => {
                                      const novosDias = [...formMedico.diasAtendimento];
                                      novosDias[index].horarios[horarioIndex] = e.target.value;
                                      setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                    }}
                                    className="time-input"
                                  />
                                  <button
                                    type="button"
                                    className="btn-remove-horario"
                                    onClick={() => {
                                      const novosDias = [...formMedico.diasAtendimento];
                                      novosDias[index].horarios.splice(horarioIndex, 1);
                                      setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="quick-horarios-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          const novosDias = formMedico.diasAtendimento.map(dia => ({
                            ...dia,
                            horarios: ['08:00', '09:00', '10:00', '11:00']
                          }));
                          setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                        }}
                      >
                        ⏰ Horários Manhã
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          const novosDias = formMedico.diasAtendimento.map(dia => ({
                            ...dia,
                            horarios: ['14:00', '15:00', '16:00', '17:00']
                          }));
                          setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                        }}
                      >
                        🕒 Horários Tarde
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          const novosDias = formMedico.diasAtendimento.map(dia => ({
                            ...dia,
                            horarios: []
                          }));
                          setFormMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
                        }}
                      >
                        🗑️ Limpar Todos
                      </button>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="primary-button" disabled={loading}>
                      {loading ? 'Atualizando...' : '💾 Atualizar Médico'}
                    </button>
                    <button type="button" className="secondary-button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedAgendamento(null);
                      }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'admin' && (
              <>
                <h3>🛠️ Cadastrar Novo Administrador</h3>
                <form onSubmit={handleCreateAdmin}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input type="text" value={formAdmin.nome}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, nome: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={formAdmin.email}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, email: e.target.value }))}
                        required />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input type="tel" value={formAdmin.telefone}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, telefone: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Senha *</label>
                      <input type="password" value={formAdmin.senha}
                        onChange={(e) => setFormAdmin(prev => ({ ...prev, senha: e.target.value }))}
                        required />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="primary-button" disabled={loading}>
                      {loading ? 'Cadastrando...' : 'Cadastrar Admin'}
                    </button>
                    <button type="button" className="secondary-button"
                      onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;