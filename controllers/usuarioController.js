const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const MIN_PASSWORD = 8;
const passwordValida = (p) => typeof p === 'string' && p.length >= MIN_PASSWORD;

// GET /api/usuarios -> lista de administradores (nunca incluye claves)
exports.listar = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, 'nombre email createdAt').sort({ createdAt: 1 }).lean();
        res.json(usuarios.map((u) => ({ ...u, esActual: String(u._id) === req.usuario.id })));
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
};

// PUT /api/usuarios/me/password -> cambia la clave propia (pide la actual)
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
        await usuario.save();
        res.json({ mensaje: 'Clave actualizada' });
    } catch (error) {
        console.error('Error al cambiar la clave:', error);
        res.status(500).json({ mensaje: 'Error al cambiar la clave' });
    }
};

// PUT /api/usuarios/:id/password -> un admin restablece la clave de otro
exports.restablecerPassword = async (req, res) => {
    try {
        if (!passwordValida(req.body.nueva)) {
            return res.status(400).json({ mensaje: `La clave nueva debe tener al menos ${MIN_PASSWORD} caracteres` });
        }
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        usuario.password = req.body.nueva;
        await usuario.save();
        res.json({ mensaje: 'Clave restablecida' });
    } catch (error) {
        console.error('Error al restablecer la clave:', error);
        res.status(400).json({ mensaje: 'No se pudo restablecer la clave' });
    }
};

// DELETE /api/usuarios/:id -> no permite borrarse a sí mismo ni dejar el sistema sin administradores
exports.eliminar = async (req, res) => {
    try {
        if (req.params.id === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No podés eliminar tu propia cuenta' });
        }
        if ((await Usuario.countDocuments()) <= 1) {
            return res.status(400).json({ mensaje: 'Tiene que quedar al menos un administrador' });
        }
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(400).json({ mensaje: 'No se pudo eliminar el usuario' });
    }
};
