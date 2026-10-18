const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    eliminadoEn: { type: Date, default: null }, // papelera: fecha de baja (null = visible)
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null }, // quién lo creó (los editores solo tocan lo suyo)
    nombre: { type: String, required: true },
    categoria: { 
        type: String, 
        required: true,
        enum: ['Indumentaria', 'Accesorios', 'Entrenamiento', 'Salida'] 
    },
    precio: { type: Number, required: true },
    linkExterno: { type: String, required: true },
    imagenUrl: { type: String }, // Acá se guardará el link de Cloudinary
    destacado: { type: Boolean, default: false },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Producto', ProductoSchema);