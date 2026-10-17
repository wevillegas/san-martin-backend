const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const auth = require('../middleware/authMiddleware');
const soloAdmin = require('../middleware/rol')('administrador');

const CIFRAS = ['capacidadCiudadela', 'cantidadSocios', 'copasNacionales'];

// Lo que ve el sitio (siempre con los valores de siempre si nunca se editó nada)
const aRespuesta = (doc) => ({
    ...Object.fromEntries(CIFRAS.map((c) => [c, doc[c]])),
    cuotas: doc.cuotas.map((c) => ({ nombre: c.nombre, edades: c.edades, precio: c.precio, destacada: c.destacada, ventajas: [...c.ventajas] })),
    horariosMuseo: { lineas: [...doc.horariosMuseo.lineas], aviso: doc.horariosMuseo.aviso, resumen: doc.horariosMuseo.resumen }
});

const texto = (valor, max) => (typeof valor === 'string' && valor.trim().length <= max ? valor.trim() : null);

// Cada validador devuelve { valor } o { error }
const validarCuotas = (cuotas) => {
    if (!Array.isArray(cuotas) || cuotas.length > 6) return { error: 'Puede haber hasta 6 cuotas' };
    const limpias = [];
    for (const c of cuotas) {
        const nombre = texto(c?.nombre, 60);
        const edades = texto(c?.edades ?? '', 80);
        const precio = Number(c?.precio);
        if (!nombre) return { error: 'Cada cuota necesita un nombre (hasta 60 caracteres)' };
        if (edades === null) return { error: `La descripción de "${nombre}" es demasiado larga` };
        if (!Number.isFinite(precio) || precio < 0) return { error: `El precio de "${nombre}" no es válido` };
        const ventajas = Array.isArray(c.ventajas) ? c.ventajas.map((v) => texto(v, 100)).filter(Boolean) : [];
        if (ventajas.length > 10) return { error: `"${nombre}" puede tener hasta 10 ventajas` };
        limpias.push({ nombre, edades, precio: Math.round(precio), destacada: c.destacada === true, ventajas });
    }
    return { valor: limpias };
};

const validarHorarios = (h) => {
    const lineas = Array.isArray(h?.lineas) ? h.lineas.map((l) => texto(l, 80)).filter(Boolean) : null;
    const aviso = texto(h?.aviso ?? '', 120);
    const resumen = texto(h?.resumen ?? '', 60);
    if (!lineas || lineas.length > 6) return { error: 'Los horarios pueden tener hasta 6 renglones de hasta 80 caracteres' };
    if (aviso === null || resumen === null) return { error: 'El aviso o el resumen son demasiado largos' };
    return { valor: { lineas, aviso, resumen } };
};

// GET /api/club (público)
router.get('/', async (req, res) => {
    try {
        res.json(aRespuesta((await Club.findOne()) || new Club()));
    } catch (error) {
        console.error('Error al leer los datos del club:', error);
        res.status(500).json({ mensaje: 'Error al obtener los datos del club' });
    }
});

// PUT /api/club -> solo administradores; guarda solo las secciones que lleguen (cifras, cuotas y/o horariosMuseo)
router.put('/', auth, soloAdmin, async (req, res) => {
    try {
        const cambios = {};

        for (const campo of CIFRAS) {
            if (req.body[campo] === undefined) continue;
            const valor = Number(req.body[campo]);
            if (!Number.isFinite(valor) || valor < 0) return res.status(400).json({ mensaje: `Valor inválido en ${campo}` });
            cambios[campo] = Math.round(valor);
        }
        if (req.body.cuotas !== undefined) {
            const r = validarCuotas(req.body.cuotas);
            if (r.error) return res.status(400).json({ mensaje: r.error });
            cambios.cuotas = r.valor;
        }
        if (req.body.horariosMuseo !== undefined) {
            const r = validarHorarios(req.body.horariosMuseo);
            if (r.error) return res.status(400).json({ mensaje: r.error });
            cambios.horariosMuseo = r.valor;
        }
        if (!Object.keys(cambios).length) return res.status(400).json({ mensaje: 'No hay nada para guardar' });

        const doc = await Club.findOneAndUpdate({}, { $set: cambios }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
        res.json(aRespuesta(doc));
    } catch (error) {
        console.error('Error al guardar los datos del club:', error);
        res.status(500).json({ mensaje: 'Error al guardar los datos del club' });
    }
});

module.exports = router;
