# 🚀 NAMI Backend - API REST

API Node.js/Express do sistema NAMI Agendamento, fornecendo endpoints seguros para gestão de agendamentos, usuários e relatórios.

## 🏗️ Arquitetura

```
Express.js → Middlewares → Routes → Controllers → Models → MongoDB
```

## 📡 Endpoints da API

### 🔐 Autenticação
- `POST /api/auth/registro` - Registrar usuário
- `POST /api/auth/login` - Login

### 👥 Usuários
- `GET /api/usuarios/meus-dados` - Meus dados
- `PUT /api/usuarios/perfil` - Atualizar perfil
- `PUT /api/usuarios/alterar-senha` - Alterar senha

### 🏥 Médicos
- `GET /api/medicos` - Listar médicos
- `GET /api/medicos/especialidade/:especialidade` - Filtrar por especialidade
- `GET /api/medicos/:id/horarios-disponiveis` - Horários disponíveis

### 📅 Agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos/paciente` - Agendamentos do paciente
- `GET /api/agendamentos/medico` - Agendamentos do médico
- `PUT /api/agendamentos/:id/cancelar` - Cancelar agendamento

### 📊 Admin
- `GET /api/agendamentos/todos` - Todos agendamentos (admin)
- `GET /api/usuarios/todos` - Todos usuários (admin)
- `GET /api/agendamentos/relatorios` - Relatórios

## 🗄️ Modelos de Dados

### Usuario
```javascript
{
  nome: String,
  email: String (unique),
  senha: String (hashed),
  tipo: ['paciente', 'medico', 'admin'],
  telefone: String,
  ativo: Boolean
}
```

### Medico
```javascript
{
  usuario: ObjectId (ref: Usuario),
  especialidade: String,
  crm: String (unique),
  consultorio: String,
  diasAtendimento: [{
    diaSemana: String,
    horarios: [String]
  }]
}
```

### Agendamento
```javascript
{
  paciente: ObjectId (ref: Usuario),
  medico: ObjectId (ref: Medico),
  data: Date,
  horario: String,
  status: ['agendado', 'confirmado', 'realizado', 'cancelado']
}
```

## 🔧 Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start

# Popular banco com dados de teste
npm run seed
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/nami
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
PORT=5000
NODE_ENV=development
```

### Estrutura do Projeto
```
server/
├── config/         # Configurações (database)
├── controllers/    # Lógica dos endpoints
├── middleware/     # Autenticação, admin, etc.
├── models/         # Modelos MongoDB
├── routes/         # Definição de rotas
├── scripts/        # Scripts (seed)
└── server.js       # Entry point
```

## 🔒 Segurança

- **JWT Authentication** - Tokens com expiration
- **Password Hashing** - bcryptjs
- **CORS** - Configurado para frontend
- **Input Validation** - Nos controllers
- **Rate Limiting** - Prevenção de ataques

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage
```

## 📊 Monitoramento

- Logs estruturados
- Error tracking
- Performance monitoring
- Health checks

## 🚀 Deploy

### Produção
```bash
NODE_ENV=production npm start
```

### Variáveis de Produção
```env
NODE_ENV=production
MONGODB_URI=sua_uri_de_producao
JWT_SECRET=seu_jwt_secret_forte
PORT=5000
```

## 📈 Performance

- Conexão pooling MongoDB
- Compression middleware
- Helmet.js security
- Query optimization

## 🔍 Debugging

```bash
# Desenvolvimento com debug
DEBUG=nami:* npm run dev

# Logs estruturados
NODE_ENV=development npm start
```

## 🤝 Contribuição

1. Siga o padrão de código
2. Adicione testes para novas funcionalidades
3. Documente novos endpoints
4. Atualize o README se necessário