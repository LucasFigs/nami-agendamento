import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './LoginMedicoAdmin.css';

const LoginMedicoAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.loginMedicoAdmin(email, password);
      
      if (result.user) {
        navigate('/dashboard-medico');
      }
    } catch (error) {
      setError(error.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      alert('Por favor, informe seu email');
      return;
    }

    setLoading(true);
    try {
      // Simulação de envio de email (implementar depois)
      setTimeout(() => {
        setLoading(false);
        alert(`Email de redefinição enviado para: ${forgotEmail}`);
        setShowForgotPassword(false);
        setForgotEmail('');
      }, 1500);
      
    } catch (error) {
      setLoading(false);
      alert('Erro ao enviar email de redefinição.');
    }
  };

  return (
    <div className="login-medico-admin-container">
      <div className="login-medico-admin-background">
        <div className="login-medico-admin-content">
          {/* Header com Logo */}
          <div className="logo-container">
            <div className="logo-circle">
              <span className="logo-text">NAMI</span>
            </div>
            <h1 className="title">NAMI UNIFOR</h1>
            <p className="subtitle">Área Médica/Admin</p>
          </div>

          {/* Modal Esqueci Senha */}
          {showForgotPassword && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Redefinir Senha</h3>
                <p>Informe seu email para receber as instruções de redefinição:</p>
                <input
                  className="input"
                  placeholder="Seu email cadastrado"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  type="email"
                />
                <div className="modal-buttons">
                  <button 
                    className="modal-button primary"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar Instruções'}
                  </button>
                  <button 
                    className="modal-button secondary"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulário de Login Médico/Admin */}
          <div className="form-container">
            <h2 className="form-title">Acesso Médico/Admin</h2>
            
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

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="input"
                placeholder="seu.email@unifor.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Senha</label>
              <input
                className="input"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>

            <button 
              className={`login-button ${loading ? 'button-disabled' : ''}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Entrando...
                </>
              ) : (
                'Acessar Área Médica/Admin'
              )}
            </button>

            <div className="links-container">
              <button 
                className="link-button"
                onClick={() => setShowForgotPassword(true)}
              >
                 Esqueci minha senha
              </button>
              
              <div className="divider">
                <span>ou</span>
              </div>

              <button 
                className="secondary-button"
                onClick={() => navigate('/login')}
              >
                 Área do Paciente
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>Sistema desenvolvido para a UNIFOR - Versão Médica/Admin</p>
            <p style={{fontSize: '11px', opacity: 0.7, marginTop: '5px'}}>
              Acesso restrito a profissionais cadastrados pela administração
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginMedicoAdmin;