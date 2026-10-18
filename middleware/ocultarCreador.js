// En las lecturas públicas no se muestra quién creó cada elemento: solo lo ven las cuentas con sesión (requiere authOpcional antes)
module.exports = (req, res, next) => {
    if (req.usuario) return next();
    const json = res.json.bind(res);
    res.json = (cuerpo) => json(JSON.parse(JSON.stringify(cuerpo, (clave, valor) => (clave === 'creadoPor' ? undefined : valor))));
    next();
};
