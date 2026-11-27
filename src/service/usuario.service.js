
const usuarioRepository = require('../repository/usuario.repository');
const usuarioModel = require('../model/usuario.model');
const AppError = require('./app-error');

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAMPOS_PERMITIDOS = ['nombre', 'correo', 'rol_id'];

const validarId = (id) => {
  if (!/^[1-9]\d*$/.test(String(id)) ||
      !Number.isSafeInteger(Number(id))) {
    throw new AppError('El ID debe ser un entero positivo', 400);
  }
};

const validarCambios = async (cambios) => {
  if (!cambios || typeof cambios !== 'object' ||
      Array.isArray(cambios)) {
    throw new AppError('Debe enviar un objeto de usuario', 400);
  }

  const campos = Object.keys(cambios);

  if (campos.length === 0 ||
      campos.some(campo => !CAMPOS_PERMITIDOS.includes(campo))) {
    throw new AppError('Campos de actualización inválidos', 400);
  }

  const datos = {};

  if ('nombre' in cambios) {
    if (typeof cambios.nombre !== 'string' ||
        !cambios.nombre.trim() ||
        cambios.nombre.trim().length > 100) {
      throw new AppError('El nombre no es válido', 400);
    }
    datos.nombre = cambios.nombre.trim();
  }

  if ('correo' in cambios) {
    if (typeof cambios.correo !== 'string' ||
        cambios.correo.length > 150 ||
        !CORREO_VALIDO.test(cambios.correo.trim())) {
      throw new AppError('El correo no es válido', 400);
    }
    datos.correo = cambios.correo.trim();
  }

  if ('rol_id' in cambios) {
    if (!Number.isInteger(cambios.rol_id) ||
        cambios.rol_id <= 0) {
      throw new AppError('El rol debe ser un ID válido', 400);
    }

    const existe = await usuarioRepository.existeRol(cambios.rol_id);

    if (!existe) {
      throw new AppError('El rol no existe', 400);
    }

    datos.rol_id = cambios.rol_id;
  }

  return datos;
};

const listarUsuarios = async () => {
  const usuarios = await usuarioRepository.listarUsuarios();
  return usuarios.map(usuarioModel.desdeFila);
};

const actualizarUsuario = async (id, cambios) => {
  validarId(id);
  const datos = await validarCambios(cambios);

  try {
    const usuario = await usuarioRepository.actualizarUsuario(id, datos);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return usuarioModel.desdeFila(usuario);
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('El correo ya está registrado', 409);
    }
    throw error;
  }
};

const eliminarUsuario = async (id) => {
  validarId(id);

  const usuario = await usuarioRepository.desactivarUsuario(id);

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return usuarioModel.desdeFila(usuario);
};

const activarUsuario = async (id) => {
  validarId(id);

  const usuario = await usuarioRepository.activarUsuario(id);

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return usuarioModel.desdeFila(usuario);
};

module.exports = {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  activarUsuario,
};
