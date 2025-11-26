import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicoService } from '../services/medicoService';
import { usuarioService } from '../services/usuarioService';
import { authService } from '../services/authService';
import './PerfilMedico.css';

const PerfilMedico = () => {
  const [medico, setMedico] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    crm: '',
    consultorio: '',
    diasAtendimento: []
  });
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dados');

  const navigate = useNavigate();

  useEffect(() => {
    loadPerfil();
  }, []);

  // ✅ FUNÇÃO ORIGINAL QUE FUNCIONAVA - loadPerfil
  const loadPerfil = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando perfil do médico...');

      const medicoData = await medicoService.getMeusDados();
      console.log('📊 Dados recebidos do médico:', medicoData);

      if (medicoData) {
        setMedico({
          nome: medicoData.nome || '',
          email: medicoData.email || '',
          telefone: medicoData.telefone || '',
          especialidade: medicoData.especialidade || '',
          crm: medicoData.crm || '',
          consultorio: medicoData.consultorio || '',
          diasAtendimento: medicoData.diasAtendimento || [
            { diaSemana: 'segunda', horarios: [] },
            { diaSemana: 'terca', horarios: [] },
            { diaSemana: 'quarta', horarios: [] },
            { diaSemana: 'quinta', horarios: [] },
            { diaSemana: 'sexta', horarios: [] },
            { diaSemana: 'sabado', horarios: [] }
          ]
        });
      } else {
        console.warn('⚠️ Nenhum dado retornado do médico');
        const userData = authService.getCurrentUser();
        setMedico({
          nome: userData?.nome || '',
          email: userData?.email || '',
          telefone: '',
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
      }
    } catch (error) {
      console.error('❌ Erro detalhado ao carregar perfil:', error);

      let errorMessage = 'Erro ao carregar perfil';
      if (error.response) {
        errorMessage = `Erro ${error.response.status}: ${error.response.data?.message || 'Servidor indisponível'}`;
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else {
        errorMessage = error.message || 'Erro desconhecido';
      }

      alert(errorMessage);

      const userData = authService.getCurrentUser();
      setMedico({
        nome: userData?.nome || 'Médico',
        email: userData?.email || '',
        telefone: '',
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
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO CORRIGIDA - handleSalvarPerfil
  const handleSalvarPerfil = async () => {
    try {
      setSalvando(true);

      console.log('💾 Médico salvando próprio perfil...', medico);

      // Preparar dados para atualização
      const dadosAtualizacao = {
        nome: medico.nome,
        telefone: medico.telefone,
        especialidade: medico.especialidade,
        crm: medico.crm,
        consultorio: medico.consultorio,
        diasAtendimento: medico.diasAtendimento
      };

      console.log('📤 Enviando para o backend:', dadosAtualizacao);

      let resultado;

      // ✅ TENTAR PRIMEIRO: Nova rota específica para médico
      try {
        resultado = await medicoService.atualizarMeuPerfil(dadosAtualizacao);
        console.log('✅ Perfil salvo via rota específica:', resultado);
      } catch (medicoError) {
        console.log('⚠️ Rota específica falhou, tentando métodos alternativos...');

        // ✅ TENTAR SEGUNDO: Atualizar dados básicos via usuário
        const userData = authService.getCurrentUser();
        if (userData && userData.id) {
          await usuarioService.atualizarUsuario(userData.id, {
            nome: medico.nome,
            telefone: medico.telefone
          });
          console.log('✅ Dados básicos atualizados via usuário');
        }

        // ✅ TENTAR TERCEIRO: Para dados de médico específicos
        if (medico.especialidade || medico.crm || medico.diasAtendimento) {
          try {
            // Buscar médico existente primeiro
            const medicoExistente = await medicoService.getMeusDados();
            if (medicoExistente && medicoExistente._id) {
              resultado = await medicoService.atualizarMedico(medicoExistente._id, {
                especialidade: medico.especialidade,
                consultorio: medico.consultorio,
                diasAtendimento: medico.diasAtendimento
              });
              console.log('✅ Dados médicos atualizados via rota admin (fallback)');
            }
          } catch (medicoSpecificError) {
            console.log('⚠️ Atualização de dados médicos falhou:', medicoSpecificError);
          }
        }
      }

      alert('✅ Perfil atualizado com sucesso!');
      setEditando(false);

      // Recarregar dados do banco
      await loadPerfil();

    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);

      let errorMessage = 'Erro ao salvar perfil';
      if (error.response) {
        errorMessage = `Erro ${error.response.status}: ${error.response.data?.message || 'Servidor indisponível'}`;
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else {
        errorMessage = error.message || 'Erro desconhecido';
      }

      alert('❌ ' + errorMessage);
    } finally {
      setSalvando(false);
    }
  };

  // ✅ FUNÇÃO ORIGINAL QUE FUNCIONAVA - handleAlterarSenha
  const handleAlterarSenha = async () => {
    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (senhaForm.novaSenha.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    try {
      setSalvando(true);

      await usuarioService.alterarSenha(senhaForm.senhaAtual, senhaForm.novaSenha);

      alert('✅ Senha alterada com sucesso!');
      setShowSenhaModal(false);
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });

    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      alert('Erro ao alterar senha: ' + (error.message || 'Verifique a senha atual'));
    } finally {
      setSalvando(false);
    }
  };

  // ✅ FUNÇÕES ORIGINAIS QUE FUNCIONAVAM - Gerenciamento de Horários
  const handleToggleDiaAtendimento = (diaIndex) => {
    if (!editando) return;

    const novosDias = [...medico.diasAtendimento];
    if (novosDias[diaIndex].horarios.length === 0) {
      novosDias[diaIndex].horarios = ['08:00', '09:00', '10:00', '14:00', '15:00'];
    } else {
      novosDias[diaIndex].horarios = [];
    }

    setMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
  };

  const handleAdicionarHorario = (diaIndex) => {
    const novosDias = [...medico.diasAtendimento];
    novosDias[diaIndex].horarios.push('08:00');
    setMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
  };

  const handleRemoverHorario = (diaIndex, horarioIndex) => {
    const novosDias = [...medico.diasAtendimento];
    novosDias[diaIndex].horarios.splice(horarioIndex, 1);
    setMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
  };

  const handleHorarioChange = (diaIndex, horarioIndex, novoHorario) => {
    const novosDias = [...medico.diasAtendimento];
    novosDias[diaIndex].horarios[horarioIndex] = novoHorario;
    setMedico(prev => ({ ...prev, diasAtendimento: novosDias }));
  };

  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' }
  ];

  if (loading) {
    return (
      <div className="perfil-medico-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-medico-container">
      {/* Header - NOVO DESIGN seguindo AdminDashboard */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>👤 Perfil do Médico</h1>
            <p>Gerencie suas informações pessoais e profissionais</p>
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

      {/* Navigation Tabs - NOVO DESIGN seguindo AdminDashboard */}
      <nav className="admin-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dados' ? 'active' : ''}`}
            onClick={() => setActiveTab('dados')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">Dados Pessoais</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'horarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('horarios')}
          >
            <span className="tab-icon">🕒</span>
            <span className="tab-label">Horários</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'seguranca' ? 'active' : ''}`}
            onClick={() => setActiveTab('seguranca')}
          >
            <span className="tab-icon">🔒</span>
            <span className="tab-label">Segurança</span>
          </button>
        </div>
      </nav>

      {/* Main Content - NOVO DESIGN seguindo AdminDashboard */}
      <main className="admin-main">
        <div className="tab-content">

          {/* Tab: Dados Pessoais */}
          {activeTab === 'dados' && (
            <div className="content-section">
              <div className="content-header">
                <h2>📝 Informações Pessoais</h2>
                {!editando ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setEditando(true)}
                  >
                    <span>✏️</span>
                    Editar Perfil
                  </button>
                ) : (
                  <div className="header-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setEditando(false);
                        loadPerfil();
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="form-container">
                <form className="modal-form">
                  <div className="form-section">
                    <h4>👤 Dados Básicos</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nome Completo *</label>
                        <input
                          type="text"
                          value={medico.nome}
                          onChange={(e) => setMedico(prev => ({ ...prev, nome: e.target.value }))}
                          disabled={!editando}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={medico.email}
                          disabled
                          className="disabled-input"
                          placeholder="seu.email@exemplo.com"
                        />
                        <small className="input-help">Email não pode ser alterado</small>
                      </div>

                      <div className="form-group">
                        <label>Telefone</label>
                        <input
                          type="tel"
                          value={medico.telefone}
                          onChange={(e) => setMedico(prev => ({ ...prev, telefone: e.target.value }))}
                          disabled={!editando}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>🏥 Dados Profissionais</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Especialidade *</label>
                        <input
                          type="text"
                          value={medico.especialidade}
                          onChange={(e) => setMedico(prev => ({ ...prev, especialidade: e.target.value }))}
                          disabled={!editando}
                          placeholder="Sua especialidade médica"
                        />
                      </div>

                      <div className="form-group">
                        <label>CRM *</label>
                        <input
                          type="text"
                          value={medico.crm}
                          onChange={(e) => setMedico(prev => ({ ...prev, crm: e.target.value }))}
                          disabled={!editando}
                          placeholder="CRM/UF 123456"
                        />
                      </div>

                      <div className="form-group">
                        <label>Consultório</label>
                        <input
                          type="text"
                          value={medico.consultorio}
                          onChange={(e) => setMedico(prev => ({ ...prev, consultorio: e.target.value }))}
                          disabled={!editando}
                          placeholder="Endereço do consultório"
                        />
                      </div>
                    </div>
                  </div>

                  {editando && (
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSalvarPerfil}
                        disabled={salvando}
                      >
                        {salvando ? (
                          <>
                            <div className="loading-spinner-small"></div>
                            Salvando...
                          </>
                        ) : (
                          '💾 Salvar Alterações'
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Tab: Horários de Atendimento */}
          {activeTab === 'horarios' && (
            <div className="content-section">
              <div className="content-header">
                <h2>🕒 Horários de Atendimento</h2>
                <div className="header-actions">
                  {!editando ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setEditando(true)}
                    >
                      <span>✏️</span>
                      Editar Horários
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setEditando(false);
                        loadPerfil();
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              <div className="horarios-container">
                <div className="section-description">
                  <p>Configure os dias e horários em que você atende. Os pacientes poderão agendar consultas apenas nestes horários disponíveis.</p>
                </div>

                <div className="dias-atendimento-grid-improved">
                  {diasSemana.map((dia, index) => {
                    const diaAtendimento = medico.diasAtendimento.find(d => d.diaSemana === dia.key) || { horarios: [] };
                    const ativo = diaAtendimento.horarios.length > 0;

                    return (
                      <div key={dia.key} className={`dia-atendimento-card-improved ${ativo ? 'active' : ''}`}>
                        <div className="dia-header-improved">
                          <label className="dia-checkbox-improved">
                            <input
                              type="checkbox"
                              checked={ativo}
                              onChange={() => handleToggleDiaAtendimento(index)}
                              disabled={!editando}
                            />
                            <span className="checkmark"></span>
                            <span className="dia-nome-improved">
                              {dia.label}
                            </span>
                          </label>
                          <span className="horarios-count">
                            {ativo ? `${diaAtendimento.horarios.length} horários` : 'Inativo'}
                          </span>
                        </div>

                        {ativo && (
                          <div className="horarios-list-improved">
                            <div className="horarios-header-improved">
                              <span>Horários configurados:</span>
                              {editando && (
                                <button
                                  type="button"
                                  className="btn-add-horario-improved"
                                  onClick={() => handleAdicionarHorario(index)}
                                >
                                  + Add Horário
                                </button>
                              )}
                            </div>

                            <div className="horarios-grid">
                              {diaAtendimento.horarios.map((horario, horarioIndex) => (
                                <div key={horarioIndex} className="horario-item-improved">
                                  <input
                                    type="time"
                                    value={horario}
                                    onChange={(e) => handleHorarioChange(index, horarioIndex, e.target.value)}
                                    disabled={!editando}
                                    className="time-input-improved"
                                  />
                                  {editando && diaAtendimento.horarios.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn-remove-horario-improved"
                                      onClick={() => handleRemoverHorario(index, horarioIndex)}
                                      title="Remover horário"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {editando && (
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSalvarPerfil}
                      disabled={salvando}
                    >
                      {salvando ? (
                        <>
                          <div className="loading-spinner-small"></div>
                          Salvando...
                        </>
                      ) : (
                        '💾 Salvar Horários'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Segurança */}
          {activeTab === 'seguranca' && (
            <div className="content-section">
              <div className="content-header">
                <h2>🔒 Segurança da Conta</h2>
              </div>

              <div className="security-container">
                <div className="security-grid">
                  <div className="security-card">
                    <div className="security-icon">🔑</div>
                    <div className="security-content">
                      <h3>Alterar Senha</h3>
                      <p>Atualize sua senha de acesso ao sistema regularmente para manter sua conta segura</p>
                    </div>
                    <button
                      className="btn btn-warning"
                      onClick={() => setShowSenhaModal(true)}
                    >
                      Alterar Senha
                    </button>
                  </div>

                  <div className="security-card">
                    <div className="security-icon">👤</div>
                    <div className="security-content">
                      <h3>Sessão Atual</h3>
                      <p>Você está logado como médico no sistema NAMI</p>
                    </div>
                    <div className="session-info">
                      <span className="session-status active">● Ativo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Alteração de Senha */}
      {showSenhaModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🔑 Alterar Senha</h3>
              <button
                className="btn btn-icon close-btn"
                onClick={() => setShowSenhaModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Senha Atual *</label>
                    <input
                      type="password"
                      value={senhaForm.senhaAtual}
                      onChange={(e) => setSenhaForm(prev => ({ ...prev, senhaAtual: e.target.value }))}
                      placeholder="Digite sua senha atual"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Nova Senha *</label>
                    <input
                      type="password"
                      value={senhaForm.novaSenha}
                      onChange={(e) => setSenhaForm(prev => ({ ...prev, novaSenha: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirmar Nova Senha *</label>
                    <input
                      type="password"
                      value={senhaForm.confirmarSenha}
                      onChange={(e) => setSenhaForm(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                      placeholder="Digite a nova senha novamente"
                      required
                      minLength="6"
                    />
                  </div>
                </div>

                <div className="password-requirements">
                  <h4>📝 Requisitos da Senha:</h4>
                  <ul>
                    <li>Mínimo de 6 caracteres</li>
                    <li>Use letras, números e símbolos</li>
                    <li>Evite senhas óbvias ou comuns</li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAlterarSenha}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Alterando...
                      </>
                    ) : (
                      '🔒 Alterar Senha'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowSenhaModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilMedico;