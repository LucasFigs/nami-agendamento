import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService';
import { medicoService } from '../services/medicoService';
import './AgendamentoConsulta.css';

const AgendamentoConsulta = () => {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medicoid: '',
    especialidade: '',
    data: '',
    horario: '',
    tipoConsulta: 'presencial',
    observacoes: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [isReagendamento, setIsReagendamento] = useState(false);
  const [agendamentoOriginalId, setAgendamentoOriginalId] = useState(null);

  useEffect(() => {
    if (location.state?.reagendamento) {
      console.log('Reagendamento detectado:', location.state);
      setIsReagendamento(true);
      setAgendamentoOriginalId(location.state.agendamentoId);
      
      setFormData(prev => ({
        ...prev,
        especialidade: location.state.especialidadeSelecionada
      }));
      
      if (location.state.medicoSelecionado._id) {
        loadMedicosPorEspecialidade(location.state.especialidadeSelecionada, location.state.medicoSelecionado._id);
      }
    } else if (location.state?.medicoSelecionado && location.state?.especialidadeSelecionada) {
      console.log('Dados do médico pré-selecionado:', location.state);
      setFormData(prev => ({
        ...prev,
        especialidade: location.state.especialidadeSelecionada
      }));
      
      if (location.state.medicoSelecionado._id) {
        loadMedicosPorEspecialidade(location.state.especialidadeSelecionada, location.state.medicoSelecionado._id);
      }
    }
    
    loadEspecialidades();
  }, [location.state]);

  useEffect(() => {
    if (formData.especialidade) {
      loadMedicosPorEspecialidade(formData.especialidade);
    }
  }, [formData.especialidade]);

  useEffect(() => {
    if (formData.medicoid && formData.data) {
      loadHorariosDisponiveis();
    }
  }, [formData.medicoid, formData.data]);

  const loadMedicosPorEspecialidade = async (especialidade, medicoIdEspecifico = null) => {
    try {
      const medicosData = await medicoService.getMedicosPorEspecialidade(especialidade);
      console.log('Médicos por especialidade:', medicosData);
      
      if (medicosData && Array.isArray(medicosData)) {
        setMedicos(medicosData);
        
        if (medicoIdEspecifico && medicosData.some(m => m._id === medicoIdEspecifico)) {
          setFormData(prev => ({
            ...prev,
            medicoid: medicoIdEspecifico
          }));
        }
      } else {
        throw new Error('Nenhum médico encontrado para esta especialidade');
      }
    } catch (error) {
      alert('❌ Erro ao carregar médicos: ' + error.message);
    }
  };

  const loadEspecialidades = async () => {
    try {
      const medicosData = await medicoService.getMedicos();
      console.log('Médicos carregados:', medicosData);
      
      if (medicosData && Array.isArray(medicosData)) {
        const especialidadesUnicas = [...new Set(medicosData.map(m => m.especialidade))];
        setEspecialidades(especialidadesUnicas);
      } else {
        throw new Error('Nenhum médico disponível');
      }
    } catch (error) {
      alert('❌ Erro ao carregar especialidades: ' + error.message);
    }
  };

  const loadHorariosDisponiveis = async () => {
    try {
      setLoading(true);
      const horarios = await medicoService.getHorariosDisponiveis(formData.medicoid, formData.data);
      console.log('Horários disponíveis:', horarios);
      setHorariosDisponiveis(horarios || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      alert('❌ Erro ao carregar horários disponíveis: ' + error.message);
      setHorariosDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.medicoid || !formData.data || !formData.horario) {
      alert('⚠️ Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const agendamentoData = {
        medicoid: formData.medicoid,
        data: formData.data,
        horario: formData.horario
      };

      if (isReagendamento && agendamentoOriginalId) {
        console.log('🔄 Processando reagendamento...');
        await agendamentoService.cancelarAgendamento(agendamentoOriginalId);
        await agendamentoService.criarAgendamento(agendamentoData);
        alert('✅ Consulta reagendada com sucesso!');
      } else {
        console.log('📅 Criando novo agendamento...');
        await agendamentoService.criarAgendamento(agendamentoData);
        alert('✅ Consulta agendada com sucesso!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      alert('❌ Erro ao agendar consulta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'especialidade' && { medicoid: '', data: '', horario: '' }),
      ...(field === 'medicoid' && { data: '', horario: '' }),
      ...(field === 'data' && { horario: '' })
    }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="agendamento-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>
              {isReagendamento ? '🔄 Reagendar Consulta' : '📅 Agendar Nova Consulta'}
            </h1>
            <p>
              {isReagendamento 
                ? 'Escolha uma nova data e horário para sua consulta' 
                : 'Selecione especialidade, médico e horário disponível'
              }
            </p>
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
          <div className="section-header">
            <h2>📋 Formulário de Agendamento</h2>
            <div className="step-indicator">
              <span className="step active">1. Especialidade</span>
              <span className={`step ${formData.especialidade ? 'active' : ''}`}>2. Médico</span>
              <span className={`step ${formData.medicoid ? 'active' : ''}`}>3. Data</span>
              <span className={`step ${formData.data ? 'active' : ''}`}>4. Horário</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
              {/* Especialidade */}
              <div className="form-group">
                <label>Especialidade *</label>
                <select
                  value={formData.especialidade}
                  onChange={(e) => handleChange('especialidade', e.target.value)}
                  required
                >
                  <option value="">Selecione uma especialidade</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>
                      {esp === 'Ginecologista' && '👩‍⚕️ '}
                      {esp === 'Ortopedista' && '🦴 '}
                      {esp === 'Endocrinologista' && '⚖️ '}
                      {esp === 'Geriatra' && '👵 '}
                      {esp === 'Psiquiatra' && '🧠 '}
                      {esp === 'Cardiologista' && '❤️ '}
                      {esp === 'Dermatologista' && '🔬 '}
                      {esp === 'Pediatra' && '👶 '}
                      {esp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Médico */}
              <div className="form-group">
                <label>Médico *</label>
                <select
                  value={formData.medicoid}
                  onChange={(e) => handleChange('medicoid', e.target.value)}
                  required
                  disabled={!formData.especialidade}
                >
                  <option value="">Selecione um médico</option>
                  {medicos.map(medico => (
                    <option key={medico._id} value={medico._id}>
                      👨‍⚕️ {medico.usuario?.nome} - {medico.especialidade}
                      {medico.consultorio && ` (${medico.consultorio})`}
                    </option>
                  ))}
                </select>
                {!formData.especialidade && (
                  <div className="form-hint">ⓘ Selecione primeiro uma especialidade</div>
                )}
              </div>

              {/* Data */}
              <div className="form-group">
                <label>Data da Consulta *</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleChange('data', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                  disabled={!formData.medicoid}
                />
                {!formData.medicoid && (
                  <div className="form-hint">ⓘ Selecione primeiro um médico</div>
                )}
              </div>

              {/* Horário */}
              <div className="form-group">
                <label>Horário *</label>
                <select
                  value={formData.horario}
                  onChange={(e) => handleChange('horario', e.target.value)}
                  required
                  disabled={!formData.data || loading}
                >
                  <option value="">Selecione um horário</option>
                  {horariosDisponiveis.map(horario => (
                    <option key={horario} value={horario}>
                      ⏰ {horario}
                    </option>
                  ))}
                </select>
                {loading && (
                  <div className="loading-indicator">
                    <div className="loading-spinner-small"></div>
                    Carregando horários disponíveis...
                  </div>
                )}
                {!formData.data && !loading && (
                  <div className="form-hint">ⓘ Selecione primeiro uma data</div>
                )}
                {formData.data && horariosDisponiveis.length === 0 && !loading && (
                  <div className="form-warning">
                    ⚠️ Nenhum horário disponível para esta data
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Agendamento */}
            {(formData.especialidade || formData.medicoid || formData.data || formData.horario) && (
              <div className="agendamento-summary">
                <h4>📝 Resumo do Agendamento</h4>
                <div className="summary-grid">
                  {formData.especialidade && (
                    <div className="summary-item">
                      <span className="summary-label">Especialidade:</span>
                      <span className="summary-value">{formData.especialidade}</span>
                    </div>
                  )}
                  {formData.medicoid && medicos.find(m => m._id === formData.medicoid) && (
                    <div className="summary-item">
                      <span className="summary-label">Médico:</span>
                      <span className="summary-value">
                        {medicos.find(m => m._id === formData.medicoid)?.usuario?.nome}
                      </span>
                    </div>
                  )}
                  {formData.data && (
                    <div className="summary-item">
                      <span className="summary-label">Data:</span>
                      <span className="summary-value">
                        {new Date(formData.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {formData.horario && (
                    <div className="summary-item">
                      <span className="summary-label">Horário:</span>
                      <span className="summary-value">{formData.horario}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !formData.horario}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Processando...
                  </>
                ) : isReagendamento ? (
                  '🔄 Confirmar Reagendamento'
                ) : (
                  '✅ Confirmar Agendamento'
                )}
              </button>
              <button 
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AgendamentoConsulta;