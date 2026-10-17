const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { firmarToken, ROLES } = require('./authController');

const MIN_PASSWORD = 8;
const passwordValida = (p) => typeof p === 'string' && p.length >= MIN_PASSWORD;

const hayOtroAdministrador = async (excluirId) =>
    (await Usuario.countDocuments({ rol: { $ne: 'editor' }, _id: { $ne: excluirId } })) > 0;

// GET /api/usuarios -> lista de cuentas del panel (nunca incluye claves)
exports.listar = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, 'nombre email rol createdAt').sort({ createdAt: 1 }).lean();
        res.json(usuarios.map((u) => ({ ...u, rol: u.rol || 'administrador', esActual: String(u._id) === req.usuario.id })));
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
};

// PUT /api/usuarios/me/password -> cambia la clave propia (pide la actual) y devuelve una sesión nueva,
// porque al cambiar la clave se cierran las demás sesiones abiertas
exports.cambiarMiPassword = async (req, res) => {
    try {
        const { actual, nueva } = req.body;
        if (typeof actual !== 'string' || !passwordValida(nueva)) {
            return res.status(400).json({ mensaje: `La clave nueva debe tener al menos ${MIN_PASSWORD} caracteres` });
        }
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario || !(await bcrypt.compare(actual, usuario.password))) {
            return res.status(400).json({ mensaje: 'La clave actual no es correcta' });
        }
        usuario.password = nueva; // el modelo la encripta al guardar
        usuario.claveCambiadaEn = new Date();
        await usuario.save();

        firmarToken(usuario, (error, token) => {
            if (error) return res.status(500).json({ mensaje: 'Clave actualizada, pero hay que volver a iniciar sesión' });
            res.json({ mensaje: 'Clave actualizada', token });
        });
    } catch (error) {
        console.error('Error al cambiar la clave:', error);
        res.status(500).json({ mensaje: 'Error al cambiar la clave' });
    }
};

// PUT /api/usuarios/:id/password -> un administrador restablece la clave de otro (se le cierran las sesiones)
exports.restablecerPassword = async (req, res) => {
    try {
        if (!passwordValida(req.body.nueva)) {
            return res.status(400).json({ mensaje: `La clave nueva debe tener al menos ${MIN_PASSWORD} caracteres` });
        }
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        usuario.password = req.body.nueva;
        usuario.claveCambiadaEn = new Date();
        await usuario.save();
        res.json({ mensaje: 'Clave restablecida' });
    } catch (error) {
        console.error('Error al restablecer la clave:', error);
        res.status(400).json({ mensaje: 'No se pudo restablecer la clave' });
    }
};

// PUT /api/usuarios/:id/rol -> cambia entre administrador y editor (no el propio, y siempre queda un administrador)
exports.cambiarRol = async (req, res) => {
    try {
        const { rol } = req.body;
        if (!ROLES.includes(rol)) return res.status(400).json({ mensaje: 'El rol elegido no es válido' });
        if (req.params.id === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No podés cambiar tu propio rol' });
        }
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        if (rol === 'editor' && !(await hayOtroAdministrador(usuario._id))) {
            return res.status(400).json({ mensaje: 'Tiene que quedar al menos un administrador' });
        }
        usuario.rol = rol;
        await usuario.save();
        res.json({ mensaje: 'Rol actualizado' });
    } catch (error) {
        console.error('Error al cambiar el rol:', error);
        res.status(400).json({ mensaje: 'No se pudo cambiar el rol' });
    }
};

// DELETE /api/usuarios/:id -> no permite borrarse a sí mismo ni dejar el sistema sin administradores
exports.eliminar = async (req, res) => {
    try {
        if (req.params.id === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No podés eliminar tu propia cuenta' });
        }
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        if (usuario.rol !== 'editor' && !(await hayOtroAdministrador(usuario._id))) {
            return res.status(400).json({ mensaje: 'Tiene que quedar al menos un administrador' });
        }
        await usuario.deleteOne();
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(400).json({ mensaje: 'No se pudo eliminar el usuario' });
    }
};
