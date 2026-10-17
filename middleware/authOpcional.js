const jwt = require('jsonwebtoken');

// Si viene un token válido deja el usuario en req.usuario; si no, sigue como visitante (nunca rechaza)
module.exports = function (req, res, next) {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (token) req.usuario = jwt.verify(token, process.env.JWT_SECRET).usuario;
    } catch {
        /* token inválido o vencido: se trata como visitante */
    }
    next();
};
