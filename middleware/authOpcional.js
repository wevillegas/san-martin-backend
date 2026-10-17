const { verificar } = require('./authMiddleware');

// Si viene un token válido deja el usuario en req.usuario; si no, sigue como visitante (nunca rechaza)
module.exports = async function (req, res, next) {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (token) {
            const { usuario } = await verificar(token);
            if (usuario) req.usuario = usuario;
        }
    } catch {
        /* token inválido o base caída: se trata como visitante */
    }
    next();
};
