const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: 6
    },
    tipo: {
        type: String,
        enum: ['paciente', 'medico', 'admin'],
        default: 'paciente'
    },
    matricula: {
        type: String,
        required: function() { return this.tipo === 'paciente'; }
    },
    telefone: String,
    ativo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash da senha antes de salvar
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) return next();
    this.senha = await bcrypt.hash(this.senha, 12);
    next();
});

// Comparar senha
usuarioSchema.methods.compararSenha = async function(senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Usuario', usuarioSchema);