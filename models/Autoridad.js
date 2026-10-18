const mongoose = require('mongoose');

const autoridadSchema = new mongoose.Schema({
    eliminadoEn: { type: Date, default: null }, // papelera: fecha de baja (null = visible)
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null }, // quién lo creó (los editores solo tocan lo suyo)
    cargo: { type: String, required: [true, 'El cargo es obligatorio'], trim: true },
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    orden: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Autoridad', autoridadSchema);
