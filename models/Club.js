const mongoose = require('mongoose');

// Un solo documento con las cifras que se muestran en varias páginas del sitio
const clubSchema = new mongoose.Schema({
    capacidadCiudadela: { type: Number, default: 27000, min: 0 },
    cantidadSocios: { type: Number, default: 15000, min: 0 },
    copasNacionales: { type: Number, default: 1, min: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
