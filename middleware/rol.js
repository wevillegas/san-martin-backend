// Deja pasar solo a los usuarios con alguno de los roles indicados (se usa después de authMiddleware)
// Roles: 'administrador' (todo) y 'editor' (crea y edita contenido, no elimina ni administra).
module.exports = (...roles) => (req, res, next) => {
    if (roles.includes(req.usuario?.rol)) return next();
    res.status(403).json({ mensaje: 'Tu cuenta no tiene permiso para hacer esto' });
};
