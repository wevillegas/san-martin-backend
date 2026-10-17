const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true, // No puede haber dos cuentas con el mismo correo
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    // administrador: todo. editor: crea y edita contenido, pero no elimina ni administra (las cuentas anteriores quedan como administrador)
    rol: {
        type: String,
        enum: ['administrador', 'editor'],
        default: 'administrador'
    },
    // Los tokens emitidos antes de esta fecha dejan de valer (cierra las sesiones al cambiar la clave)
    claveCambiadaEn: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// "Hook" (gancho) que se ejecuta ANTES de guardar en la base de datos
usuarioSchema.pre('save', async function() {
    // Si la contraseña no fue modificada, cortamos la ejecución acá (ya no usamos next)
    if (!this.isModified('password')) {
        return; 
    }
    
    // Generamos un "salt" (texto aleatorio para dar más seguridad) y encriptamos
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Usuario', usuarioSchema);