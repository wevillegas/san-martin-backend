// Quita del cuerpo los campos que solo maneja el servidor, para que ningún formulario los pueda forzar
// (por ejemplo `eliminadoEn`, que mandaría algo a la papelera sin pasar por el permiso de eliminar).
// Va después de multer, que es quien llena req.body en los formularios con foto.
const PROTEGIDOS = ['_id', '__v', 'eliminadoEn', 'creadoPor', 'createdAt', 'updatedAt'];

module.exports = (req, res, next) => {
    if (req.body && typeof req.body === 'object') PROTEGIDOS.forEach((campo) => delete req.body[campo]);
    next();
};
