import api from './api';

export const usuarioService = {
  // Buscar dados do usuário logado
  async getMeusDados() {
    try {
      const response = await api.get('/usuarios/meus-dados');
      return response.data.data; // ← Retorna usuario.data (os dados do usuário)
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar dados do usuário' };
    }
  },

  // Atualizar perfil
  async atualizarPerfil(dados) {
    try {
      const response = await api.put('/usuarios/perfil', dados);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar perfil' };
    }
  },

  // Alterar senha
  async alterarSenha(senhaAtual, novaSenha) {
    try {
      const response = await api.put('/usuarios/alterar-senha', {
        senhaAtual,
        novaSenha
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao alterar senha' };
    }
  },

  // Buscar histórico de consultas
  async getHistoricoConsultas() {
    try {
      const response = await api.get('/usuarios/historico-consultas');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar histórico' };
    }
  },
  
  // Buscar todos os usuários (admin)
async getTodosUsuarios() {
  try {
    const response = await api.get('/usuarios/todos');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar usuários' };
  }
},

// Criar administrador
async criarAdmin(dados) {
  try {
    const response = await api.post('/usuarios/admin', dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao criar administrador' };
  }
},

// Ativar/desativar usuário
async toggleUsuarioStatus(usuarioId) {
  try {
    const response = await api.put(`/usuarios/${usuarioId}/toggle-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao alterar status do usuário' };
  }
},

// Resetar senha
async resetarSenha(usuarioId) {
  try {
    const response = await api.put(`/usuarios/${usuarioId}/resetar-senha`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao resetar senha' };
  }
},

// Buscar todos os usuários (admin)
async getTodosUsuarios() {
  try {
    const response = await api.get('/usuarios/todos');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar usuários' };
  }
},

// Criar administrador
async criarAdmin(dados) {
  try {
    const response = await api.post('/usuarios/admin', dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao criar administrador' };
  }
},

// Ativar/desativar usuário
async toggleUsuarioStatus(usuarioId) {
  try {
    const response = await api.put(`/usuarios/${usuarioId}/toggle-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao alterar status do usuário' };
  }
},

// Resetar senha
async resetarSenha(usuarioId) {
  try {
    const response = await api.put(`/usuarios/${usuarioId}/resetar-senha`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao resetar senha' };
  }
}
};