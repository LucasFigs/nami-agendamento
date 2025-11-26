# 🎨 NAMI Frontend - Interface do Usuário

Frontend React.js do sistema NAMI Agendamento, oferecendo interfaces responsivas e intuitivas para pacientes, médicos e administradores.

## 🎯 Páginas e Rotas

### 🔐 Autenticação
- `/login` - Login geral
- `/login-medico` - Login médico/admin
- `/cadastro` - Cadastro de pacientes

### 🏠 Dashboards
- `/dashboard` - Dashboard paciente
- `/dashboard-medico` - Dashboard médico
- `/admin` - Painel administrativo

### 📅 Agendamentos
- `/agendamento` - Novo agendamento
- `/agendamentos` - Meus agendamentos (paciente)
- `/agenda-medico` - Agenda médica

### 👤 Perfis
- `/perfil` - Perfil paciente
- `/perfil-medico` - Perfil médico

### 📊 Relatórios
- `/relatorios-medico` - Relatórios médico

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **React Router DOM** - Roteamento
- **CSS Modules** - Estilização
- **Axios** - Cliente HTTP
- **Context API** - Gerenciamento de estado

## 📦 Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm start

# Build de produção
npm run build

# Executar testes
npm test
```

## 🎨 Estrutura de Componentes

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas completas
├── services/      # Serviços API
├── styles/        # Estilos globais
└── App.js         # Componente raiz
```

## 🔌 Integração com API

O frontend consome a API através dos serviços em `src/services/`:

- `authService.js` - Autenticação
- `agendamentoService.js` - Agendamentos
- `medicoService.js` - Dados médicos
- `usuarioService.js` - Dados usuários

## 🎭 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do client:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm test -- --coverage
```

## 📱 Responsividade

O sistema é totalmente responsivo, funcionando em:
- 📱 Mobile (320px+)
- 📟 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Servir Build
```bash
# Usando serve
npx serve -s build

# Ou usando express estático
node server-static.js
```

## 📊 Performance

- Code splitting automático
- Lazy loading de rotas
- Otimização de imagens
- Bundle analysis com webpack-bundle-analyzer

## 🔒 Segurança

- Validação de formulários
- Proteção de rotas autenticadas
- Sanitização de inputs
- Tokens JWT com expiration