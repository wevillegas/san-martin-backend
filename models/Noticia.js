const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título de la noticia es obligatorio'],
        trim: true
    },
    cuerpo: {
        type: String,
        required: [true, 'El cuerpo de la noticia no puede estar vacío']
    },
    imagen: {
        type: String,
        default: 'https://via.placeholder.com/600x400' // Imagen por defecto para la portada
    },
    autor: {
        type: String,
        default: 'Prensa San Martín'
    },
    etiqueta: {
        type: String,
        enum: ['Primera Nacional', 'Institucional', 'Reserva', 'Femenino', 'Socios'],
        default: 'Primera Nacional'
    }
}, {
    timestamps: true // Fundamental para las noticias: nos da fecha y hora de publicación automática
});

module.exports = mongoose.model('Noticia', noticiaSchema);