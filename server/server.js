require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Conectar ao banco
connectDB();

// Rota de teste simples
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API NAMI Agendamento funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste para usuários
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success',
    data: {
      message: 'Teste de API funcionando!',
      version: '1.0.0'
    }
  });
});

const PORT = process.env.PORT || 5000;

// Importar rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/agendamentos', require('./routes/agendamentoRoutes'));

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`🎯 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});