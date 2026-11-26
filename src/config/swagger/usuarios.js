const {
  parametroId,
  respuestaError,
  respuestasProtegidas,
  respuestaUsuario,
  seguridad,
} = require('./helpers');

module.exports = {
  '/usuarios': {
    get: {
      tags: ['Usuarios'],
      summary: 'Listar usuarios',
      security: seguridad,
      responses: {
        200: {
          description: 'Lista de usuarios',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } },
            },
          },
        },
        ...respuestasProtegidas,
      },
    },
  },
  '/usuarios/{id}': {
    put: {
      tags: ['Usuarios'],
      summary: 'Modificar un usuario',
      description:
        'Permite cambiar nombre, correo y rol (`rol_id`: 1 = Administrador, 2 = Cliente, 3 = Vendedor). '
        + 'Solo el Administrador puede usar esta ruta.',
      security: seguridad,
      parameters: [parametroId],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ActualizarUsuarioRequest' } } },
      },
      responses: {
        200: respuestaUsuario('Usuario actualizado'),
        400: respuestaError('Id o datos inválidos', 'El formato del correo no es válido'),
        404: respuestaError('El usuario no existe', 'Usuario no encontrado'),
        409: respuestaError('Conflicto con los datos existentes', 'El correo ya está registrado'),
        ...respuestasProtegidas,
      },
    },
    delete: {
      tags: ['Usuarios'],
      summary: 'Desactivar un usuario',
      description: 'Eliminación lógica: el usuario queda `activo = false` y ya no puede iniciar sesión.',
      security: seguridad,
      parameters: [parametroId],
      responses: {
        200: respuestaUsuario('Usuario desactivado correctamente'),
        400: respuestaError('Id inválido', 'El id debe ser un número entero positivo'),
        404: respuestaError('El usuario no existe', 'Usuario no encontrado'),
        ...respuestasProtegidas,
      },
    },
  },
};
