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
    // REMOVIDOS: dataNascimento e endereco
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
        // REMOVIDOS: dataNascimento e endereco
      });
    } catch (error) {
      alert('Erro ao carregar dados do usuário: ' + error.message);
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
      alert('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      alert('As novas senhas não coincidem');
      return;
    }

    if (senhaForm.novaSenha.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await usuarioService.alterarSenha(senhaForm.senhaAtual, senhaForm.novaSenha);
      alert('✅ Senha alterada com sucesso!');
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (error) {
      alert('Erro ao alterar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <h1>Meu Perfil</h1>
      </div>

      <div className="perfil-content">
        <div className="perfil-tabs">
          <button 
            className={`tab-button ${activeTab === 'dados' ? 'active' : ''}`}
            onClick={() => setActiveTab('dados')}
          >
            📋 Dados Pessoais
          </button>
          <button 
            className={`tab-button ${activeTab === 'senha' ? 'active' : ''}`}
            onClick={() => setActiveTab('senha')}
          >
            🔒 Alterar Senha
          </button>
        </div>

        {activeTab === 'dados' && (
          <form onSubmit={handleUpdateProfile} className="perfil-form">
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
                />
              </div>
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Salvando...' : '💾 Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'senha' && (
          <form onSubmit={handleChangePassword} className="senha-form">
            <div className="form-group">
              <label>Senha Atual</label>
              <input
                type="password"
                value={senhaForm.senhaAtual}
                onChange={(e) => setSenhaForm(prev => ({
                  ...prev,
                  senhaAtual: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Nova Senha</label>
              <input
                type="password"
                value={senhaForm.novaSenha}
                onChange={(e) => setSenhaForm(prev => ({
                  ...prev,
                  novaSenha: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Nova Senha</label>
              <input
                type="password"
                value={senhaForm.confirmarSenha}
                onChange={(e) => setSenhaForm(prev => ({
                  ...prev,
                  confirmarSenha: e.target.value
                }))}
                required
              />
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Alterando...' : '🔒 Alterar Senha'}
            </button>
          </form>
        )}

        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            🚪 Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;