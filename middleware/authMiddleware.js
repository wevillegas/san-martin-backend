const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Devuelve { id, rol } si el token es válido Y la cuenta sigue existiendo Y no cambió su clave después de emitirlo.
// El rol se lee siempre de la base de datos (nunca del token), así una baja o un cambio de rol rigen al instante.
// Devuelve { error } con el motivo si no es válido.
const verificar = async (token) => {
    let cifrado;
    try {
        cifrado = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return { error: 'Token no válido o expirado' };
    }

    const usuario = await Usuario.findById(cifrado.usuario?.id, 'rol claveCambiadaEn').lean();
    if (!usuario) return { error: 'La cuenta ya no existe' };
    if (usuario.claveCambiadaEn && cifrado.iat < Math.floor(usuario.claveCambiadaEn.getTime() / 1000)) {
        return { error: 'La clave cambió: iniciá sesión de nuevo' };
    }
    return { usuario: { id: String(usuario._id), rol: usuario.rol || 'administrador' } };
};

module.exports = async function (req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ mensaje: 'No hay token, permiso denegado' });
    }

    // Los tokens se envían como "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ mensaje: 'Formato de token inválido' });
    }

    try {
        const { usuario, error } = await verificar(token);
        if (error) return res.status(401).json({ mensaje: error });
        req.usuario = usuario;
        next();
    } catch (error) {
        next(error); // falla de la base de datos: no es culpa del token, no se cierra la sesión
    }
};

module.exports.verificar = verificar;
