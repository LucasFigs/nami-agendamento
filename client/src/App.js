import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import Login from './pages/Login.js';
import PreCadastro from './pages/PreCadastro.js';
import Dashboard from './pages/Dashboard.js';
import LoginMedicoAdmin from './pages/LoginMedicoAdmin.js';
import DashboardMedico from './pages/DashboardMedico.js';
import AgendamentoConsulta from './pages/AgendamentoConsulta.js';
import Perfil from './pages/Perfil.js';
import HistoricoConsultas from './pages/HistoricoConsultas.js';
import AdminDashboard from './pages/AdminDashboard.js';
import MeusAgendamentos from './pages/MeusAgendamentos.js';

// ✅ IMPORTAR AS NOVAS PÁGINAS DO MÉDICO
import AgendaMedico from './pages/AgendaMedico.js';
import PacientesMedico from './pages/PacientesMedico.js';
import RelatoriosMedico from './pages/RelatoriosMedico.js';
import PerfilMedico from './pages/PerfilMedico.js';

import './App.css';

// Componente de rota protegida
const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const user = authService.getCurrentUser();

  if (!authService.isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<PreCadastro />} />
          <Route path="/login-medico" element={<LoginMedicoAdmin />} />

          {/* Rotas protegidas - Paciente */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedTypes={['paciente']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendamento"
            element={
              <ProtectedRoute allowedTypes={['paciente']}>
                <AgendamentoConsulta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute allowedTypes={['paciente']}>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute allowedTypes={['paciente']}>
                <HistoricoConsultas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute allowedTypes={['paciente']}>
                <MeusAgendamentos />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas - Médico */}
          <Route
            path="/dashboard-medico"
            element={
              <ProtectedRoute allowedTypes={['medico', 'admin']}>
                <DashboardMedico />
              </ProtectedRoute>
            }
          />

          {/* ✅ NOVAS ROTAS PARA MÉDICO */}
          <Route
            path="/agenda-medico"
            element={
              <ProtectedRoute allowedTypes={['medico', 'admin']}>
                <AgendaMedico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes-medico"
            element={
              <ProtectedRoute allowedTypes={['medico', 'admin']}>
                <PacientesMedico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios-medico"
            element={
              <ProtectedRoute allowedTypes={['medico', 'admin']}>
                <RelatoriosMedico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil-medico"
            element={
              <ProtectedRoute allowedTypes={['medico', 'admin']}>
                <PerfilMedico />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota para não autorizado */}
          <Route path="/unauthorized" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #003366 0%, #002244 100%)',
              color: 'white'
            }}>
              <h2>Acesso não autorizado</h2>
              <p>Você não tem permissão para acessar esta página.</p>
              <button
                onClick={() => window.history.back()}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#FFD700',
                  color: '#003366',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Voltar
              </button>
            </div>
          } />

          {/* Rota fallback para páginas não encontradas */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #003366 0%, #002244 100%)',
              color: 'white'
            }}>
              <h2>Página não encontrada</h2>
              <p>A página que você está procurando não existe.</p>
              <button
                onClick={() => window.history.back()}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#FFD700',
                  color: '#003366',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Voltar
              </button>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;