import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { medicoService } from '../services/medicoService';
import { usuarioService } from '../services/usuarioService';
import './AdminDashboard.css';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('medicos');
  const [medicos, setMedicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    especialidade: '',
    crm: '',
    consultorio: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, [activeTab]);

  const checkAdminAccess = () => {
    const user = authService.getCurrentUser();
    if (!user || user.tipo !== 'admin') {
      navigate('/unauthorized');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'medicos') {
        // Implementar endpoint para buscar médicos no backend
        const medicosData = await medicoService.getMedicos();
        setMedicos(medicosData);
      } else if (activeTab === 'usuarios') {
        // Implementar endpoint para buscar usuários
        // const usuariosData = await usuarioService.getUsuarios();
        // setUsuarios(usuariosData);
      }
    } catch (error) {
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMedico = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Primeiro criar usuário, depois médico
      const usuarioData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha,
        tipo: 'medico'
      };

      // Implementar criação de médico no backend
      alert('Funcionalidade de criar médico será implementada');
      setShowModal(false);
      setFormData({
        nome: '', email: '', telefone: '', senha: '', especialidade: '', crm: '', consultorio: ''
      });
      loadData();
    } catch (error) {
      alert('Erro ao criar médico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <button className="back-button" onClick={() => navigate('/dashboard-medico')}>
          ← Voltar
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'medicos' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicos')}
        >
          👨‍⚕️ Gerenciar Médicos
        </button>
        <button 
          className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Gerenciar Usuários
        </button>
        <button 
          className={`tab-button ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab('relatorios')}
        >
          📊 Relatórios
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'medicos' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Gerenciar Médicos</h2>
              <button 
                className="primary-button"
                onClick={() => setShowModal(true)}
              >
                ➕ Adicionar Médico
              </button>
            </div>

            {medicos.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum médico cadastrado</p>
              </div>
            ) : (
              <div className="medicos-grid">
                {medicos.map(medico => (
                  <div key={medico._id} className="medico-card">
                    <h3>{medico.usuario?.nome}</h3>
                    <p><strong>Especialidade:</strong> {medico.especialidade}</p>
                    <p><strong>CRM:</strong> {medico.crm}</p>
                    <p><strong>Consultório:</strong> {medico.consultorio || 'Não informado'}</p>
                    <p><strong>Status:</strong> {medico.ativo ? 'Ativo' : 'Inativo'}</p>
                    <div className="card-actions">
                      <button className="btn-secondary">Editar</button>
                      <button className="btn-danger">
                        {medico.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="tab-content">
            <h2>Gerenciar Usuários</h2>
            <p>Funcionalidade em desenvolvimento</p>
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div className="tab-content">
            <h2>Relatórios</h2>
            <p>Funcionalidade em desenvolvimento</p>
          </div>
        )}
      </div>

      {/* Modal Criar Médico */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cadastrar Novo Médico</h3>
            <form onSubmit={handleCreateMedico}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({...prev, telefone: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Senha *</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({...prev, senha: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Especialidade *</label>
                  <select
                    value={formData.especialidade}
                    onChange={(e) => setFormData(prev => ({...prev, especialidade: e.target.value}))}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Ginecologista">Ginecologista</option>
                    <option value="Ortopedista">Ortopedista</option>
                    <option value="Endocrinologista">Endocrinologista</option>
                    <option value="Geriatra">Geriatra</option>
                    <option value="Psiquiatra">Psiquiatra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>CRM *</label>
                  <input
                    type="text"
                    value={formData.crm}
                    onChange={(e) => setFormData(prev => ({...prev, crm: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Consultório</label>
                  <input
                    type="text"
                    value={formData.consultorio}
                    onChange={(e) => setFormData(prev => ({...prev, consultorio: e.target.value}))}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? 'Cadastrando...' : 'Cadastrar Médico'}
                </button>
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;