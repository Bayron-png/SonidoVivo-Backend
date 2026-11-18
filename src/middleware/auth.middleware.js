const jwt = require('jsonwebtoken');

const verificarTokenAdmin = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const match = authHeader?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({ error: 'Se requiere un token de autenticación' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está configurado');
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  try {
    req.usuario = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  if (req.usuario.rol !== 'Administrador') {
    return res.status(403).json({ error: 'No tiene permisos para esta operación' });
  }

  return next();
};

exports.verificarTokenAdmin = verificarTokenAdmin;