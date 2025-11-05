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
        console.log('Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error.message);
        process.exit(1);
    }
};

// Conectar ao banco
connectDB();

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API NAMI Agendamento funcionando!',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        timestamp: new Date().toISOString()
    });
});

// Importar rotas
try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('Rotas de autenticação carregadas');
} catch (error) {
    console.log('Rotas de auth não carregadas:', error.message);
}

try {
    const agendamentoRoutes = require('./routes/agendamentoRoutes');
    app.use('/api/agendamentos', agendamentoRoutes);
    console.log('Rotas de agendamento carregadas');
} catch (error) {
    console.log('Rotas de agendamento não carregadas:', error.message);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});