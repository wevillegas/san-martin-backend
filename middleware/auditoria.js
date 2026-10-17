const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Auditoria = require('../models/Auditoria');
const Usuario = require('../models/Usuario');

const ACCIONES = { POST: 'crear', PUT: 'editar', PATCH: 'editar', DELETE: 'eliminar' };
const MODELOS = { jugadores: 'Jugador', noticias: 'Noticia', 'cuerpo-tecnico': 'CuerpoTecnico', productos: 'Producto' };

const nombreDe = (d) => d && (d.titulo || [d.nombre, d.apellido].filter(Boolean).join(' ') || undefined);

// Registra cada alta/edición/baja exitosa hecha con un token válido (se monta antes de las rutas).
// Nunca guarda el cuerpo de la petición, solo el nombre/título del elemento.
module.exports = async (req, res, next) => {
    const accion = ACCIONES[req.method];
    if (!accion) return next();

    let usuarioId;
    try {
        usuarioId = jwt.verify(req.header('Authorization')?.split(' ')[1], process.env.JWT_SECRET).usuario.id;
    } catch {
        return next(); // sin token válido las rutas protegidas la rechazan solas
    }

    // /api/<entidad>/<id>
    const [, , entidad, entidadId] = req.originalUrl.split('?')[0].split('/');

    let previo = null;
    if (entidadId && MODELOS[entidad]) {
        try {
            previo = await mongoose.model(MODELOS[entidad]).findById(entidadId).lean();
        } catch { /* id inválido: lo resuelve el controlador */ }
    }

    res.on('finish', async () => {
        if (res.statusCode >= 400) return;
        try {
            const usuario = await Usuario.findById(usuarioId, 'nombre email').lean();
            const body = req.body || {};
            await Auditoria.create({
                usuarioId,
                usuarioNombre: usuario?.nombre,
                usuarioEmail: usuario?.email,
                accion,
                entidad,
                entidadId,
                detalle: nombreDe(previo) || nombreDe(body) || (entidad === 'auth' ? body.email : undefined)
            });
        } catch (error) {
            console.error('No se pudo registrar la auditoría:', error.message);
        }
    });

    next();
};
