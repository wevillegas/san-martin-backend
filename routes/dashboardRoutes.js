const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Noticia = require('../models/Noticia');
const Jugador = require('../models/Jugador');
const CuerpoTecnico = require('../models/CuerpoTecnico');
const Producto = require('../models/Producto');
const Autoridad = require('../models/Autoridad');
const Usuario = require('../models/Usuario');
const Auditoria = require('../models/Auditoria');

const vivos = { eliminadoEn: null };
const enPapelera = { eliminadoEn: { $ne: null } };

// GET /api/dashboard -> cifras para el panel principal y la actividad más reciente
router.get('/', auth, async (req, res) => {
    try {
        const [noticias, borradores, programadas, destacadas, jugadores, cuerpoTecnico, productos, autoridades, usuarios, papelera, actividad] = await Promise.all([
            Noticia.countDocuments({ ...vivos, estado: { $ne: 'borrador' }, $or: [{ publicarEn: null }, { publicarEn: { $lte: new Date() } }] }),
            Noticia.countDocuments({ ...vivos, estado: 'borrador' }),
            Noticia.countDocuments({ ...vivos, estado: { $ne: 'borrador' }, publicarEn: { $gt: new Date() } }),
            Noticia.countDocuments({ ...vivos, destacado: true }),
            Jugador.countDocuments(vivos),
            CuerpoTecnico.countDocuments(vivos),
            Producto.countDocuments(vivos),
            Autoridad.countDocuments(vivos),
            Usuario.countDocuments(),
            Promise.all([Noticia, Jugador, CuerpoTecnico, Producto, Autoridad].map((m) => m.countDocuments(enPapelera))).then((n) => n.reduce((a, b) => a + b, 0)),
            Auditoria.find({ accion: { $ne: 'login' } }).sort({ createdAt: -1 }).limit(6).lean()
        ]);
        res.json({ noticias, borradores, programadas, destacadas, jugadores, cuerpoTecnico, productos, autoridades, usuarios, papelera, actividad: req.usuario.rol === 'administrador' ? actividad : [] });
    } catch (error) {
        console.error('Error en el dashboard:', error);
        res.status(500).json({ mensaje: 'Error al obtener los datos del panel' });
    }
});

module.exports = router;
