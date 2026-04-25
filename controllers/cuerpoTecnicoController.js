const CuerpoTecnico = require('../models/CuerpoTecnico');

// CREAR
exports.crearMiembro = async (req, res) => {
    try {
        if (req.file) {
            req.body.imagenUrl = req.file.path;
        }
        const nuevoMiembro = new CuerpoTecnico(req.body);
        await nuevoMiembro.save();
        res.status(201).json(nuevoMiembro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear al miembro del CT' });
    }
};

// LEER TODOS
exports.obtenerCuerpoTecnico = async (req, res) => {
    try {
        const ct = await CuerpoTecnico.find();
        res.json(ct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el cuerpo técnico' });
    }
};

// LEER UNO
exports.obtenerMiembroPorId = async (req, res) => {
    try {
        const miembro = await CuerpoTecnico.findById(req.params.id);
        if (!miembro) return res.status(404).json({ mensaje: 'Miembro no encontrado' });
        res.json(miembro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar al miembro' });
    }
};

// ACTUALIZAR
exports.actualizarMiembro = async (req, res) => {
    try {
        if (req.file) {
            req.body.imagenUrl = req.file.path;
        }
        const miembroActualizado = await CuerpoTecnico.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after' }
        );
        if (!miembroActualizado) return res.status(404).json({ mensaje: 'Miembro no encontrado' });
        res.json(miembroActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar al miembro' });
    }
};

// ELIMINAR
exports.eliminarMiembro = async (req, res) => {
    try {
        const miembroEliminado = await CuerpoTecnico.findByIdAndDelete(req.params.id);
        if (!miembroEliminado) return res.status(404).json({ mensaje: 'Miembro no encontrado' });
        res.json({ mensaje: 'Miembro eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar al miembro' });
    }
};