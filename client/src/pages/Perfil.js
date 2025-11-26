import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { authService } from '../services/authService';
import './Perfil.css';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dados');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await usuarioService.getMeusDados();
      setUser(userData);
      setFormData({
        nome: userData.nome || '',
        email: userData.email || '',
        telefone: userData.telefone || ''
      });
    } catch (error) {
      alert('❌ Erro ao carregar dados do usuário: ' + error.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usuarioService.atualizarPerfil(formData);
      alert('✅ Perfil atualizado com sucesso!');
      
      // Atualizar dados no localStorage
      const currentUser = authService.getCurrentUser();
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      alert('❌ Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      alert('⚠️ As novas senhas não coincidem');
      return;
    }

    if (senhaForm.novaSenha.length < 6) {
      alert('⚠️ A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await usuarioService.alterarSenha(senhaForm.senhaAtual, senhaForm.novaSenha);
      alert('✅ Senha alterada com sucesso!');
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (error) {
      alert('❌ Erro ao alterar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="perfil-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>👤 Meu Perfil</h1>
            <p>Gerencie suas informações pessoais e segurança</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="content-section">
          {/* Tabs de Navegação */}
          <nav className="perfil-nav">
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'dados' ? 'active' : ''}`}
                onClick={() => setActiveTab('dados')}
              >
                <span className="tab-icon">📋</span>
                <span className="tab-label">Dados Pessoais</span>
              </button>
              <button
                className={`nav-tab ${activeTab === 'senha' ? 'active' : ''}`}
                onClick={() => setActiveTab('senha')}
              >
                <span className="tab-icon">🔒</span>
                <span className="tab-label">Alterar Senha</span>
              </button>
            </div>
          </nav>

          {/* Conteúdo das Tabs */}
          <div className="tab-content">
            {/* Tab: Dados Pessoais */}
            {activeTab === 'dados' && (
              <div className="tab-pane">
                <div className="section-header">
                  <h2>📋 Informações Pessoais</h2>
                  <p>Atualize seus dados de contato e informações pessoais</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          nome: e.target.value
                        }))}
                        required
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        required
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          telefone: e.target.value
                        }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="loading-spinner-small"></div>
                          Salvando...
                        </>
                      ) : (
                        '💾 Salvar Alterações'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => loadUserData()}
                    >
                      🔄 Descartar Alterações
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: Alterar Senha */}
            {activeTab === 'senha' && (
              <div className="tab-pane">
                <div className="section-header">
                  <h2>🔒 Alteração de Senha</h2>
                  <p>Proteja sua conta com uma senha segura e atualizada</p>
                </div>

                <form onSubmit={handleChangePassword} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Senha Atual *</label>
                      <input
                        type="password"
                        value={senhaForm.senhaAtual}
                        onChange={(e) => setSenhaForm(prev => ({
                          ...prev,
                          senhaAtual: e.target.value
                        }))}
                        required
                        placeholder="Digite sua senha atual"
                      />
                    </div>

                    <div className="form-group">
                      <label>Nova Senha *</label>
                      <input
                        type="password"
                        value={senhaForm.novaSenha}
                        onChange={(e) => setSenhaForm(prev => ({
                          ...prev,
                          novaSenha: e.target.value
                        }))}
                        required
                        placeholder="Mínimo 6 caracteres"
                        minLength="6"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirmar Nova Senha *</label>
                      <input
                        type="password"
                        value={senhaForm.confirmarSenha}
                        onChange={(e) => setSenhaForm(prev => ({
                          ...prev,
                          confirmarSenha: e.target.value
                        }))}
                        required
                        placeholder="Digite a nova senha novamente"
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
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
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
                      onClick={() => setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })}
                    >
                      🔄 Limpar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Seção de Logout */}
          <div className="logout-section">
            <div className="section-header">
              <h2>🚪 Sair da Conta</h2>
              <p>Encerre sua sessão atual no sistema</p>
            </div>
            <div className="logout-actions">
              <button className="btn btn-danger" onClick={handleLogout}>
                🚪 Sair da Conta
              </button>
              <p className="logout-warning">
                ⚠️ Você será redirecionado para a página de login
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;