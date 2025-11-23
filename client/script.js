import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamento.css';

const Agendamento = () => {
  const [step, setStep] = useState(1);
  const [agendamentoData, setAgendamentoData] = useState({
    especialidade: '',
    medico: '',
    data: '',
    horario: '',
    tipoConsulta: 'primeira-vez'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Dados mockados - substituir por API
  const especialidades = [
    'Cardiologia', 'Dermatologia', 'Endocrinologia', 
    'Ginecologia', 'Ortopedia', 'Pediatria', 'Psiquiatria'
  ];

  const medicos = {
    'Cardiologia': [
      { id: 1, nome: 'Dr. João Silva', CRM: '12345', foto: '👨‍⚕️' },
      { id: 2, nome: 'Dra. Maria Santos', CRM: '67890', foto: '👩‍⚕️' }
    ],
    'Dermatologia': [
      { id: 3, nome: 'Dr. Carlos Oliveira', CRM: '54321', foto: '👨‍⚕️' }
    ],
    'Endocrinologia': [
      { id: 4, nome: 'Dra. Ana Costa', CRM: '09876', foto: '👩‍⚕️' }
    ]
  };

  const horariosDisponiveis = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleInputChange = (field, value) => {
    setAgendamentoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleAgendar = async () => {
    setLoading(true);
    
    // Simulação de agendamento
    setTimeout(() => {
      setLoading(false);
      alert('✅ Consulta agendada com sucesso!');
      navigate('/dashboard');
    }, 2000);
  };

  // Passo 1: Escolher Especialidade
  const renderStep1 = () => (
    <div className="step-container">
      <h2>Escolha a Especialidade</h2>
      <p>Selecione a especialidade médica desejada</p>
      
      <div className="options-grid">
        {especialidades.map(especialidade => (
          <div
            key={especialidade}
            className={`option-card ${agendamentoData.especialidade === especialidade ? 'selected' : ''}`}
            onClick={() => {
              handleInputChange('especialidade', especialidade);
              handleInputChange('medico', ''); // Reset médico
              setTimeout(nextStep, 500);
            }}
          >
            <div className="option-icon">🏥</div>
            <div className="option-text">
              <h3>{especialidade}</h3>
              <p>Agendar consulta</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Passo 2: Escolher Médico
  const renderStep2 = () => (
    <div className="step-container">
      <h2>Escolha o Médico</h2>
      <p>Selecione o profissional da especialidade de {agendamentoData.especialidade}</p>
      
      <div className="medicos-list">
        {medicos[agendamentoData.especialidade]?.map(medico => (
          <div
            key={medico.id}
            className={`medico-card ${agendamentoData.medico === medico.nome ? 'selected' : ''}`}
            onClick={() => {
              handleInputChange('medico', medico.nome);
              setTimeout(nextStep, 500);
            }}
          >
            <div className="medico-foto">{medico.foto}</div>
            <div className="medico-info">
              <h3>{medico.nome}</h3>
              <p>CRM: {medico.CRM}</p>
              <p>{agendamentoData.especialidade}</p>
            </div>
            <div className="medico-avaliacao">
              <span className="estrelas">⭐⭐⭐⭐⭐</span>
              <span className="avaliacao-text">(4.8)</span>
            </div>
          </div>
        ))}
      </div>

      <button className="back-button" onClick={prevStep}>
        ← Voltar
      </button>
    </div>
  );

  // Passo 3: Escolher Data e Horário
  const renderStep3 = () => (
    <div className="step-container">
      <h2>Escolha Data e Horário</h2>
      <p>Selecione quando deseja ser atendido</p>
      
      <div className="datetime-selection">
        <div className="date-section">
          <h3>Data da Consulta</h3>
          <input
            type="date"
            className="date-input"
            value={agendamentoData.data}
            onChange={(e) => handleInputChange('data', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="time-section">
          <h3>Horários Disponíveis</h3>
          <div className="horarios-grid">
            {horariosDisponiveis.map(horario => (
              <button
                key={horario}
                className={`horario-btn ${agendamentoData.horario === horario ? 'selected' : ''}`}
                onClick={() => handleInputChange('horario', horario)}
              >
                {horario}
              </button>
            ))}
          </div>
        </div>

        <div className="tipo-consulta">
          <h3>Tipo de Consulta</h3>
          <select
            value={agendamentoData.tipoConsulta}
            onChange={(e) => handleInputChange('tipoConsulta', e.target.value)}
            className="consulta-select"
          >
            <option value="primeira-vez">Primeira Consulta</option>
            <option value="retorno">Consulta de Retorno</option>
            <option value="acompanhamento">Acompanhamento</option>
            <option value="exame">Exame/Procedimento</option>
          </select>
        </div>
      </div>

      <div className="step-actions">
        <button className="back-button" onClick={prevStep}>
          ← Voltar
        </button>
        <button 
          className="continue-button"
          onClick={nextStep}
          disabled={!agendamentoData.data || !agendamentoData.horario}
        >
          Continuar →
        </button>
      </div>
    </div>
  );

  // Passo 4: Confirmação
  const renderStep4 = () => (
    <div className="step-container">
      <h2>Confirmação do Agendamento</h2>
      <p>Revise os dados antes de confirmar</p>
      
      <div className="resumo-agendamento">
        <div className="resumo-item">
          <span className="resumo-label">Médico:</span>
          <span className="resumo-value">{agendamentoData.medico}</span>
        </div>
        <div className="resumo-item">
          <span className="resumo-label">Especialidade:</span>
          <span className="resumo-value">{agendamentoData.especialidade}</span>
        </div>
        <div className="resumo-item">
          <span className="resumo-label">Data:</span>
          <span className="resumo-value">
            {new Date(agendamentoData.data).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <div className="resumo-item">
          <span className="resumo-label">Horário:</span>
          <span className="resumo-value">{agendamentoData.horario}</span>
        </div>
        <div className="resumo-item">
          <span className="resumo-label">Tipo:</span>
          <span className="resumo-value">
            {agendamentoData.tipoConsulta === 'primeira-vez' && 'Primeira Consulta'}
            {agendamentoData.tipoConsulta === 'retorno' && 'Consulta de Retorno'}
            {agendamentoData.tipoConsulta === 'acompanhamento' && 'Acompanhamento'}
            {agendamentoData.tipoConsulta === 'exame' && 'Exame/Procedimento'}
          </span>
        </div>
        <div className="resumo-item">
          <span className="resumo-label">Local:</span>
          <span className="resumo-value">Ambulatório UNIFOR - Bloco A</span>
        </div>
      </div>

      <div className="confirmacao-extra">
        <label className="checkbox-label">
          <input type="checkbox" />
          <span className="checkmark"></span>
          Desejo receber lembrete por SMS
        </label>
        
        <label className="checkbox-label">
          <input type="checkbox" />
          <span className="checkmark"></span>
          Confirmo que li os termos de agendamento
        </label>
      </div>

      <div className="step-actions">
        <button className="back-button" onClick={prevStep}>
          ← Corrigir Dados
        </button>
        <button 
          className="confirm-button"
          onClick={handleAgendar}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Agendando...
            </>
          ) : (
            '✅ Confirmar Agendamento'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="agendamento-container">
      <div className="agendamento-header">
        <button className="back-home" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <h1>Agendar Consulta</h1>
        <div className="step-indicator">
          <span className={`step ${step >= 1 ? 'active' : ''}`}>1</span>
          <span className={`step ${step >= 2 ? 'active' : ''}`}>2</span>
          <span className={`step ${step >= 3 ? 'active' : ''}`}>3</span>
          <span className={`step ${step >= 4 ? 'active' : ''}`}>4</span>
        </div>
      </div>

      <div className="agendamento-content">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default Agendamento;