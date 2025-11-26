import api from './api';

export const medicoService = {
  // Buscar todos os médicos - CORRIGIDO
  async getMedicos() {
    try {
      const response = await api.get('/medicos');
      return response.data.data; // Acessa response.data.data
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar médicos' };
    }
  },

  async getMeusDados() {
    try {
      console.log('Buscando dados do médico logado...');
      const response = await api.get('/medicos/meus-dados');
      return response.data.data; // Acessa response.data.data
    } catch (error) {
      console.error('Erro ao buscar dados do médico:', error);
      throw error.response?.data || { message: 'Erro ao buscar dados do médico' };
    }
  },

  // Buscar médicos por especialidade - CORRIGIDO
  async getMedicosPorEspecialidade(especialidade) {
    try {
      const response = await api.get(`/medicos/especialidade/${especialidade}`);
      return response.data.data; // Acessa response.data.data
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar médicos por especialidade' };
    }
  },

  // Buscar horários disponíveis
  async getHorariosDisponiveis(medicoId, data) {
    try {
      const response = await api.get(`/medicos/${medicoId}/horarios-disponiveis?data=${data}`);
      console.log('Resposta COMPLETA:', response);

      return response.data.data.horariosDisponiveis;

    } catch (error) {
      console.error('Erro detalhado:', error.response?.data);
      throw error.response?.data || { message: 'Erro ao buscar horários disponíveis' };
    }
  },

  // Criar médico completo
  async criarMedicoCompleto(dados) {
    try {
      const response = await api.post('/medicos/completo', dados);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar médico' };
    }
  },

  // Ativar/desativar médico
  async toggleMedicoStatus(medicoId) {
    try {
      const response = await api.put(`/medicos/${medicoId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao alterar status do médico' };
    }
  },
  // Criar médico completo
  async criarMedicoCompleto(dados) {
    try {
      const response = await api.post('/medicos/completo', dados);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar médico' };
    }
  },

  // Ativar/desativar médico
  async toggleMedicoStatus(medicoId) {
    try {
      const response = await api.put(`/medicos/${medicoId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao alterar status do médico' };
    }
  },

  // Atualizar médico
  async atualizarMedico(medicoId, dados) {
    try {
      const response = await api.put(`/medicos/${medicoId}`, dados);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar médico' };
    }
  },

  async atualizarMeuPerfil(dados) {
    try {
      console.log('📤 Enviando atualização do próprio perfil:', dados);
      const response = await api.put('/medicos/meu-perfil', dados);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar próprio perfil:', error);
      throw error.response?.data || { message: 'Erro ao atualizar perfil' };
    }
  },

  // Buscar médico por ID
  async getMedicoById(medicoId) {
    try {
      const response = await api.get(`/medicos/${medicoId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar médico' };
    }
  }
};