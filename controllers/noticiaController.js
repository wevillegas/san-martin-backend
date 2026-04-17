const Noticia = require('../models/Noticia');

// 1. CREAR (POST) - Publicar una nueva noticia
exports.crearNoticia = async (req, res) => {
    try {
        const nuevaNoticia = new Noticia(req.body);
        await nuevaNoticia.save();
        res.status(201).json({ 
            mensaje: '¡Noticia publicada con éxito!', 
            noticia: nuevaNoticia 
        });
    } catch (error) {
        console.error('Error al crear noticia:', error);
        res.status(500).json({ mensaje: 'Error al publicar la noticia', error: error.message });
    }
};

// 2. LEER TODAS (GET) - Feed de noticias para el Home
exports.obtenerNoticias = async (req, res) => {
    try {
        // Buscamos todas y las ordenamos por fecha de creación (de más nueva a más vieja)
        const noticias = await Noticia.find().sort({ createdAt: -1 }); 
        res.json(noticias);
    } catch (error) {
        console.error('Error al obtener noticias:', error);
        res.status(500).json({ mensaje: 'Error al obtener las noticias' });
    }
};

// 3. LEER UNA SOLA (GET) - Para cuando el usuario hace clic y entra a leer el artículo
exports.obtenerNoticiaPorId = async (req, res) => {
    try {
        const noticia = await Noticia.findById(req.params.id);
        
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
        const noticiaActualizada = await Noticia.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );

        if (!noticiaActualizada) {
            return res.status(404).json({ mensaje: 'Noticia no encontrada para actualizar' });
        }

        res.json({ mensaje: 'Noticia actualizada correctamente', noticia: noticiaActualizada });
    } catch (error) {
        console.error('Error al actualizar noticia:', error);
        res.status(500).json({ mensaje: 'Hubo un error al actualizar', error: error.message });
    }
};

// 5. ELIMINAR (DELETE) - Para dar de baja un artículo
exports.eliminarNoticia = async (req, res) => {
    try {
        const noticiaEliminada = await Noticia.findByIdAndDelete(req.params.id);

        if (!noticiaEliminada) {
            return res.status(404).json({ mensaje: 'Noticia no encontrada para eliminar' });
        }

        res.json({ mensaje: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        res.status(500).json({ mensaje: 'Hubo un error al eliminar', error: error.message });
    }
};