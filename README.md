# 📋 README - SISTEMA DE AGENDAMENTO NAMI/UNIFOR

## 🎯 Sobre o Projeto

Sistema web completo para agendamento de consultas médicas no NAMI (Núcleo de Atenção Médica Integrada) da UNIFOR. Desenvolvido para otimizar o processo de agendamentos, gestão de médicos e controle de consultas.

**Status:** 🚀 Em Desenvolvimento

---

## 🛠 Tecnologias Utilizadas

### Back-end
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** (Banco de dados)
- **JWT** (Autenticação)
- **bcryptjs** (Criptografia)
- **CORS** (Integração front-end/back-end)

### Front-end (Próxima Fase)
- **React** + **TypeScript**
- **Bootstrap/Material-UI**
- **Axios** (Consumo de API)

---

## 📁 Estrutura do Projeto

```
nami-agendamento/
├── server/                          # Back-end
│   ├── models/                      # Modelos MongoDB
│   │   ├── Usuario.js
│   │   ├── Medico.js
│   │   └── Agendamento.js
│   ├── controllers/                 # Lógica de negócio
│   │   ├── authController.js
│   │   └── agendamentoController.js
│   ├── routes/                      # Rotas da API
│   │   ├── authRoutes.js
│   │   └── agendamentoRoutes.js
│   ├── middleware/                  # Middlewares
│   ├── .env                        # Variáveis de ambiente
│   └── server.js                   # Arquivo principal
├── client/                          # Front-end (futuro)
└── README.md
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- MongoDB Atlas ou local
- Git

### 1. Clone o Repositório
```bash
git clone [url-do-repositorio]
cd nami-agendamento
```

### 2. Configuração do Back-end
```bash
# Entre na pasta do servidor
cd server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 3. Configure o Arquivo .env
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/nami-database
JWT_SECRET=seu_jwt_secret_super_seguro_minimo_32_caracteres
PORT=5000
```

### 4. Execute o Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

---

## 🗄 Modelos de Dados

### Usuario
- `nome`, `email`, `senha`, `tipo` (paciente/medico/admin)
- `matricula`, `telefone`, `ativo`

### Medico  
- `usuario` (referência), `especialidade`, `crm`
- `consultorio`, `horariosDisponiveis`, `ativo`

### Agendamento
- `paciente`, `medico`, `data`, `horario`
- `especialidade`, `status`, `observacoes`

---

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/registro` - Registrar usuário
- `POST /api/auth/login` - Login

### Agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos` - Listar agendamentos do usuário

### Médicos (Futuro)
- `GET /api/medicos` - Listar médicos
- `POST /api/medicos` - Cadastrar médico (admin)

---

## 👥 Equipe de Desenvolvimento

### Back-end
- **Eduardo** - Desenvolvimento da API
- **Lucas** - Banco de dados e integrações

### Front-end  
- **Leandro** - Interface do usuário
- **Andreína** - Componentes e estilização

### Design & Gestão
- **Emerson** - UI/UX Design
- **Lucas** - Gerência de projeto

---

## 📋 Funcionalidades Implementadas

### ✅ Concluídas
- [x] Estrutura inicial do projeto
- [x] Conexão com MongoDB Atlas
- [x] Modelos de dados (Usuario, Medico, Agendamento)
- [x] Sistema de autenticação (registro/login)
- [x] CRUD básico de agendamentos
- [x] Validações de horários disponíveis

### 🚧 Em Desenvolvimento
- [ ] Middleware de autenticação JWT
- [ ] Front-end em React
- [ ] Sistema de roles e permissões
- [ ] Integração com SMS/email

### 📅 Planejadas
- [ ] Relatórios e estatísticas
- [ ] Controle de faltas
- [ ] Integração com calendário
- [ ] App mobile

---

## 🐛 Solução de Problemas Comuns

### Erro de Conexão MongoDB
```bash
# Verifique a string de conexão no .env
# Confirme usuário/senha no MongoDB Atlas
# Libere o IP no Network Access
```

### Erro de Dependências
```bash
# Limpe e reinstale
rm -rf node_modules
rm package-lock.json
npm install
```

### Porta em Uso
```bash
# Altere a porta no .env ou use:
killall node
```

---

## 📊 Scripts Disponíveis

```bash
npm start      # Produção
npm run dev    # Desenvolvimento com nodemon
npm test       # Executar testes
```

---

## 🔒 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| MONGODB_URI | String de conexão MongoDB | `mongodb+srv://...` |
| JWT_SECRET | Chave para tokens JWT | `chave_super_secreta` |
| PORT | Porta do servidor | `5000` |

---

## 📝 Licença

Este projeto é desenvolvido para fins acadêmicos na UNIFOR.

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request
