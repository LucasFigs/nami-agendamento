// services/agendamentoService.js (Corrigido)
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

  // Buscar agendamentos do médico (rota antiga - manter para compatibilidade)
  async getAgendamentosMedico() {
    try {
      const response = await api.get('/agendamentos/medico');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar agendamentos do médico' };
    }
  },

  // ✅ BUSCAR AGENDAMENTOS DO MÉDICO LOGADO (nova rota completa)
  async getMeusAgendamentos() {
    try {
      console.log('Buscando agendamentos do médico...');
      const response = await api.get('/agendamentos/medico/meus-agendamentos');
      console.log('Resposta dos agendamentos do médico:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Erro detalhado ao buscar agendamentos do médico:', error);
      
      // Fallback para rota antiga se a nova não existir
      if (error.response?.status === 404) {
        console.log('Tentando rota alternativa /agendamentos/medico...');
        try {
          const responseAlt = await api.get('/agendamentos/medico');
          return responseAlt.data.data || responseAlt.data;
        } catch (altError) {
          console.error('Erro na rota alternativa:', altError);
        }
      }
      
      throw error.response?.data || { message: 'Erro ao buscar agendamentos do médico' };
    }
  },

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

  // Cancelar agendamento (admin - pode cancelar qualquer um)
  async cancelarAgendamentoAdmin(id) {
    try {
      const response = await api.put(`/agendamentos/${id}/cancelar-admin`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao cancelar agendamento' };
    }
  },

  // Buscar relatórios
  async getRelatorios(periodo = '30dias') {
    try {
      const response = await api.get(`/agendamentos/relatorios?periodo=${periodo}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar relatórios' };
    }
  },

  // Buscar estatísticas de status
  async getEstatisticasStatus(periodo = '30dias') {
    try {
      const response = await api.get(`/agendamentos/estatisticas-status?periodo=${periodo}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar estatísticas de status' };
    }
  },

  // ✅ ADICIONAR OBSERVAÇÕES
  async adicionarObservacoes(agendamentoId, observacoes) {
    try {
      const response = await api.put(`/agendamentos/${agendamentoId}/observacoes`, {
        observacoes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao adicionar observações' };
    }
  },

  // ✅ MARCAR COMO REALIZADO
  async marcarComoRealizado(agendamentoId) {
    try {
      const response = await api.put(`/agendamentos/${agendamentoId}/realizado`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao marcar como realizado' };
    }
  }
};