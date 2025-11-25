import api from './api';

export const agendamentoService = {
  // Buscar agendamentos do paciente
  async getAgendamentosPaciente() {
    try {
      const response = await api.get('/agendamentos/paciente');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar agendamentos' };
    }
  },

  // Buscar agendamentos do médico
async getAgendamentosMedico() {
  try {
    const response = await api.get('/agendamentos/medico');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar agendamentos do médico' };
  }
},

// Buscar todos os agendamentos (apenas admin)
// No client/src/services/agendamentoService.js, verifique se a função existe:

// Buscar todos os agendamentos (apenas admin)
async getTodosAgendamentos() {
  try {
    const response = await api.get('/agendamentos/todos');
    return response.data; // ← Deve retornar array diretamente
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar todos os agendamentos' };
  }
},

  // Criar novo agendamento
  async criarAgendamento(agendamentoData) {
    try {
      const response = await api.post('/agendamentos', agendamentoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar agendamento' };
    }
  },

  // Cancelar agendamento
  async cancelarAgendamento(id) {
    try {
      const response = await api.put(`/agendamentos/${id}/cancelar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao cancelar agendamento' };
    }
  },

  // Confirmar agendamento (médico)
  async confirmarAgendamento(id) {
    try {
      const response = await api.put(`/agendamentos/${id}/confirmar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao confirmar agendamento' };
    }
  },

  // Finalizar agendamento (médico)
  async finalizarAgendamento(id) {
    try {
      const response = await api.put(`/agendamentos/${id}/finalizar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao finalizar agendamento' };
    }
  },

  
async reagendarAgendamento(agendamentoId, novaData, novoHorario) {
  try {
    const response = await api.put(`/agendamentos/${agendamentoId}/reagendar`, {
      data: novaData,
      horario: novoHorario
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao reagendar agendamento' };
  }
},

};