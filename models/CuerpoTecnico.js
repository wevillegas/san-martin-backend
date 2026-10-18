const mongoose = require('mongoose');

const cuerpoTecnicoSchema = new mongoose.Schema({
    eliminadoEn: { type: Date, default: null }, // papelera: fecha de baja (null = visible)
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null }, // quién lo creó (los editores solo tocan lo suyo)
    nombre: { 
        type: String, 
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    apellido: { 
        type: String, 
        required: [true, 'El apellido es obligatorio'],
        trim: true
    },
    rol: { 
        type: String, 
        required: [true, 'El rol es obligatorio'],
        enum: ['Director Técnico', 'Ayudante de Campo', 'Preparador Físico', 'Entrenador de Arqueros', 'Cuerpo Médico', 'Utillero', 'Analista de Video'],
        default: 'Ayudante de Campo'
    },
    fechaNacimiento: { 
        type: Date 
    },
    imagenUrl: { 
        type: String 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('CuerpoTecnico', cuerpoTecnicoSchema);