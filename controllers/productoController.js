const Producto = require('../models/Producto');
const { describirError } = require('../utils/errores');

// 1. CREAR (POST) - Con escudo contra duplicados
exports.crearProducto = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Buscamos si ya existe un producto con el mismo nombre
        const productoExistente = await Producto.findOne({ nombre: String(nombre), eliminadoEn: null });

        if (productoExistente) {
            return res.status(400).json({
                mensaje: `El producto "${nombre}" ya existe en la tienda.`
            });
        }

        // Si el middleware de Cloudinary procesó la foto, guardamos la URL
        if (req.file) {
            req.body.imagenUrl = req.file.path;
        }

        const nuevoProducto = new Producto({ ...req.body, creadoPor: req.usuario.id });
        await nuevoProducto.save();

        res.status(201).json({
            mensaje: '¡Producto creado con éxito en el Santo Store!',
            producto: nuevoProducto
        });
    } catch (error) {
        const detalle = describirError(error);
        if (detalle) return res.status(detalle.status).json({ mensaje: detalle.mensaje });
        console.error('Error al crear producto:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                mensaje: 'Error de validación en los datos',
                error: error.message
            });
        }

        res.status(500).json({
            mensaje: 'Hubo un error al crear el producto en el servidor'
        });
    }
};

// 2. LEER TODOS (GET)
exports.obtenerProductos = async (req, res) => {
    try {
        const consulta = Producto.find({ eliminadoEn: null }).sort({ createdAt: -1 });
        const productos = await (req.usuario ? consulta.populate('creadoPor', 'nombre') : consulta);
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ mensaje: 'Hubo un error al obtener la tienda' });
    }
};

// 3. LEER UNO SOLO (GET)
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.findOne({ _id: req.params.id, eliminadoEn: null });
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ mensaje: 'Hubo un error al buscar el producto' });
    }
};

// 4. ACTUALIZAR (PUT)
exports.actualizarProducto = async (req, res) => {
    try {
        // Si subieron una imagen nueva, pisamos la anterior
        if (req.file) {
            req.body.imagenUrl = req.file.path;
        }

        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        res.json(productoActualizado);
    } catch (error) {
        const detalle = describirError(error);
        if (detalle) return res.status(detalle.status).json({ mensaje: detalle.mensaje });
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
};

// 5. ELIMINAR (DELETE)
exports.eliminarProducto = async (req, res) => {
    try {
        const productoEliminado = await Producto.findOneAndUpdate({ _id: req.params.id, eliminadoEn: null }, { eliminadoEn: new Date() });
        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado para eliminar' });
        }
        res.json({ mensaje: 'Producto eliminado de la tienda correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ mensaje: 'Hubo un error al eliminar' });
    }
};