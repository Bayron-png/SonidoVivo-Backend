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
    post: {
      tags: ['Usuarios'],
      summary: 'Crear usuario como administrador',
      description: 'Crea un usuario y permite seleccionar un rol existente.',
      security: seguridad,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CrearUsuarioAdminRequest'
            }
          }
        }
      },
      responses: {
        201: respuestaUsuario('Usuario creado correctamente'),
        400: respuestaError('Datos inválidos', 'El rol no existe'),
        409: respuestaError('Correo duplicado', 'El correo ya está registrado'),
        ...respuestasProtegidas
      }
    },
  },
  '/usuarios/{id}': {

    get: {
      tags: ['Usuarios'],
      summary: 'Obtener usuario por ID',
      description: 'Consulta los datos de un usuario, incluyendo cuentas desactivadas.',
      security: seguridad,
      parameters: [parametroId],
      responses: {
        200: {
          description: 'Usuario encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Usuario'
              }
            }
          }
        },
        400: respuestaError('ID inválido', 'El ID debe ser un entero positivo'),
        404: respuestaError('Usuario inexistente', 'Usuario no encontrado'),
        ...respuestasProtegidas
      }
    },

    put: {
      tags: ['Usuarios'],
      summary: 'Modificar un usuario',
      description:
        'Permite cambiar nombre, correo y rol. El rol debe existir en PostgreSQL. '
        + 'Actualmente están disponibles Administrador y Cliente; Vendedor se incorporará posteriormente. '
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
  '/usuarios/{id}/activar': {
    patch: {
      tags: ['Usuarios'],
      summary: 'Activar un usuario',
      description: 'Reactiva un usuario previamente desactivado. Solo el Administrador puede usar esta ruta.',
      security: seguridad,
      parameters: [parametroId],
      responses: {
        200: respuestaUsuario('Usuario activado correctamente'),
        400: respuestaError('Id inválido', 'El ID debe ser un entero positivo'),
        404: respuestaError('El usuario no existe', 'Usuario no encontrado'),
        ...respuestasProtegidas,
      },
    },
  },
};
