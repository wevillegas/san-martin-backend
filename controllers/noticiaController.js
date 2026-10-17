const Noticia = require('../models/Noticia');
const { describirError } = require('../utils/errores');
const Usuario = require('../models/Usuario');

// Lo que ve el público: sin borrar, sin borradores y sin las programadas para más adelante
const visiblesAlPublico = () => ({
    eliminadoEn: null,
    estado: { $ne: 'borrador' },
    $or: [{ publicarEn: null }, { publicarEn: { $lte: new Date() } }]
});

// 1. CREAR (POST) - Publicar una nueva noticia
exports.crearNoticia = async (req, res) => {
    try {
        if (req.file) {
            req.body.imagenUrl = req.file.path;
        }

        // Si no se escribe autor, firma con el nombre del administrador que publica
        if (!req.body.autor || !req.body.autor.trim()) {
            const usuario = await Usuario.findById(req.usuario.id, 'nombre').lean();
            if (usuario) req.body.autor = usuario.nombre;
            else delete req.body.autor;
        }

        const nuevaNoticia = new Noticia(req.body);
        await nuevaNoticia.save();
        res.status(201).json({
            mensaje: '¡Noticia publicada con éxito!',
            noticia: nuevaNoticia
        });
    } catch (error) {
        const detalle = describirError(error);
        if (detalle) return res.status(detalle.status).json({ mensaje: detalle.mensaje });
        console.error('Error al crear noticia:', error);
        res.status(500).json({ mensaje: 'Error al publicar la noticia', error: error.message });
    }
};

// 2. LEER TODAS (GET) - Feed de noticias para el Home
exports.obtenerNoticias = async (req, res) => {
    try {
        // LA MAGIA ACÁ: Ordenamos por 'destacado' (descendente: true primero) y luego por 'createdAt' (las más nuevas primero)
        const noticias = await Noticia.find(req.usuario && req.query.todas === '1' ? { eliminadoEn: null } : visiblesAlPublico()).sort({ destacado: -1, createdAt: -1 });
        res.json(noticias);
    } catch (error) {
        console.error('Error al obtener noticias:', error);
        res.status(500).json({ mensaje: 'Error al obtener las noticias' });
    }
};

// 3. LEER UNA SOLA (GET) - Para cuando el usuario hace clic y entra a leer el artículo
exports.obtenerNoticiaPorId = async (req, res) => {
    try {
        const noticia = await Noticia.findOne(req.usuario ? { _id: req.params.id, eliminadoEn: null } : { _id: req.params.id, ...visiblesAlPublico() });

        if (!noticia) {
            return res.status(404).json({ mensaje: 'Noticia no encontrada' });
        }

        res.json(noticia);
    } catch (error) {
        console.error('Error al obtener la noticia:', error);
        res.status(500).json({ mensaje: 'Hubo un error al buscar la noticia' });
    }
};

// 4. ACTUALIZAR (PUT) - Para editar un error o agregar info a una noticia
exports.actualizarNoticia = async (req, res) => {
    try {
        if (typeof req.body.autor === 'string' && !req.body.autor.trim()) delete req.body.autor;

        if (req.file) {
            req.body.imagenUrl = req.file.path;
        }

        const noticiaActualizada = await Noticia.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!noticiaActualizada) {
            return res.status(404).json({ mensaje: 'Noticia no encontrada para actualizar' });
        }

        res.json({ mensaje: 'Noticia actualizada correctamente', noticia: noticiaActualizada });
    } catch (error) {
        const detalle = describirError(error);
        if (detalle) return res.status(detalle.status).json({ mensaje: detalle.mensaje });
        console.error('Error al actualizar noticia:', error);
        res.status(500).json({ mensaje: 'Hubo un error al actualizar', error: error.message });
    }
};

// 5. ELIMINAR (DELETE) - Para dar de baja un artículo
exports.eliminarNoticia = async (req, res) => {
    try {
        const noticiaEliminada = await Noticia.findOneAndUpdate({ _id: req.params.id, eliminadoEn: null }, { eliminadoEn: new Date() });

        if (!noticiaEliminada) {
            return res.status(404).json({ mensaje: 'Noticia no encontrada para eliminar' });
        }

        res.json({ mensaje: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        res.status(500).json({ mensaje: 'Hubo un error al eliminar', error: error.message });
    }
};