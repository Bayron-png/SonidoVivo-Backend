const usuarioRepository = require('../repository/usuario.repository');
const usuarioModel = require('../model/usuario.model');
const AppError = require('./app-error');

const listarUsuarios = async () => {
  const usuarios = await usuarioRepository.listarUsuarios();
  return usuarios.map(usuarioModel.desdeFila);
};

const actualizarUsuario = async (id, cambios) => {
  const usuario = await usuarioRepository.actualizarUsuario(id, cambios);
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return usuarioModel.desdeFila(usuario);
};

const eliminarUsuario = async (id) => {
  const usuario = await usuarioRepository.desactivarUsuario(id);
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return usuarioModel.desdeFila(usuario);
};

module.exports = {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
};
