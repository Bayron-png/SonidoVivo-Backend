const jwt = require('jsonwebtoken');
const authRepository = require('../repository/auth.repository');

const verificarToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  const match = authHeader?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({
      error: 'Se requiere un token de autenticación'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está configurado');

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }

  let payload;

  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }

  if (!Number.isSafeInteger(payload.id) || payload.id <= 0) {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  try {
    const usuario = await authRepository.buscarUsuarioActivoPorId(
      payload.id
    );

    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario inexistente o desactivado'
      });
    }

    req.usuario = usuario;

    return next();
  } catch (error) {
    return next(error);
  }
};

const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'No tiene permisos para esta operación'
      });
    }

    return next();
  };
};

module.exports = {
  verificarToken,
  autorizarRoles
};