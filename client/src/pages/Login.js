import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      // Simulação de login
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      setLoading(false);
      alert('Falha no login. Verifique suas credenciais.');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      alert('Por favor, informe seu email');
      return;
    }

    setLoading(true);
    try {
      // Simulação de envio de email
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
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          {/* Header com Logo */}
          <div className="logo-container">
            <div className="logo-circle">
              <span className="logo-text">NAMI</span>
            </div>
            <h1 className="title">NAMI UNIFOR</h1>
            <p className="subtitle">Sistema de Agendamento de Consultas</p>
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

          {/* Formulário de Login */}
          <div className="form-container">
            <h2 className="form-title">Acesse sua Conta</h2>
            
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
                'Entrar na Conta'
              )}
            </button>

            <div className="links-container">
              <button 
                className="link-button"
                onClick={() => setShowForgotPassword(true)}
              >
                🔒 Esqueci minha senha
              </button>
              
              <div className="divider">
                <span>ou</span>
              </div>

              <button 
                className="secondary-button"
                onClick={() => navigate('/cadastro')}
              >
                📝 Criar Nova Conta
              </button>

              <button className="admin-button">
                ⚕️ Área do Médico/Admin
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>Sistema desenvolvido para a UNIFOR</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;