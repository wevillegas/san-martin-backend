const Jugador = require('../models/Jugador');

// 1. CREAR (POST) - Con escudo contra duplicados
// 1. CREAR (POST) - Con validación de triple coincidencia
exports.crearJugador = async (req, res) => {
    try {
        const { nombre, apellido, numeroCamiseta } = req.body;

        // Buscamos si existe UN registro que coincida en los 3 campos a la vez
        const jugadorIdentico = await Jugador.findOne({
            nombre: nombre,
            apellido: apellido,
            numeroCamiseta: numeroCamiseta
        });

        if (jugadorIdentico) {
            return res.status(400).json({
                mensaje: `El jugador ${nombre} ${apellido} con el dorsal ${numeroCamiseta} ya existe. No se pueden duplicar los tres datos.`
            });
        }

        // Si no existe esa combinación exacta, lo creamos
        const nuevoJugador = new Jugador(req.body);
        await nuevoJugador.save();

        res.status(201).json({
            mensaje: '¡Jugador del Santo creado con éxito!',
            jugador: nuevoJugador
        });
    } catch (error) {
        console.error('Error al crear jugador:', error);

        // Capturamos errores de validación (como el enum de las posiciones)
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                mensaje: 'Error de validación en los datos',
                error: error.message
            });
        }

        res.status(500).json({
            mensaje: 'Hubo un error al crear el jugador en el servidor'
        });
    }
};

// 2. LEER TODOS (GET) - Sin cambios, está perfecto
exports.obtenerJugadores = async (req, res) => {
    try {
        const jugadores = await Jugador.find().sort({ numeroCamiseta: 1 }); // Opcional: los trae ordenados por dorsal
        res.json(jugadores);
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
        res.status(500).json({ mensaje: 'Hubo un error al obtener el plantel' });
    }
};

// 3. LEER UNO SOLO (GET) - Sin cambios, está perfecto
exports.obtenerJugadorPorId = async (req, res) => {
    try {
        const jugador = await Jugador.findById(req.params.id);
        if (!jugador) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado' });
        }
        res.json(jugador);
    } catch (error) {
        console.error('Error al obtener el jugador:', error);
        res.status(500).json({ mensaje: 'Hubo un error al buscar al jugador' });
    }
};

// 4. ACTUALIZAR (PUT) - IMPORTANTE: activar validadores
exports.actualizarJugador = async (req, res) => {
    try {
        // { new: true } devuelve el nuevo objeto
        // { runValidators: true } obliga a Mongoose a chequear el enum de posición
        const jugadorActualizado = await Jugador.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!jugadorActualizado) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado para actualizar' });
        }

        res.json({ mensaje: 'Datos actualizados correctamente', jugador: jugadorActualizado });
    } catch (error) {
        console.error('Error al actualizar jugador:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ mensaje: 'Error de validación', error: error.message });
        }
        res.status(500).json({ mensaje: 'Hubo un error al actualizar' });
    }
};

// 5. ELIMINAR (DELETE) - Sin cambios, está perfecto
exports.eliminarJugador = async (req, res) => {
    try {
        const jugadorEliminado = await Jugador.findByIdAndDelete(req.params.id);
        if (!jugadorEliminado) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado para eliminar' });
        }
        res.json({ mensaje: 'Jugador eliminado del plantel correctamente' });
    } catch (error) {
        console.error('Error al eliminar jugador:', error);
        res.status(500).json({ mensaje: 'Hubo un error al eliminar' });
    }
};