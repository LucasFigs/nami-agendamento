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

  const navigate = useNavigate();

  useEffect(() => {
    loadPerfil();
  }, []);

  // ✅ CORREÇÃO NO PerfilMedico.js - loadPerfil
  const loadPerfil = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando perfil do médico...');

      // ✅ CORREÇÃO: Usar medicoService em vez de agendamentoService
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
        // ✅ FALLBACK: Usar dados do usuário logado
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

      // ✅ CORREÇÃO: Mensagem de erro mais específica
      let errorMessage = 'Erro ao carregar perfil';

      if (error.response) {
        errorMessage = `Erro ${error.response.status}: ${error.response.data?.message || 'Servidor indisponível'}`;
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else {
        errorMessage = error.message || 'Erro desconhecido';
      }

      alert(errorMessage);

      // ✅ FALLBACK: Carregar dados básicos do usuário
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

  const handleSalvarPerfil = async () => {
    try {
      setSalvando(true);
      // Aqui você implementaria a atualização do perfil
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      alert('Perfil atualizado com sucesso!');
      setEditando(false);
    } catch (error) {
      alert('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

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
    
    // ✅ CORREÇÃO: Chamar o serviço real de alteração de senha
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

  const handleToggleDiaAtendimento = (diaIndex) => {
    if (!editando) return;

    const novosDias = [...medico.diasAtendimento];
    if (novosDias[diaIndex].horarios.length === 0) {
      // Ativar dia com horários padrão
      novosDias[diaIndex].horarios = ['08:00', '09:00', '10:00', '14:00', '15:00'];
    } else {
      // Desativar dia
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
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-medico-container">
      <div className="perfil-header">
        <div className="header-content">
          <div className="header-title">
            <h1>👤 Meu Perfil</h1>
            <p>Gerencie suas informações pessoais e profissionais</p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/dashboard-medico')}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>

      <div className="perfil-content">
        <div className="perfil-grid">
          {/* Informações Pessoais */}
          <div className="perfil-card">
            <div className="card-header">
              <h2>📝 Informações Pessoais</h2>
              {!editando && (
                <button
                  className="btn btn-primary"
                  onClick={() => setEditando(true)}
                >
                  ✏️ Editar
                </button>
              )}
            </div>

            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    value={medico.nome}
                    onChange={(e) => setMedico(prev => ({ ...prev, nome: e.target.value }))}
                    disabled={!editando}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={medico.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>O email não pode ser alterado</small>
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    value={medico.telefone}
                    onChange={(e) => setMedico(prev => ({ ...prev, telefone: e.target.value }))}
                    disabled={!editando}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Especialidade</label>
                  <input
                    type="text"
                    value={medico.especialidade}
                    onChange={(e) => setMedico(prev => ({ ...prev, especialidade: e.target.value }))}
                    disabled={!editando}
                  />
                </div>

                <div className="form-group">
                  <label>CRM</label>
                  <input
                    type="text"
                    value={medico.crm}
                    onChange={(e) => setMedico(prev => ({ ...prev, crm: e.target.value }))}
                    disabled={!editando}
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

              {editando && (
                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSalvarPerfil}
                    disabled={salvando}
                  >
                    {salvando ? '💾 Salvando...' : '💾 Salvar Alterações'}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setEditando(false);
                      loadPerfil(); // Recarregar dados originais
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Horários de Atendimento */}
          <div className="perfil-card">
            <div className="card-header">
              <h2>🕒 Horários de Atendimento</h2>
            </div>

            <div className="card-body">
              <div className="horarios-section">
                <p className="section-description">
                  Configure os dias e horários em que você atende
                </p>

                <div className="dias-atendimento-grid">
                  {diasSemana.map((dia, index) => {
                    const diaAtendimento = medico.diasAtendimento.find(d => d.diaSemana === dia.key) || { horarios: [] };
                    const ativo = diaAtendimento.horarios.length > 0;

                    return (
                      <div key={dia.key} className="dia-atendimento-card">
                        <div className="dia-header">
                          <label className="dia-checkbox">
                            <input
                              type="checkbox"
                              checked={ativo}
                              onChange={() => handleToggleDiaAtendimento(index)}
                              disabled={!editando}
                            />
                            <span className="dia-nome">{dia.label}</span>
                          </label>
                        </div>

                        {ativo && (
                          <div className="horarios-list">
                            <div className="horarios-header">
                              <span>Horários</span>
                              {editando && (
                                <button
                                  type="button"
                                  className="btn-add-horario"
                                  onClick={() => handleAdicionarHorario(index)}
                                >
                                  + Add Horário
                                </button>
                              )}
                            </div>

                            {diaAtendimento.horarios.map((horario, horarioIndex) => (
                              <div key={horarioIndex} className="horario-item">
                                <input
                                  type="time"
                                  value={horario}
                                  onChange={(e) => handleHorarioChange(index, horarioIndex, e.target.value)}
                                  disabled={!editando}
                                  className="time-input"
                                />
                                {editando && diaAtendimento.horarios.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn-remove-horario"
                                    onClick={() => handleRemoverHorario(index, horarioIndex)}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Ações de Segurança */}
          <div className="perfil-card">
            <div className="card-header">
              <h2>🔒 Segurança</h2>
            </div>

            <div className="card-body">
              <div className="security-actions">
                <div className="security-item">
                  <div className="security-info">
                    <h4>Alterar Senha</h4>
                    <p>Atualize sua senha de acesso ao sistema</p>
                  </div>
                  <button
                    className="btn btn-warning"
                    onClick={() => setShowSenhaModal(true)}
                  >
                    🔑 Alterar Senha
                  </button>
                </div>

                {/* ✅ REMOVIDO: Sessões Ativas - Não é necessário no momento */}
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <div className="senha-form">
                <div className="form-group">
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    value={senhaForm.senhaAtual}
                    onChange={(e) => setSenhaForm(prev => ({ ...prev, senhaAtual: e.target.value }))}
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div className="form-group">
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    value={senhaForm.novaSenha}
                    onChange={(e) => setSenhaForm(prev => ({ ...prev, novaSenha: e.target.value }))}
                    placeholder="Digite a nova senha"
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={senhaForm.confirmarSenha}
                    onChange={(e) => setSenhaForm(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                    placeholder="Confirme a nova senha"
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleAlterarSenha}
                    disabled={salvando}
                  >
                    {salvando ? '💾 Alterando...' : '💾 Alterar Senha'}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowSenhaModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilMedico;