const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repository/auth.repository');
const usuarioModel = require('../model/usuario.model');
const AppError = require('./app-error');

const register = async ({ nombre, correo, password }) => {
  if (!nombre || !correo || !password) {
    throw new AppError(
      'Todos los campos son obligatorios (nombre, correo, password)',
      400
    );
  }

  const usuarioExistente = await authRepository.buscarUsuarioPorCorreo(correo);
  if (usuarioExistente) {
    throw new AppError('El correo ya está registrado', 409);
  }

  const rolCliente = await authRepository.buscarRolCliente();
  if (!rolCliente) {
    throw new AppError(
      'El rol Cliente no está configurado en la base de datos',
      500
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await authRepository.crearUsuario({
    nombre,
    correo,
    passwordHash,
    rolId: rolCliente.id,
  });

  return usuarioModel.desdeFila({
    ...usuario,
    rol: rolCliente.nombre,
  });
};

const login = async ({ correo, password }) => {
  if (!correo || !password) {
    throw new AppError('Debe ingresar correo y contraseña', 400);
  }

  const usuario = await authRepository.buscarUsuarioActivoPorCorreo(correo);
  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    }
  );

  return {
    token,
    usuario: usuarioModel.paraLogin(usuario),
  };
};

module.exports = {
  register,
  login,
};
