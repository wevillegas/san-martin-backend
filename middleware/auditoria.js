const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Auditoria = require('../models/Auditoria');
const Usuario = require('../models/Usuario');

const ACCIONES = { POST: 'crear', PUT: 'editar', PATCH: 'editar', DELETE: 'eliminar' };
const MODELOS = { jugadores: 'Jugador', noticias: 'Noticia', 'cuerpo-tecnico': 'CuerpoTecnico', productos: 'Producto', usuarios: 'Usuario', autoridades: 'Autoridad' };

// Acciones que no apuntan a un elemento concreto
const ETIQUETAS = { me: 'su propia clave', orden: 'orden de la lista', importar: 'lista inicial' };

const nombreDe = (d) => d && (d.titulo || d.nombre && d.cargo && `${d.nombre} (${d.cargo})` || [d.nombre, d.apellido].filter(Boolean).join(' ') || undefined);

// Registra cada alta/edición/baja exitosa hecha con un token válido (se monta antes de las rutas).
// Nunca guarda el cuerpo de la petición, solo el nombre/título del elemento.
module.exports = async (req, res, next) => {
    let accion = ACCIONES[req.method];
    if (!accion || req.originalUrl.startsWith('/api/auth/renovar')) return next(); // renovar la sesión no es una acción a auditar

    let usuarioId;
    try {
        usuarioId = jwt.verify(req.header('Authorization')?.split(' ')[1], process.env.JWT_SECRET).usuario.id;
    } catch {
        return next(); // sin token válido las rutas protegidas la rechazan solas
    }

    // /api/<entidad>/<id>  (la papelera es /api/papelera/<tipo>/<id>[/restaurar])
    let [, , entidad, entidadId, tercero] = req.originalUrl.split('?')[0].split('/');
    let sufijo = '';
    if (entidad === 'papelera') {
        entidad = entidadId;
        entidadId = tercero;
        if (req.method === 'POST') accion = 'restaurar';
        else sufijo = ' (definitivo)';
    }

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
            const detalle = (Object.hasOwn(ETIQUETAS, entidadId) && ETIQUETAS[entidadId])
                || (entidad === 'club' ? 'cifras del club' : nombreDe(previo) || nombreDe(body) || (entidad === 'auth' ? body.email : undefined));
            await Auditoria.create({
                usuarioId,
                usuarioNombre: usuario?.nombre,
                usuarioEmail: usuario?.email,
                accion,
                entidad,
                entidadId,
                detalle: detalle ? detalle + sufijo : undefined
            });
        } catch (error) {
            console.error('No se pudo registrar la auditoría:', error.message);
        }
    });

    next();
};
