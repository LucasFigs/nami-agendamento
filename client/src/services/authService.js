import api from './api';

export const authService = {
  // Login de paciente
  async loginPaciente(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario)); // Mudou para 'usuario'
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  // Login de médico/admin
  async loginMedicoAdmin(email, senha) {
    try {
      console.log('🔄 AuthService: Tentando login médico/admin', { email });
      const response = await api.post('/auth/login', { email, senha });
      console.log('✅ AuthService: Resposta completa', response);
      console.log('✅ AuthService: Dados retornados', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
        console.log('✅ AuthService: Token e usuário salvos no localStorage');
      }
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Erro no login', error);
      console.error('❌ AuthService: Detalhes do erro', error.response?.data);
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  // Registro de paciente - CORRIGIDO: mudou para /registro
  async registerPaciente(userData) {
    try {
      const response = await api.post('/auth/registro', userData); // Mudou para /registro
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao cadastrar usuário' };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }
};