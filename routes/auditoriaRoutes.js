const express = require('express');
const router = express.Router();
const Auditoria = require('../models/Auditoria');
const auth = require('../middleware/authMiddleware');
const soloAdmin = require('../middleware/rol')('administrador');


// Arma el filtro a partir de ?entidad=&accion=&usuario=&desde=&hasta= (fechas AAAA-MM-DD)
const construirFiltro = (query) => {
    const filtro = {};
    for (const [campo, param] of [['entidad', 'entidad'], ['accion', 'accion'], ['usuarioEmail', 'usuario']]) {
        if (query[param]) filtro[campo] = String(query[param]);
    }
    const desde = query.desde && new Date(`${query.desde}T00:00:00`);
    const hasta = query.hasta && new Date(`${query.hasta}T23:59:59.999`);
    if ((desde && !isNaN(desde)) || (hasta && !isNaN(hasta))) {
        filtro.createdAt = {};
        if (desde && !isNaN(desde)) filtro.createdAt.$gte = desde;
        if (hasta && !isNaN(hasta)) filtro.createdAt.$lte = hasta;
    }
    return filtro;
};

// GET /api/auditoria?pagina=1  (solo administradores logueados)
router.get('/', auth, soloAdmin, async (req, res) => {
    try {
        const filtro = construirFiltro(req.query);
        const limite = Math.min(Math.max(parseInt(req.query.limite) || 30, 1), 50);
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

// Celda de CSV: comillas escapadas y sin fórmulas (un título que empiece con = + - @ no se ejecuta en Excel)
const celda = (valor) => {
    let texto = String(valor ?? '');
    if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
    return `"${texto.replace(/"/g, '""')}"`;
};

// GET /api/auditoria/exportar -> mismo filtro, hasta 5.000 registros, listo para abrir en Excel
router.get('/exportar', auth, soloAdmin, async (req, res) => {
    try {
        const registros = await Auditoria.find(construirFiltro(req.query)).sort({ createdAt: -1 }).limit(5000).lean();
        const filas = [['Fecha', 'Usuario', 'Correo', 'Acción', 'Sección', 'Elemento']];
        for (const r of registros) {
            filas.push([
                new Date(r.createdAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Tucuman' }),
                r.usuarioNombre, r.usuarioEmail, r.accion, r.entidad, r.detalle
            ]);
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="auditoria.csv"');
        res.send('\uFEFF' + filas.map((f) => f.map(celda).join(';')).join('\r\n'));
    } catch (error) {
        console.error('Error al exportar auditoría:', error);
        res.status(500).json({ mensaje: 'Error al exportar la auditoría' });
    }
});

module.exports = router;
