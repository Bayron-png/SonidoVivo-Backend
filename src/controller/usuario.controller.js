const usuarioService = require('../service/usuario.service');

const handleError = (error, res, operation) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(`Error al ${operation}:`, error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    return res.json(usuarios);
  } catch (error) {
    return handleError(error, res, 'listar usuarios');
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(
      req.params.id
    );

    return res.json(usuario);
  } catch (error) {
    return handleError(error, res, 'obtener usuario');
  }
};

const crearUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);

    return res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario,
    });
  } catch (error) {
    return handleError(error, res, 'crear usuario');
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
    return res.json({
      mensaje: 'Usuario actualizado',
      usuario,
    });
  } catch (error) {
    return handleError(error, res, 'actualizar usuario');
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.eliminarUsuario(req.params.id);
    return res.json({
      mensaje: 'Usuario desactivado correctamente',
      usuario,
    });
  } catch (error) {
    return handleError(error, res, 'desactivar usuario');
  }
};

const activarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.activarUsuario(req.params.id);
    return res.json({
      mensaje: 'Usuario activado correctamente',
      usuario,
    });
  } catch (error) {
    return handleError(error, res, 'activar usuario');
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  activarUsuario,
};
