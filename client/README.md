# 🏥 NAMI - Sistema de Agendamento de Consultas

Frontend completo do sistema de agendamento de consultas desenvolvido para a UNIFOR.

## 🎯 Status do Projeto

### ✅ **O QUE JÁ ESTÁ FUNCIONAL:**
- **Telas completas e responsivas** - Design moderno seguindo as cores da UNIFOR
- **Sistema de navegação** - Entre todas as telas sem recarregar a página
- **Validações de formulário** - Campos obrigatórios, confirmação de senha, etc.
- **Fluxo completo do paciente** - Login → Cadastro → Dashboard

### 🚧 **O QUE AINDA É SIMULAÇÃO:**
- **Dados estáticos** - Login/Cadastro não persistem no banco
- **Agendamentos mockados** - Lista fixa de consultas no dashboard
- **Sem integração com API** - Todas as ações são simuladas

## 📱 Telas Implementadas

### 1. **Login** (`/login`)
- Campos: Email e Senha
- Funcionalidades:
  - ✅ Validação de campos obrigatórios
  - ✅ "Esqueci minha senha" com modal
  - ✅ Navegação para cadastro
  - ⚠️ **SIMULAÇÃO**: Qualquer email/senha funciona

### 2. **Pré-Cadastro** (`/cadastro`)
- Campos: Nome, Matrícula, Data Nascimento, Email, Telefone, Senha
- Funcionalidades:
  - ✅ Validação de todos os campos
  - ✅ Confirmação de senha
  - ✅ Data picker nativo
  - ⚠️ **SIMULAÇÃO**: Dados não são salvos

### 3. **Dashboard** (`/dashboard`)
- Cards principais:
  - 📅 Agendar Consulta
  - 📋 Meus Agendamentos  
  - 📊 Histórico
- Funcionalidades:
  - ✅ Lista de agendamentos com status
  - ✅ Estatísticas do paciente
  - ✅ Menu inferior de navegação
  - ⚠️ **SIMULAÇÃO**: Dados mockados

## 🎨 Design System

### **Cores Principais:**
```css
--unifor-blue: #003366;    /* Primária */
--unifor-gold: #FFD700;    /* Secundária */
--success: #28a745;        /* Confirmações */
--danger: #dc3545;         /* Erros/Cancelar */