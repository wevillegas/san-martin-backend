// Después de authMiddleware: el administrador pasa siempre; el editor solo sobre lo que creó él mismo.
// Lo anterior a este control (sin `creadoPor`) queda solo para administradores.
module.exports = (Modelo) => async (req, res, next) => {
    if (req.usuario?.rol === 'administrador') return next();
    try {
        const doc = await Modelo.findOne({ _id: req.params.id, eliminadoEn: null }, 'creadoPor').lean();
        if (!doc) return next(); // el controlador responde 404
        if (doc.creadoPor && String(doc.creadoPor) === req.usuario.id) return next();
        res.status(403).json({ mensaje: 'Solo podés modificar lo que creaste vos. Esto lo cargó otra persona.' });
    } catch (error) {
        next(error);
    }
};
