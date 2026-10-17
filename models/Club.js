const mongoose = require('mongoose');

// Cuotas de socios que muestra la página de Socios (los valores de abajo son los que ya figuraban en el sitio)
const cuotaSchema = new mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre de la cuota es obligatorio'], trim: true },
    edades: { type: String, default: '', trim: true },
    precio: { type: Number, required: [true, 'El precio de la cuota es obligatorio'], min: 0 },
    destacada: { type: Boolean, default: false },
    ventajas: { type: [String], default: [] }
}, { _id: false });

const CUOTAS_POR_DEFECTO = [
    {
        nombre: 'Socio Tucumán (Activo)', edades: 'Mayores de 18 años', precio: 25000, destacada: true,
        ventajas: ['Entradas a mitad de precio', 'Voz y voto en asambleas', 'Descuento en tienda oficial', 'Prioridad en plateas', 'Acceso al Complejo']
    },
    {
        nombre: 'Socio Filial (Interior)', edades: '+50km de la Capital', precio: 15000, destacada: false,
        ventajas: ['Entradas a mitad de precio', 'Voz y voto en asambleas', 'Descuento en tienda oficial', 'Gestión vía Filiales']
    }
];

// Un solo documento con los datos del sitio que cambian de vez en cuando
const clubSchema = new mongoose.Schema({
    capacidadCiudadela: { type: Number, default: 27000, min: 0 },
    cantidadSocios: { type: Number, default: 15000, min: 0 },
    copasNacionales: { type: Number, default: 1, min: 0 },
    cuotas: { type: [cuotaSchema], default: () => CUOTAS_POR_DEFECTO },
    horariosMuseo: {
        lineas: { type: [String], default: ['Lunes a Viernes: 9:00 - 17:00', 'Sábado: 9:00 - 13:00'] },
        aviso: { type: String, default: 'Cerrado los Domingos y días de partido' },
        resumen: { type: String, default: 'Lun a Sáb desde las 9:00' } // la versión corta de la cabecera
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
