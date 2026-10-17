const cloudinary = require('cloudinary').v2;
const Noticia = require('../models/Noticia');
const Jugador = require('../models/Jugador');
const CuerpoTecnico = require('../models/CuerpoTecnico');
const Producto = require('../models/Producto');

const TIPOS = {
    noticias: { modelo: Noticia, titulo: (d) => d.titulo },
    jugadores: { modelo: Jugador, titulo: (d) => `${d.nombre} ${d.apellido}` },
    'cuerpo-tecnico': { modelo: CuerpoTecnico, titulo: (d) => `${d.nombre} ${d.apellido}` },
    productos: { modelo: Producto, titulo: (d) => d.nombre }
};

// Borra la foto de Cloudinary a partir de su URL (si falla no frena la baja)
const borrarImagen = async (url) => {
    const publicId = url && url.includes('cloudinary') && url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i)?.[1];
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('No se pudo borrar la imagen de Cloudinary:', error.message);
    }
};

// GET /api/papelera -> todo lo eliminado, lo más reciente primero
exports.listar = async (req, res) => {
    try {
        const grupos = await Promise.all(
            Object.entries(TIPOS).map(async ([tipo, { modelo, titulo }]) => {
                const docs = await modelo.find({ eliminadoEn: { $ne: null } }).lean();
                return docs.map((d) => ({ tipo, id: d._id, titulo: titulo(d), imagenUrl: d.imagenUrl, eliminadoEn: d.eliminadoEn }));
            })
        );
        res.json(grupos.flat().sort((a, b) => new Date(b.eliminadoEn) - new Date(a.eliminadoEn)));
    } catch (error) {
        console.error('Error al leer la papelera:', error);
        res.status(500).json({ mensaje: 'Error al obtener la papelera' });
    }
};

// POST /api/papelera/:tipo/:id/restaurar
exports.restaurar = async (req, res) => {
    try {
        const tipo = TIPOS[req.params.tipo];
        if (!tipo) return res.status(404).json({ mensaje: 'Tipo desconocido' });
        const doc = await tipo.modelo.findOneAndUpdate({ _id: req.params.id, eliminadoEn: { $ne: null } }, { eliminadoEn: null });
        if (!doc) return res.status(404).json({ mensaje: 'No está en la papelera' });
        res.json({ mensaje: 'Restaurado correctamente' });
    } catch (error) {
        console.error('Error al restaurar:', error);
        res.status(400).json({ mensaje: 'No se pudo restaurar' });
    }
};

// DELETE /api/papelera/:tipo/:id -> baja definitiva (solo de lo que ya está en la papelera)
exports.eliminarDefinitivo = async (req, res) => {
    try {
        const tipo = TIPOS[req.params.tipo];
        if (!tipo) return res.status(404).json({ mensaje: 'Tipo desconocido' });
        const doc = await tipo.modelo.findOneAndDelete({ _id: req.params.id, eliminadoEn: { $ne: null } });
        if (!doc) return res.status(404).json({ mensaje: 'No está en la papelera' });
        await borrarImagen(doc.imagenUrl);
        res.json({ mensaje: 'Eliminado definitivamente' });
    } catch (error) {
        console.error('Error al eliminar definitivamente:', error);
        res.status(400).json({ mensaje: 'No se pudo eliminar' });
    }
};
