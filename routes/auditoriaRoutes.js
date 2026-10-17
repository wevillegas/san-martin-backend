const express = require('express');
const router = express.Router();
const Auditoria = require('../models/Auditoria');
const auth = require('../middleware/authMiddleware');

// GET /api/auditoria?entidad=&accion=&usuario=&pagina=1  (solo administradores logueados)
router.get('/', auth, async (req, res) => {
    try {
        const filtro = {};
        for (const [campo, param] of [['entidad', 'entidad'], ['accion', 'accion'], ['usuarioEmail', 'usuario']]) {
            if (req.query[param]) filtro[campo] = String(req.query[param]);
        }
        const limite = 30;
        const pagina = Math.max(1, parseInt(req.query.pagina) || 1);

        const [registros, total, usuarios] = await Promise.all([
            Auditoria.find(filtro).sort({ createdAt: -1 }).skip((pagina - 1) * limite).limit(limite).lean(),
            Auditoria.countDocuments(filtro),
            Auditoria.distinct('usuarioEmail')
        ]);

        res.json({ registros, total, pagina, paginas: Math.ceil(total / limite), usuarios });
    } catch (error) {
        console.error('Error al leer auditoría:', error);
        res.status(500).json({ mensaje: 'Error al obtener la auditoría' });
    }
});

module.exports = router;
