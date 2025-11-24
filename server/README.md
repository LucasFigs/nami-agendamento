# 🏥 NAMI Agendamento - Sistema de Agendamentos Médicos

## 📋 Sobre o Projeto
Sistema completo de agendamentos médicos desenvolvido em Node.js com Express e MongoDB. Permite o gerenciamento de usuários, médicos e agendamentos de consultas.

## 🚀 Tecnologias Utilizadas
- **Backend:** Node.js, Express.js
- **Banco de Dados:** MongoDB Atlas
- **Autenticação:** JWT (JSON Web Tokens)
- **Segurança:** Bcrypt para hash de senhas
- **CORS:** Habilitado para integração frontend

---

## 🧪 DEMONSTRAÇÃO NA APRESENTAÇÃO

### 📋 Fluxo de Demonstração Recomendado

#### 1. 🔑 CONFIGURAÇÃO INICIAL
```bash
# Iniciar servidor
npm start

# Verificar status da API
GET http://localhost:5000/
```

#### 2. 👥 CADASTRO E AUTENTICAÇÃO

**Registrar Paciente:**
```http
POST http://localhost:5000/api/auth/registro
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao.silva@unifor.br",
  "senha": "123456",
  "tipo": "paciente",
  "matricula": "20230012345",
  "telefone": "(85) 99999-9999"
}
```

**Login do Paciente:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "joao.silva@unifor.br",
  "senha": "123456"
}
```

**💡 Guarde o token retornado para as próximas requisições!**

#### 3. 🩺 GERENCIAMENTO DE MÉDICOS (Como Admin)

**Login como Administrador:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@nami.com",
  "senha": "admin123"
}
```

**Criar Médico:**
```http
POST http://localhost:5000/api/medicos
Content-Type: application/json
Authorization: Bearer [TOKEN_ADMIN]

{
  "usuarioId": "[ID_DO_USUARIO_MEDICO]",
  "especialidade": "Cardiologista",
  "crm": "CRM/CE 12345",
  "consultorio": "Sala 201",
  "diasAtendimento": [
    {
      "diaSemana": "segunda",
      "horarios": ["08:00", "09:00", "10:00", "14:00", "15:00"]
    },
    {
      "diaSemana": "quarta", 
      "horarios": ["08:00", "09:00", "10:00", "14:00", "15:00"]
    }
  ]
}
```

**Listar Médicos Disponíveis:**
```http
GET http://localhost:5000/api/medicos
Authorization: Bearer [TOKEN_PACIENTE]
```

#### 4. 📅 SISTEMA DE AGENDAMENTOS

**Ver Horários Disponíveis de um Médico:**
```http
GET http://localhost:5000/api/medicos/[MEDICO_ID]/horarios-disponiveis?data=2024-01-20
Authorization: Bearer [TOKEN_PACIENTE]
```

**Criar Agendamento:**
```http
POST http://localhost:5000/api/agendamentos
Content-Type: application/json
Authorization: Bearer [TOKEN_PACIENTE]

{
  "medicoId": "[MEDICO_ID]",
  "data": "2024-01-20",
  "horario": "09:00"
}
```

**Listar Meus Agendamentos:**
```http
GET http://localhost:5000/api/agendamentos
Authorization: Bearer [TOKEN_PACIENTE]
```

**Cancelar Agendamento:**
```http
PUT http://localhost:5000/api/agendamentos/[AGENDAMENTO_ID]/cancelar
Authorization: Bearer [TOKEN_PACIENTE]
```

#### 5. 👨‍💼 PAINEL ADMINISTRATIVO

**Listar Todos os Usuários:**
```http
GET http://localhost:5000/api/usuarios
Authorization: Bearer [TOKEN_ADMIN]
```

**Listar Todos os Agendamentos:**
```http
GET http://localhost:5000/api/agendamentos/todos
Authorization: Bearer [TOKEN_ADMIN]
```

**Buscar Médicos por Especialidade:**
```http
GET http://localhost:5000/api/medicos/especialidade/Cardiologista
Authorization: Bearer [TOKEN_PACIENTE]
```

---

## 🎯 CENÁRIOS PARA DEMONSTRAR

### ✅ **Cenário 1: Fluxo Completo do Paciente**
1. Registrar novo paciente
2. Fazer login
3. Listar médicos disponíveis
4. Ver horários de um médico
5. Fazer agendamento
6. Listar seus agendamentos
7. Cancelar um agendamento

### ✅ **Cenário 2: Gestão Administrativa**
1. Login como admin
2. Criar novo médico
3. Listar todos os usuários
4. Visualizar todos os agendamentos
5. Gerenciar médicos

### ✅ **Cenário 3: Validações do Sistema**
1. Tentar agendar horário ocupado
2. Tentar criar médico sem ser admin
3. Tentar acessar dados de outro usuário
4. Testar validação de dados

---

## 🔧 COMANDOS RÁPIDOS PARA APRESENTAÇÃO

### Inicialização Rápida:
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Criar dados de teste
node scripts/seedAdmin.js
```

### URLs para Teste Rápido:
```bash
# Status da API
http://localhost:5000/

# Documentação (se houver)
http://localhost:5000/api/docs
```

### Dados de Teste Pré-configurados:
```javascript
// Admin (já criado pelo seed)
Email: admin@nami.com
Senha: admin123

// Paciente de teste (criar durante demo)
Email: demo.paciente@unifor.br
Senha: 123456

// Médico de teste (criar durante demo)
Especialidade: Cardiologista
CRM: CRM/CE 99999
```

---

## 🚨 PONTOS CHAVE PARA DESTACAR

### 🔒 **Segurança**
- Autenticação JWT
- Hash de senhas com bcrypt
- Middleware de proteção de rotas
- Validação de permissões

### ⚡ **Funcionalidades**
- Sistema completo de agendamentos
- Gestão de múltiplos tipos de usuário
- Verificação de conflitos de horário
- API RESTful bem estruturada

### 🏗️ **Arquitetura**
- Padrão MVC
- Código modular e escalável
- Tratamento de erros robusto
- Preparado para integração com frontend

---

## 📞 SUPORTE DURANTE A APRESENTAÇÃO

### Comandos de Emergência:
```bash
# Se der erro de porta
npx kill-port 5000

# Se der erro de MongoDB
# Verificar string de conexão no .env

# Recriar dados de teste
node scripts/seedAdmin.js
```

### Troubleshooting Rápido:
- **Token inválido:** Fazer login novamente
- **Horário ocupado:** Escolher outro horário
- **Erro 403:** Tentar acessar rota sem permissão
- **Erro 404:** Verificar ID do recurso
