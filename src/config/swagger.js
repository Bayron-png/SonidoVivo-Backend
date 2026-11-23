const respuestaError = (descripcion, ejemplo) => ({
  description: descripcion,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
      example: { error: ejemplo },
    },
  },
});

const respuestasProtegidas = {
  401: respuestaError('Sin token, token alterado, vencido o usuario desactivado', 'Token inválido'),
  403: respuestaError('El rol del usuario no tiene permiso', 'No tiene permisos para esta operación'),
  500: respuestaError('Error interno del servidor', 'Error interno del servidor'),
};

const parametroId = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id numérico del usuario',
  schema: { type: 'integer', minimum: 1, example: 2 },
};

const seguridad = [{ bearerAuth: [] }];

const respuestaUsuario = (mensaje) => ({
  description: mensaje,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          mensaje: { type: 'string', example: mensaje },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
      },
    },
  },
});

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Sonido Vivo',
    version: '1.0.0',
    description:
      'API REST de la tienda de instrumentos Sonido Vivo.\n\n'
      + '**Cómo probar rutas protegidas:** ejecute `POST /auth/login`, copie el `token` '
      + 'de la respuesta, pulse **Authorize** y péguelo (solo el token, sin la palabra Bearer). '
      + 'Las rutas de `/usuarios` exigen el rol **Administrador**.',
  },
  servers: [{ url: '/api/v1', description: 'Servidor actual' }],
  tags: [
    { name: 'Autenticación', description: 'Registro e inicio de sesión (rutas públicas)' },
    { name: 'Usuarios', description: 'Gestión de usuarios (solo Administrador)' },
  ],
  paths: {
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
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string' } } },
      RegistroRequest: {
        type: 'object',
        required: ['nombre', 'correo', 'password'],
        properties: {
          nombre: { type: 'string', maxLength: 100, example: 'Juan Pérez' },
          correo: { type: 'string', format: 'email', example: 'juan@correo.cl' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'Clave1234' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['correo', 'password'],
        properties: {
          correo: { type: 'string', format: 'email', example: 'juan@correo.cl' },
          password: { type: 'string', format: 'password', example: 'Clave1234' },
        },
      },
      ActualizarUsuarioRequest: {
        type: 'object',
        properties: {
          nombre: { type: 'string', example: 'Juan P. Soto' },
          correo: { type: 'string', format: 'email', example: 'juan.soto@correo.cl' },
          rol_id: { type: 'integer', example: 3 },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          nombre: { type: 'string', example: 'Juan Pérez' },
          correo: { type: 'string', example: 'juan@correo.cl' },
          rol_id: { type: 'integer', example: 2 },
          rol: { type: 'string', example: 'Cliente' },
          activo: { type: 'boolean', example: true },
          creado_en: { type: 'string', format: 'date-time' },
        },
      },
      LoginRespuesta: {
        type: 'object',
        properties: {
          mensaje: { type: 'string', example: 'Inicio de sesión exitoso' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 2 },
              nombre: { type: 'string', example: 'Juan Pérez' },
              correo: { type: 'string', example: 'juan@correo.cl' },
              rol: { type: 'string', example: 'Cliente' },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
