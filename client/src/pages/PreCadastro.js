import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nome || !formData.email || !formData.telefone || !formData.senha || !formData.matricula) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleCadastro = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Preparar dados para o backend - CORRIGIDO conforme o backend
      const userData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha,
        matricula: formData.matricula, // Mantém como matricula
        tipo: 'paciente' // Adiciona tipo explicitamente
      };

      // Remove dataNascimento pois não está no modelo do backend
      const result = await authService.registerPaciente(userData);
      
      if (result.success) {
        alert('🎉 Cadastro realizado com sucesso!');
        navigate('/login');
      } else {
        setError(result.message || 'Falha no cadastro. Tente novamente.');
      }
      
    } catch (error) {
      setError(error.message || 'Falha no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
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
          
          {error && (
            <div className="alert-error" style={{
              background: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

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

            {/* REMOVIDO dataNascimento pois não está no modelo do backend */}
            {/* <div className="input-group">
              <label className="input-label">Data de Nascimento *</label>
              <input
                className="input"
                value={formData.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
                type="date"
              />
            </div> */}

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