const mongoose = require('mongoose');

const cuerpoTecnicoSchema = new mongoose.Schema({
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