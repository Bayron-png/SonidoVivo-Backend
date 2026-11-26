const {
  respuestaError,
  respuestasProtegidas,
  respuestaUsuario,
} = require('./helpers');

module.exports = {
  '/auth/register': {
    post: {
      tags: ['Autenticación'],
      summary: 'Registrar un usuario',
      description: 'Crea un usuario con rol **Cliente**. El rol lo asigna siempre el servidor.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistroRequest' } } },
      },
      responses: {
        201: respuestaUsuario('Usuario registrado exitosamente'),
        400: respuestaError('Datos inválidos o faltantes', 'El formato del correo no es válido'),
        409: respuestaError('El correo ya está registrado', 'El correo ya está registrado'),
        500: respuestasProtegidas[500],
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Autenticación'],
      summary: 'Iniciar sesión',
      description: 'Devuelve un JWT con vigencia (por defecto 2 horas).',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
      },
      responses: {
        200: {
          description: 'Inicio de sesión exitoso',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRespuesta' } } },
        },
        400: respuestaError('Faltan correo o contraseña', 'Debe ingresar correo y contraseña'),
        401: respuestaError('Credenciales incorrectas (mensaje genérico)', 'Credenciales inválidas'),
        500: respuestasProtegidas[500],
      },
    },
  },
};
