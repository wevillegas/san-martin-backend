const mongoose = require('mongoose');

// Definimos el "molde" para nuestros jugadores
const jugadorSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    apellido: { 
        type: String, 
        required: [true, 'El apellido es obligatorio'],
        trim: true
    },
    posicion: { 
        type: String, 
        required: [true, 'La posición es obligatoria'],
        enum: ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'] // Solo permite estos valores
    },
    numeroCamiseta: { 
        type: Number 
    },
    imagen: { 
        type: String, 
        default: 'https://via.placeholder.com/150' // Una imagen por defecto por si no subimos foto
    }
}, {
    timestamps: true // Esto agrega automáticamente la fecha de creación y de actualización
});

// Exportamos el modelo para poder usarlo en otras partes del código
module.exports = mongoose.model('Jugador', jugadorSchema);