const mongoose = require('mongoose');

const JugadorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    numeroCamiseta: { type: Number, required: true },
    posicion: {
        type: String,
        required: true,
        enum: ['Arquero', 'Defensor', 'Volante', 'Delantero'] // (Usa las que tengas definidas)
    },
    imagenUrl: { type: String }, // <-- Agregamos esto
    // NUEVOS CAMPOS AGREGADOS:
    fechaNacimiento: { type: Date },
    lugarNacimiento: { type: String },
    altura: { type: Number }, // Lo guardamos como número (ej: 1.88) para poder hacer estadísticas después si querés
    procedencia: { type: String },
    debutEnClub: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Jugador', JugadorSchema);