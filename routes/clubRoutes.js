const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const auth = require('../middleware/authMiddleware');

const CAMPOS = ['capacidadCiudadela', 'cantidadSocios', 'copasNacionales'];
const aCifras = (doc) => Object.fromEntries(CAMPOS.map((c) => [c, doc[c]]));

// GET /api/club (público) -> cifras actuales (o las de siempre si nunca se editaron)
router.get('/', async (req, res) => {
    try {
        res.json(aCifras((await Club.findOne().lean()) || new Club()));
    } catch (error) {
        console.error('Error al leer las cifras del club:', error);
        res.status(500).json({ mensaje: 'Error al obtener los datos del club' });
    }
});

// PUT /api/club -> solo administradores
router.put('/', auth, async (req, res) => {
    try {
        const cambios = {};
        for (const campo of CAMPOS) {
            const valor = Number(req.body[campo]);
            if (!Number.isFinite(valor) || valor < 0) {
                return res.status(400).json({ mensaje: `Valor inválido en ${campo}` });
            }
            cambios[campo] = Math.round(valor);
        }
        const doc = await Club.findOneAndUpdate({}, cambios, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
        res.json(aCifras(doc));
    } catch (error) {
        console.error('Error al guardar las cifras del club:', error);
        res.status(500).json({ mensaje: 'Error al guardar los datos del club' });
    }
});

module.exports = router;
