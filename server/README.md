# 🏥 NAMI Agendamento - Sistema de Agendamentos Médicos

## 📋 Sobre o Projeto
Sistema completo de agendamentos médicos desenvolvido em Node.js com Express e MongoDB. Permite o gerenciamento de usuários, médicos e agendamentos de consultas.

## 🚀 Tecnologias Utilizadas
- **Backend:** Node.js, Express.js
- **Banco de Dados:** MongoDB Atlas
- **Autenticação:** JWT (JSON Web Tokens)
- **Segurança:** Bcrypt para hash de senhas
- **CORS:** Habilitado para integração frontend

## 📁 Estrutura do Projeto
```
nami-agendamento/
├── scripts/
│   └── seedAdmin.js          # Script para criar usuário admin
├── controllers/
│   ├── authController.js     # Autenticação (login/registro)
│   ├── agendamentoController.js # Gestão de agendamentos
│   ├── medicoController.js   # CRUD de médicos
│   └── usuarioController.js  # Gestão de usuários
├── models/
│   ├── Usuario.js           # Schema de usuários
│   ├── Medico.js            # Schema de médicos
│   └── Agendamento.js       # Schema de agendamentos
├── routes/
│   ├── authRoutes.js        # Rotas de autenticação
│   ├── agendamentoRoutes.js # Rotas de agendamentos
│   ├── medicoRoutes.js      # Rotas de médicos
│   └── usuarioRoutes.js     # Rotas de usuários
├── middleware/
│   ├── authMiddleware.js    # Middleware de autenticação
│   └── adminMiddleware.js   # Middleware de admin
├── server.js               # Arquivo principal
├── package.json
└── .env                    # Variáveis de ambiente
```

## 👥 Tipos de Usuários
1. **Paciente:** Pode agendar consultas e gerenciar seu perfil
2. **Médico:** Pode visualizar seus agendamentos (em desenvolvimento)
3. **Administrador:** Gerencia todo o sistema (usuários, médicos, agendamentos)

## 🔐 Sistema de Autenticação
- Registro e login de usuários
- Tokens JWT com expiração de 30 dias
- Proteção de rotas com middleware de autenticação
- Hash de senhas com Bcrypt

## 🏥 Funcionalidades Implementadas

### 🔑 Autenticação
- ✅ Registro de usuários (pacientes)
- ✅ Login com JWT
- ✅ Middleware de proteção de rotas
- ✅ Criação de usuário admin via script

### 👥 Gestão de Usuários
- ✅ CRUD completo de usuários
- ✅ Atualização de perfil
- ✅ Desativação de conta
- ✅ Listagem de usuários (admin)

### 🩺 Gestão de Médicos
- ✅ CRUD completo de médicos
- ✅ Listagem pública de médicos
- ✅ Busca por especialidade
- ✅ Definição de horários disponíveis
- ✅ Verificação de horários disponíveis

### 📅 Sistema de Agendamentos
- ✅ Criação de agendamentos
- ✅ Listagem de agendamentos do paciente
- ✅ Cancelamento de agendamentos
- ✅ Verificação de conflitos de horário
- ✅ Listagem completa de agendamentos (admin)

## 🗃️ Modelos de Dados

### Usuario
```javascript
{
  nome: String,
  email: String (único),
  senha: String (hash),
  tipo: ['paciente', 'medico', 'admin'],
  matricula: String (para pacientes),
  telefone: String,
  ativo: Boolean
}
```

### Medico
```javascript
{
  usuario: ObjectId (ref: Usuario),
  especialidade: String,
  crm: String (único),
  consultorio: String,
  diasAtendimento: [{
    diaSemana: String,
    horarios: [String]
  }],
  ativo: Boolean
}
```

### Agendamento
```javascript
{
  paciente: ObjectId (ref: Usuario),
  medico: ObjectId (ref: Medico),
  data: Date,
  horario: String,
  especialidade: String,
  status: ['agendado', 'confirmado', 'cancelado', 'realizado', 'faltou'],
  observacoes: String
}
```

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado
- MongoDB Atlas ou local
- Insomnia/Postman para testes

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Crie o usuário admin inicial
node scripts/seedAdmin.js

# Inicie o servidor
npm start
```

### Variáveis de Ambiente (.env)
```env
MONGODB_URI=sua_string_de_conexao_mongodb
JWT_SECRET=seu_jwt_secret
PORT=5000
```

## 🧪 Testando a API

### 1. Configuração Inicial
```bash
node scripts/seedAdmin.js
npm start
```

### 2. Fluxo de Teste Recomendado
1. **Login como Admin** (`admin@nami.com` / `admin123`)
2. **Criar Médico** (usando ID de usuário existente)
3. **Registrar Paciente** 
4. **Login como Paciente**
5. **Criar Agendamento**
6. **Testar CRUDs completos**

### 3. Endpoints Principais

#### Autenticação
- `POST /api/auth/registro` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/test` - Teste de rota

#### Médicos
- `GET /api/medicos` - Listar médicos
- `GET /api/medicos/especialidade/:especialidade` - Buscar por especialidade
- `POST /api/medicos` - Criar médico (admin)
- `GET /api/medicos/:id/horarios-disponiveis` - Horários disponíveis

#### Agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos` - Meus agendamentos
- `PUT /api/agendamentos/:id/cancelar` - Cancelar agendamento
- `GET /api/agendamentos/todos` - Todos agendamentos (admin)

#### Usuários
- `PUT /api/usuarios/perfil` - Atualizar perfil
- `GET /api/usuarios` - Listar usuários (admin)
- `DELETE /api/usuarios/perfil` - Desativar conta

## 🔒 Segurança
- Senhas hasheadas com bcrypt
- Autenticação JWT
- Proteção de rotas sensíveis
- Validação de dados de entrada
- CORS configurado

## 🎯 Próximas Funcionalidades
- [ ] Dashboard administrativo
- [ ] Sistema de notificações
- [ ] Confirmação de agendamentos por médicos
- [ ] Relatórios e estatísticas
- [ ] Integração com frontend
- [ ] Sistema de lembretes

