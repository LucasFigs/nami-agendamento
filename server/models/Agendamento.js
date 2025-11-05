const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    medico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medico',
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    horario: {
        type: String,
        required: true
    },
    especialidade: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['agendado', 'confirmado', 'cancelado', 'realizado', 'faltou'],
        default: 'agendado'
    },
    observacoes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);