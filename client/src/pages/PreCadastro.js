import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreCadastro.css';

const PreCadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nome || !formData.matricula || !formData.email || !formData.telefone || !formData.senha) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem');
      return false;
    }

    if (formData.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleCadastro = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulação de cadastro
      setTimeout(() => {
        setLoading(false);
        alert('🎉 Cadastro realizado com sucesso!');
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      setLoading(false);
      alert('Falha no cadastro. Tente novamente.');
    }
  };

  return (
    <div className="pre-cadastro-container">
      <div className="pre-cadastro-background">
        <div className="pre-cadastro-content">
          <div className="header-section">
            <button 
              className="back-button"
              onClick={() => navigate('/login')}
            >
              ← Voltar
            </button>
            <div className="logo-small">
              <div className="logo-circle-small">NAMI</div>
            </div>
          </div>

          <h1 className="title">Criar Nova Conta</h1>
          <p className="subtitle">Preencha seus dados para se cadastrar no sistema</p>
          
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Nome Completo *</label>
              <input
                className="input"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Matrícula/RA UNIFOR *</label>
              <input
                className="input"
                placeholder="Sua matrícula na UNIFOR"
                value={formData.matricula}
                onChange={(e) => handleChange('matricula', e.target.value)}
                type="text"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Data de Nascimento *</label>
              <input
                className="input"
                value={formData.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
                type="date"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email *</label>
              <input
                className="input"
                placeholder="seu.email@unifor.br"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                type="email"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Telefone/Celular *</label>
              <input
                className="input"
                placeholder="(85) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                type="tel"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Senha *</label>
              <input
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                type="password"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirmar Senha *</label>
              <input
                className="input"
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                type="password"
              />
            </div>
          </div>

          <button 
            className={`cadastro-button ${loading ? 'button-disabled' : ''}`}
            onClick={handleCadastro}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Criando Conta...
              </>
            ) : (
              '📝 Criar Minha Conta'
            )}
          </button>

          <div className="login-link">
            <span>Já tem uma conta? </span>
            <button 
              className="link-button"
              onClick={() => navigate('/login')}
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreCadastro;