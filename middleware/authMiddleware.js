const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Leer el token que viene en la cabecera (Header) de la petición
    const authHeader = req.header('Authorization');

    // 2. Si no mandó nada, lo rebotamos
    if (!authHeader) {
        return res.status(401).json({ mensaje: 'No hay token, permiso denegado' });
    }

    try {
        // Los tokens suelen enviarse con la palabra "Bearer " adelante.
        // Ejemplo: "Bearer eyJhbGciOi..."
        // Usamos split para separar la palabra Bearer del código y quedarnos solo con el código (posición 1)
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ mensaje: 'Formato de token inválido' });
        }

        // 3. Verificamos que el token sea auténtico usando nuestra palabra secreta
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Si es válido, guardamos los datos del usuario en la petición (req) y le decimos "pasá" (next)
        req.usuario = cifrado.usuario;
        next(); // Esto hace que el código siga hacia el Controlador

    } catch (error) {
        // Si el token expiró o alguien inventó uno falso
        res.status(401).json({ mensaje: 'Token no válido o expirado' });
    }
};