const authService = require('../service/auth.service');

const handleError = (error, res, operation) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(`Error en ${operation}:`, error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

const register = async (req, res) => {
  try {
    const usuario = await authService.register(req.body);
    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario,
    });
  } catch (error) {
    return handleError(error, res, 'register');
  }
};

const login = async (req, res) => {
  try {
    const resultado = await authService.login(req.body);
    return res.json({
      mensaje: 'Inicio de sesión exitoso',
      ...resultado,
    });
  } catch (error) {
    return handleError(error, res, 'login');
  }
};

module.exports = { register, login };
