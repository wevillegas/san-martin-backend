const Usuario = require('../models/Usuario');
const Auditoria = require('../models/Auditoria');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRAR un nuevo administrador
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (typeof nombre !== 'string' || !nombre.trim() || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ mensaje: 'Nombre o correo inválido' });
        }
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ mensaje: 'La clave debe tener al menos 8 caracteres' });
        }

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

        // Auditoría: queda registrado quién inició sesión
        Auditoria.create({ usuarioId: usuario._id, usuarioNombre: usuario.nombre, usuarioEmail: usuario.email, accion: 'login', entidad: 'auth' })
            .catch((e) => console.error('No se pudo registrar el login:', e.message));

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

// 3. RENOVAR la sesión (POST /api/auth/renovar): un token vigente a cambio de uno nuevo, si el usuario sigue existiendo
exports.renovarToken = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id, '_id');
        if (!usuario) return res.status(401).json({ mensaje: 'La cuenta ya no existe' });

        jwt.sign({ usuario: { id: usuario._id } }, process.env.JWT_SECRET, { expiresIn: '1h' }, (error, token) => {
            if (error) return res.status(500).json({ mensaje: 'No se pudo renovar la sesión' });
            res.json({ token });
        });
    } catch (error) {
        console.error('Error al renovar sesión:', error);
        res.status(500).json({ mensaje: 'Error al renovar la sesión' });
    }
};
