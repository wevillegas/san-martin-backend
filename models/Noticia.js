const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título de la noticia es obligatorio'],
        trim: true
    },
    resumen: {
        type: String,
        required: [true, 'El resumen es obligatorio para las tarjetas del inicio'],
        trim: true
    },
    cuerpo: {
        type: String,
        required: [true, 'El cuerpo de la noticia no puede estar vacío']
    },
    imagenUrl: {
        type: String
    },
    autor: {
        type: String,
        default: 'Prensa San Martín'
    },
    etiqueta: {
        type: String,
        enum: ['Primera Nacional', 'Institucional', 'Liga Tucumana', 'Femenino', 'Socios', 'Primer Equipo', 'Juveniles'],
        default: 'Primera Nacional'
    },
    destacado: {
        type: Boolean,
        default: false // Por defecto, una noticia nueva no es destacada
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Noticia', noticiaSchema);