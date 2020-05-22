const mongoose = require('mongoose');

const TareaSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    proyecto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proyecto'
    },
    creado: {
        type: Date,
        default: Date.now()
    },
    estado: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Tarea', TareaSchema)