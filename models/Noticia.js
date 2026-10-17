const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
    eliminadoEn: { type: Date, default: null }, // papelera: fecha de baja (null = visible)
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
    estado: {
        type: String,
        enum: ['borrador', 'publicada'],
        default: 'publicada'
    },
    publicarEn: {
        type: Date,
        default: null // null = se muestra apenas se publica; con fecha futura queda programada
    },
    destacado: {
        type: Boolean,
        default: false // Por defecto, una noticia nueva no es destacada
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Noticia', noticiaSchema);