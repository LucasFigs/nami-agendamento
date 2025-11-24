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
    }
};