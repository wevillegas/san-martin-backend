// Convierte los errores de MongoDB/Mongoose en un mensaje en español que se le pueda mostrar a quien usa el panel.
// Devuelve { status, mensaje }, o null si no es un error de datos (ahí corresponde el 500 genérico).

const NOMBRES = {
    titulo: 'título', resumen: 'resumen', cuerpo: 'cuerpo', etiqueta: 'categoría', autor: 'autor', publicarEn: 'fecha de publicación',
    nombre: 'nombre', apellido: 'apellido', numeroCamiseta: 'dorsal', posicion: 'posición', altura: 'altura',
    fechaNacimiento: 'fecha de nacimiento', rol: 'rol', categoria: 'categoría', precio: 'precio', linkExterno: 'enlace de compra',
    cargo: 'cargo', email: 'correo', password: 'clave'
};
const nombreDe = (campo) => NOMBRES[campo] || campo;

// Los mensajes que escribimos en los modelos ya están en español; los de Mongoose por defecto no
const esPorDefecto = (mensaje = '') => /^Path `|is not a valid enum value|^Cast to|is shorter than|is longer than|is less than|is more than/.test(mensaje);

const traducirValidador = (e) => {
    if (!esPorDefecto(e.message)) return e.message;
    switch (e.kind) {
        case 'required': return `Falta completar el campo ${nombreDe(e.path)}`;
        case 'enum': return `El valor elegido en ${nombreDe(e.path)} no es válido`;
        case 'min': return `El valor de ${nombreDe(e.path)} es demasiado bajo`;
        case 'max': return `El valor de ${nombreDe(e.path)} es demasiado alto`;
        case 'minlength': return `El campo ${nombreDe(e.path)} es demasiado corto`;
        case 'maxlength': return `El campo ${nombreDe(e.path)} es demasiado largo`;
        default: return `El campo ${nombreDe(e.path)} no es válido`;
    }
};

exports.describirError = (error) => {
    if (!error) return null;

    if (error.name === 'ValidationError' && error.errors) {
        const mensajes = Object.values(error.errors).map((e) => (e.name === 'CastError' ? `El valor de ${nombreDe(e.path)} no es válido` : traducirValidador(e)));
        return { status: 400, mensaje: [...new Set(mensajes)].join('. ') };
    }
    if (error.name === 'CastError') {
        return { status: 400, mensaje: `El valor de ${nombreDe(error.path)} no es válido` };
    }
    if (error.code === 11000) {
        const campo = Object.keys(error.keyPattern || {})[0];
        return { status: 409, mensaje: campo ? `Ya existe un registro con ese ${nombreDe(campo)}` : 'Ya existe un registro con esos datos' };
    }
    return null;
};

// Errores de subida de archivos (multer)
exports.describirErrorDeArchivo = (error) => {
    const codigos = {
        LIMIT_FILE_SIZE: 'La foto pesa más de 5 MB. Elegí una más liviana.',
        LIMIT_UNEXPECTED_FILE: 'Se envió un archivo donde no corresponde.',
        LIMIT_FILE_COUNT: 'Solo se puede subir una foto por vez.'
    };
    return codigos[error.code] || `No se pudo subir el archivo: ${error.message}`;
};
