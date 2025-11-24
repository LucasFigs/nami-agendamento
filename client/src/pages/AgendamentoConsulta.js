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
    // Verificar se veio de um reagendamento
    if (location.state?.reagendamento) {
      console.log('Reagendamento detectado:', location.state);
      setIsReagendamento(true);
      setAgendamentoOriginalId(location.state.agendamentoId);
      
      setFormData(prev => ({
        ...prev,
        especialidade: location.state.especialidadeSelecionada
      }));
      
      // Se tiver médico específico, carregar os médicos dessa especialidade
      if (location.state.medicoSelecionado._id) {
        loadMedicosPorEspecialidade(location.state.especialidadeSelecionada, location.state.medicoSelecionado._id);
      }
    } else if (location.state?.medicoSelecionado && location.state?.especialidadeSelecionada) {
      // Caso venha do método antigo (sem reagendamento flag)
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
        
        // Se veio de reagendamento com médico específico, selecione automaticamente
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
      alert('Erro ao carregar médicos: ' + error.message);
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
      alert('Erro ao carregar especialidades: ' + error.message);
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
      alert('Erro ao carregar horários disponíveis: ' + error.message);
      setHorariosDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.medicoid || !formData.data || !formData.horario) {
      alert('Por favor, preencha todos os campos obrigatórios');
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
        // REAGENDAR: Primeiro cancelar o antigo, depois criar novo
        console.log('Processando reagendamento...');
        await agendamentoService.cancelarAgendamento(agendamentoOriginalId);
        await agendamentoService.criarAgendamento(agendamentoData);
        alert('✅ Consulta reagendada com sucesso!');
      } else {
        // NOVO AGENDAMENTO
        console.log('Criando novo agendamento...');
        await agendamentoService.criarAgendamento(agendamentoData);
        alert('✅ Consulta agendada com sucesso!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      alert('Erro ao agendar consulta: ' + error.message);
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
      <div className="agendamento-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <h1>
          {isReagendamento ? 'Reagendar Consulta' : 'Agendar Nova Consulta'}
        </h1>
      </div>

      <div className="agendamento-content">
        <form onSubmit={handleSubmit} className="agendamento-form">
          {/* Especialidade */}
          <div className="form-group">
            <label className="form-label">Especialidade *</label>
            <select
              className="form-select"
              value={formData.especialidade}
              onChange={(e) => handleChange('especialidade', e.target.value)}
              required
            >
              <option value="">Selecione uma especialidade</option>
              {especialidades.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          {/* Médico */}
          <div className="form-group">
            <label className="form-label">Médico *</label>
            <select
              className="form-select"
              value={formData.medicoid}
              onChange={(e) => handleChange('medicoid', e.target.value)}
              required
              disabled={!formData.especialidade}
            >
              <option value="">Selecione um médico</option>
              {medicos.map(medico => (
                <option key={medico._id} value={medico._id}>
                  {medico.usuario?.nome} - {medico.especialidade}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div className="form-group">
            <label className="form-label">Data da Consulta *</label>
            <input
              type="date"
              className="form-input"
              value={formData.data}
              onChange={(e) => handleChange('data', e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              required
              disabled={!formData.medicoid}
            />
          </div>

          {/* Horário */}
          <div className="form-group">
            <label className="form-label">Horário *</label>
            <select
              className="form-select"
              value={formData.horario}
              onChange={(e) => handleChange('horario', e.target.value)}
              required
              disabled={!formData.data || loading}
            >
              <option value="">Selecione um horário</option>
              {horariosDisponiveis.map(horario => (
                <option key={horario} value={horario}>{horario}</option>
              ))}
            </select>
            {loading && <div className="loading-small">Carregando horários...</div>}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Agendando...' : (isReagendamento ? '✅ Confirmar Reagendamento' : '✅ Confirmar Agendamento')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgendamentoConsulta;