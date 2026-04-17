const Jugador = require('../models/Jugador');

// 1. CREAR (POST) - La que ya probaste y funciona
exports.crearJugador = async (req, res) => {
    try {
        const nuevoJugador = new Jugador(req.body);
        await nuevoJugador.save();
        res.status(201).json({ 
            mensaje: '¡Jugador del Santo creado con éxito!', 
            jugador: nuevoJugador 
        });
    } catch (error) {
        console.error('Error al crear jugador:', error);
        res.status(500).json({ mensaje: 'Hubo un error al crear el jugador', error: error.message });
    }
};

// 2. LEER TODOS (GET) - Para pedir la lista completa del plantel
exports.obtenerJugadores = async (req, res) => {
    try {
        const jugadores = await Jugador.find(); 
        res.json(jugadores);
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
        res.status(500).json({ mensaje: 'Hubo un error al obtener el plantel' });
    }
};

// 3. LEER UNO SOLO (GET) - Para ver el detalle de un solo jugador
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

// 4. ACTUALIZAR (PUT) - Para modificar datos de un jugador existente
exports.actualizarJugador = async (req, res) => {
    try {
        // Buscamos por ID y actualizamos con los datos nuevos (req.body)
        // { new: true } nos devuelve el jugador ya modificado en lugar del viejo
        const jugadorActualizado = await Jugador.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );

        if (!jugadorActualizado) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado para actualizar' });
        }

        res.json({ mensaje: 'Datos actualizados correctamente', jugador: jugadorActualizado });
    } catch (error) {
        console.error('Error al actualizar jugador:', error);
        res.status(500).json({ mensaje: 'Hubo un error al actualizar', error: error.message });
    }
};

// 5. ELIMINAR (DELETE) - Para borrar a un jugador que se va del club
exports.eliminarJugador = async (req, res) => {
    try {
        const jugadorEliminado = await Jugador.findByIdAndDelete(req.params.id);

        if (!jugadorEliminado) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado para eliminar' });
        }

        res.json({ mensaje: 'Jugador eliminado del plantel correctamente' });
    } catch (error) {
        console.error('Error al eliminar jugador:', error);
        res.status(500).json({ mensaje: 'Hubo un error al eliminar', error: error.message });
    }
};