require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

const criarAdminInicial = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Conectado ao MongoDB...');

        // Verificar se admin já existe
        const adminExiste = await Usuario.findOne({ email: 'admin@nami.com' });
        
        if (adminExiste) {
            console.log('✅ Admin já existe no sistema');
            process.exit();
        }

        // Criar admin
        const admin = await Usuario.create({
            nome: 'Administrador NAMI',
            email: 'admin@nami.com',
            senha: 'admin123', // Senha temporária
            tipo: 'admin',
            telefone: '(11) 99999-9999'
        });

        console.log('🎉 ADMIN CRIADO COM SUCESSO!');
        console.log('📧 Email: admin@nami.com');
        console.log('🔑 Senha: admin123');
        console.log('⚠️  IMPORTANTE: Alterar a senha após primeiro login!');
        
        process.exit();

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error.message);
        process.exit(1);
    }
};

criarAdminInicial();