const mongoose = require('mongoose');

const medicoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  especialidade: {
    type: String,
    required: true,
    enum: ['Ginecologista', 'Ortopedista', 'Endocrinologista', 'Geriatra', 'Psiquiatra']
  },
  crm: {
    type: String,
    required: true,
    unique: true
  },
  consultorio: String,
  horariosDisponiveis: [{
    diaSemana: {
      type: String,
      enum: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
    },
    horarios: [String] // ['08:00', '08:30', '09:00', ...]
  }],
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medico', medicoSchema);