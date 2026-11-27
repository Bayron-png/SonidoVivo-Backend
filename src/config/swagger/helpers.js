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

const parametroProductoId = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id del producto',
  schema: { type: 'string', example: 'GTR-001' },
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

const respuestaProducto = (mensaje) => ({
  description: mensaje,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          mensaje: { type: 'string', example: mensaje },
          producto: { $ref: '#/components/schemas/Producto' },
        },
      },
    },
  },
});

module.exports = {
  parametroId,
  parametroProductoId,
  respuestaError,
  respuestaProducto,
  respuestasProtegidas,
  respuestaUsuario,
  seguridad,
};
