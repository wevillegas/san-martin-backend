const Autoridad = require('../models/Autoridad');
const { describirError } = require('../utils/errores');

// GET /api/autoridades (público) -> en el orden definido en el panel
exports.obtener = async (req, res) => {
    try {
        const consulta = Autoridad.find({ eliminadoEn: null }).sort({ orden: 1, createdAt: 1 });
        res.json(await (req.usuario ? consulta.populate('creadoPor', 'nombre') : consulta));
    } catch (error) {
        console.error('Error al obtener autoridades:', error);
        res.status(500).json({ mensaje: 'Error al obtener las autoridades' });
    }
};

// POST /api/autoridades -> va al final de la lista
exports.crear = async (req, res) => {
    try {
        const { cargo, nombre } = req.body;
        const ultima = await Autoridad.findOne({ eliminadoEn: null }).sort({ orden: -1 }).lean();
        const autoridad = await Autoridad.create({ cargo, nombre, creadoPor: req.usuario.id, orden: (ultima?.orden ?? -1) + 1 });
        res.status(201).json(autoridad);
    } catch (error) {
        const detalle = describirError(error);
        if (detalle) return res.status(detalle.status).json({ mensaje: detalle.mensaje });
        res.status(400).json({ mensaje: 'Revisá el cargo y el nombre', error: error.message });
    }
};

// POST /api/autoridades/importar -> carga una lista inicial, solo si todavía no hay ninguna
exports.importar = async (req, res) => {
    try {
        if (await Autoridad.countDocuments({ eliminadoEn: null })) {
            return res.status(400).json({ mensaje: 'Ya hay autoridades cargadas' });
        }
        const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 100) : [];
        const creadas = await Autoridad.insertMany(
            items.map((i, orden) => ({ cargo: String(i.cargo), nombre: String(i.nombre), orden }))
        );
        res.status(201).json({ mensaje: `Se cargaron ${creadas.length} autoridades` });
    } catch (error) {
        res.status(400).json({ mensaje: 'No se pudo importar la lista', error: error.message });
    }
};

// PUT /api/autoridades/orden -> { ids: [...] } con el orden nuevo
exports.reordenar = async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids.map(String) : [];
        await Autoridad.bulkWrite(ids.map((id, orden) => ({ updateOne: { filter: { _id: id }, update: { orden } } })));
        res.json({ mensaje: 'Orden actualizado' });
    } catch (error) {
        res.status(400).json({ mensaje: 'No se pudo cambiar el orden' });
    }
};

// PUT /api/autoridades/:id
exports.actualizar = async (req, res) => {
    try {
        const { cargo, nombre } = req.body;
        const autoridad = await Autoridad.findOneAndUpdate(
            { _id: req.params.id, eliminadoEn: null }, { cargo, nombre }, { returnDocument: 'after', runValidators: true }
        );
        if (!autoridad) return res.status(404).json({ mensaje: 'Autoridad no encontrada' });
        res.json(autoridad);
    } catch (error) {
        const detalle = describirError(error);
        if (detalle) return res.status(detalle.status).json({ mensaje: detalle.mensaje });
        res.status(400).json({ mensaje: 'Revisá el cargo y el nombre', error: error.message });
    }
};

// DELETE /api/autoridades/:id -> va a la papelera
exports.eliminar = async (req, res) => {
    try {
        const autoridad = await Autoridad.findOneAndUpdate({ _id: req.params.id, eliminadoEn: null }, { eliminadoEn: new Date() });
        if (!autoridad) return res.status(404).json({ mensaje: 'Autoridad no encontrada' });
        res.json({ mensaje: 'Autoridad eliminada' });
    } catch (error) {
        res.status(400).json({ mensaje: 'No se pudo eliminar' });
    }
};
