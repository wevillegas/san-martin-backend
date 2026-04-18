const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRAR un nuevo administrador
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificamos si el correo ya existe en la base de datos
        let usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ mensaje: 'El usuario ya existe' });
        }

        // Creamos el nuevo usuario (la contraseña se encripta sola por el modelo)
        const nuevoUsuario = new Usuario({ nombre, email, password });
        await nuevoUsuario.save();

        res.status(201).json({ mensaje: 'Administrador creado con éxito' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ mensaje: 'Error al registrar el usuario' });
    }
};

// 2. INICIAR SESIÓN (Login)
exports.loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar si el usuario existe por su email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas (email incorrecto)' });
        }

        // 2. Comparar la contraseña enviada con la encriptada en la base de datos
        const passwordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecto) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas (contraseña incorrecta)' });
        }

        // 3. Si todo está bien, creamos el Token (Pase VIP)
        const payload = {
            usuario: { id: usuario._id } // Guardamos el ID del usuario adentro del token
        };

        // Firmamos el token con la palabra secreta de nuestro .env
        // Le ponemos que expire en 1 hora (1h) por seguridad
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (error, token) => {
                if (error) throw error;
                // Devolvemos el token al frontend/Postman
                res.json({ mensaje: 'Inicio de sesión exitoso', token });
            }
        );

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};