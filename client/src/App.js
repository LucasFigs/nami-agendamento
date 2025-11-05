import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.js';
import PreCadastro from './pages/PreCadastro.js';
import Dashboard from './pages/Dashboard.js';
import LoginMedicoAdmin from './pages/LoginMedicoAdmin.js';
import DashboardMedico from './pages/DashboardMedico.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rotas do Paciente */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<PreCadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rotas do Médico */}
          <Route path="/login-medico" element={<LoginMedicoAdmin />} />
          <Route path="/dashboard-medico" element={<DashboardMedico />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;