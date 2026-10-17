const mongoose = require('mongoose');

// Registro de quién hizo qué en el panel de administración
const auditoriaSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    usuarioNombre: String,
    usuarioEmail: String,
    accion: { type: String, enum: ['crear', 'editar', 'eliminar', 'restaurar', 'login'], required: true },
    entidad: { type: String, required: true }, // jugadores, noticias, cuerpo-tecnico, productos, auth
    entidadId: String,
    detalle: String // título o nombre del elemento afectado
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

auditoriaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Auditoria', auditoriaSchema);
