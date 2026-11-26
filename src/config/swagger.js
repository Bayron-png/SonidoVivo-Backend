const authPaths = require('./swagger/auth');
const usuarioPaths = require('./swagger/usuarios');
const catalogoPaths = require('./swagger/catalogo');

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
    { name: 'Catálogo', description: 'Consulta pública y gestión de productos (gestión solo Administrador)' },
  ],
  paths: {
    ...authPaths,
    ...usuarioPaths,
    ...catalogoPaths,
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
      CrearProductoRequest: {
        type: 'object',
        required: [
          'id',
          'nombre',
          'categoria',
          'categoriaSlug',
          'marca',
          'modelo',
          'stock',
          'precio',
          'imagen',
        ],
        properties: {
          id: { type: 'string', example: 'GTR-001' },
          nombre: { type: 'string', example: 'Guitarra eléctrica' },
          categoria: { type: 'string', example: 'Guitarras' },
          categoriaSlug: { type: 'string', example: 'guitarras' },
          marca: { type: 'string', example: 'Fender' },
          modelo: { type: 'string', example: 'Player Stratocaster' },
          stock: { type: 'integer', minimum: 0, example: 10 },
          precio: { type: 'integer', minimum: 0, example: 799990 },
          descripcion: { type: 'string', example: 'Guitarra eléctrica de seis cuerdas' },
          imagen: { type: 'string', example: 'https://sonidovivo.cl/images/gtr-001.jpg' },
        },
      },
      ActualizarProductoRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          nombre: { type: 'string', example: 'Guitarra eléctrica' },
          categoria: { type: 'string', example: 'Guitarras' },
          categoriaSlug: { type: 'string', example: 'guitarras' },
          marca: { type: 'string', example: 'Fender' },
          modelo: { type: 'string', example: 'Player Stratocaster' },
          stock: { type: 'integer', minimum: 0, example: 10 },
          precio: { type: 'integer', minimum: 0, example: 799990 },
          descripcion: { type: 'string', example: 'Guitarra eléctrica de seis cuerdas' },
          imagen: { type: 'string', example: 'https://sonidovivo.cl/images/gtr-001.jpg' },
          activo: { type: 'boolean', example: true },
        },
      },
      Producto: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'GTR-001' },
          nombre: { type: 'string', example: 'Guitarra eléctrica' },
          categoria: { type: 'string', example: 'Guitarras' },
          categoria_slug: { type: 'string', example: 'guitarras' },
          marca: { type: 'string', example: 'Fender' },
          modelo: { type: 'string', example: 'Player Stratocaster' },
          stock: { type: 'integer', example: 10 },
          precio: { type: 'integer', example: 799990 },
          descripcion: { type: 'string', example: 'Guitarra eléctrica de seis cuerdas' },
          imagen: { type: 'string', example: 'https://sonidovivo.cl/images/gtr-001.jpg' },
          activo: { type: 'boolean', example: true },
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
