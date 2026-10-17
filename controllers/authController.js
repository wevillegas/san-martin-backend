const Usuario = require('../models/Usuario');
const Auditoria = require('../models/Auditoria');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ROLES = ['administrador', 'editor'];

// El token lleva id, nombre y rol solo para que el panel sepa qué mostrar; el servidor nunca confía en el rol del token
const firmarToken = (usuario, callback) =>
    jwt.sign(
        { usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol } },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // expira en 1 hora por seguridad; el panel lo renueva mientras se trabaja
        callback
    );

// 1. REGISTRAR un nuevo usuario del panel (solo lo puede hacer un administrador)
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const rol = req.body.rol === undefined ? 'editor' : req.body.rol; // sin rol explícito: el de menos permisos

        if (typeof nombre !== 'string' || !nombre.trim() || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ mensaje: 'Nombre o correo inválido' });
        }
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ mensaje: 'La clave debe tener al menos 8 caracteres' });
        }
        if (!ROLES.includes(rol)) {
            return res.status(400).json({ mensaje: 'El rol elegido no es válido' });
        }

        // Verificamos si el correo ya existe en la base de datos
        if (await Usuario.findOne({ email: email.toLowerCase() })) {
            return res.status(400).json({ mensaje: 'Ya existe una cuenta con ese correo' });
        }

        // La contraseña se encripta sola por el modelo
        await new Usuario({ nombre, email, password, rol }).save();

        res.status(201).json({ mensaje: 'Cuenta creada con éxito' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ mensaje: 'Error al registrar el usuario' });
    }
};

// 2. INICIAR SESIÓN (Login)
exports.loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Solo texto: un objeto como { "$ne": null } no se puede colar en la consulta
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // Mismo mensaje si falla el correo o la clave, para no revelar qué correos existen
        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        const passwordCorrecto = usuario && (await bcrypt.compare(password, usuario.password));
        if (!passwordCorrecto) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // Auditoría: queda registrado quién inició sesión
        Auditoria.create({ usuarioId: usuario._id, usuarioNombre: usuario.nombre, usuarioEmail: usuario.email, accion: 'login', entidad: 'auth' })
            .catch((e) => console.error('No se pudo registrar el login:', e.message));

        firmarToken(usuario, (error, token) => {
            if (error) {
                console.error('Error al firmar el token:', error);
                return res.status(500).json({ mensaje: 'Error al iniciar sesión' });
            }
            res.json({ mensaje: 'Inicio de sesión exitoso', token });
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};

// 3. RENOVAR la sesión (POST /api/auth/renovar): un token vigente a cambio de uno nuevo
exports.renovarToken = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id, 'nombre rol');
        if (!usuario) return res.status(401).json({ mensaje: 'La cuenta ya no existe' });

        firmarToken(usuario, (error, token) => {
            if (error) return res.status(500).json({ mensaje: 'No se pudo renovar la sesión' });
            res.json({ token });
        });
    } catch (error) {
        console.error('Error al renovar sesión:', error);
        res.status(500).json({ mensaje: 'Error al renovar la sesión' });
    }
};

exports.firmarToken = firmarToken;
exports.ROLES = ROLES;
