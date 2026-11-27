const {
  respuestaError,
  respuestasProtegidas,
  seguridad
} = require('./helpers');

const contenidoJson = (schema) => ({
  'application/json': { schema }
});

const respuesta = (description, schema) => ({
  description,
  content: contenidoJson(schema)
});

const cuerpo = (schema) => ({
  required: true,
  content: contenidoJson(schema)
});

const parametroPedidoId = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID numérico del pedido',
  schema: {
    type: 'integer',
    minimum: 1,
    maximum: 2147483647,
    example: 1
  }
};

const detalleSchema = {
  type: 'object',
  properties: {
    productoId: { type: 'string', example: 'GA001' },
    cantidad: { type: 'integer', example: 1 },
    precioUnitario: { type: 'integer', example: 129990 },
    subtotal: { type: 'integer', example: 129990 }
  }
};

const pedidoSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    usuario_id: { type: 'integer', example: 6 },
    cliente_nombre: { type: 'string', example: 'Cliente de Prueba' },
    cliente_correo: {
      type: 'string',
      format: 'email',
      example: 'cliente@sonidovivo.local'
    },
    estado: {
      type: 'string',
      enum: [
        'Pendiente',
        'Confirmado',
        'Enviado',
        'Entregado',
        'Cancelado'
      ]
    },
    tipo_envio: {
      type: 'string',
      enum: ['retiro', 'domicilio']
    },
    costo_envio: { type: 'integer', example: 0 },
    total: { type: 'integer', example: 129990 },
    creado_en: { type: 'string', format: 'date-time' },
    actualizado_en: { type: 'string', format: 'date-time' },
    detalles: {
      type: 'array',
      items: detalleSchema
    }
  }
};

const pedidoRespuesta = {
  type: 'object',
  properties: {
    mensaje: { type: 'string' },
    pedido: pedidoSchema
  }
};

const pedidosRespuesta = {
  type: 'object',
  properties: {
    pedidos: {
      type: 'array',
      items: pedidoSchema
    }
  }
};

module.exports = {
  '/pedidos': {
    post: {
      tags: ['Pedidos'],
      summary: 'Crear un pedido',
      description:
        'Solo Cliente. Calcula los precios desde PostgreSQL, '
        + 'descuenta stock en una transacción y rechaza stock '
        + 'insuficiente con HTTP 409.',
      security: seguridad,
      requestBody: cuerpo({
        type: 'object',
        required: ['items'],
        additionalProperties: false,
        properties: {
          tipoEnvio: {
            type: 'string',
            enum: ['retiro', 'domicilio'],
            default: 'retiro'
          },
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            description: 'No se permiten productos duplicados.',
            items: {
              type: 'object',
              required: ['productoId', 'cantidad'],
              additionalProperties: false,
              properties: {
                productoId: {
                  type: 'string',
                  maxLength: 20,
                  example: 'GA001'
                },
                cantidad: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 2147483647,
                  example: 1
                }
              }
            }
          }
        }
      }),
      responses: {
        201: respuesta('Pedido creado', pedidoRespuesta),
        400: respuestaError('Datos inválidos', 'Cantidad inválida'),
        404: respuestaError(
          'Producto no disponible',
          'Producto no disponible: GA001'
        ),
        409: respuestaError(
          'Stock insuficiente',
          'Stock insuficiente para GA001'
        ),
        ...respuestasProtegidas
      }
    },

    get: {
      tags: ['Pedidos'],
      summary: 'Listar todos los pedidos',
      description: 'Solo Administrador y Vendedor.',
      security: seguridad,
      responses: {
        200: respuesta('Listado de pedidos', pedidosRespuesta),
        ...respuestasProtegidas
      }
    }
  },

  '/pedidos/mios': {
    get: {
      tags: ['Pedidos'],
      summary: 'Consultar mis pedidos',
      description:
        'Solo Cliente. El ID del usuario se obtiene del JWT; '
        + 'no se recibe desde el navegador.',
      security: seguridad,
      responses: {
        200: respuesta('Historial del cliente', pedidosRespuesta),
        ...respuestasProtegidas
      }
    }
  },

  '/pedidos/{id}': {
    get: {
      tags: ['Pedidos'],
      summary: 'Obtener el detalle de un pedido',
      description:
        'El Cliente solo puede consultar sus pedidos. '
        + 'Administrador y Vendedor pueden consultar cualquiera. '
        + 'Un pedido ajeno devuelve 404.',
      security: seguridad,
      parameters: [parametroPedidoId],
      responses: {
        200: respuesta('Pedido encontrado', pedidoRespuesta),
        400: respuestaError('ID inválido', 'ID de pedido inválido'),
        404: respuestaError(
          'Pedido inexistente o sin acceso',
          'Pedido no encontrado'
        ),
        ...respuestasProtegidas
      }
    },

    delete: {
      tags: ['Pedidos'],
      summary: 'Cancelar un pedido',
      description:
        'Eliminación lógica. El Cliente puede cancelar sus propios '
        + 'pedidos; Administrador y Vendedor pueden cancelar cualquiera. '
        + 'Solo permite cancelar pedidos Pendiente o Confirmado. '
        + 'Devuelve el stock en una transacción.',
      security: seguridad,
      parameters: [parametroPedidoId],
      responses: {
        200: respuesta('Pedido cancelado', pedidoRespuesta),
        400: respuestaError('ID inválido', 'ID de pedido inválido'),
        404: respuestaError('Pedido no encontrado', 'Pedido no encontrado'),
        409: respuestaError(
          'Cancelación no permitida',
          'No se puede cambiar de Cancelado a Cancelado'
        ),
        ...respuestasProtegidas
      }
    }
  },

  '/pedidos/{id}/estado': {
    patch: {
      tags: ['Pedidos'],
      summary: 'Actualizar el estado de un pedido',
      description:
        'Solo Administrador y Vendedor. Transiciones permitidas: '
        + 'Pendiente a Confirmado o Cancelado; '
        + 'Confirmado a Enviado o Cancelado; '
        + 'Enviado a Entregado. '
        + 'Entregado y Cancelado son estados finales.',
      security: seguridad,
      parameters: [parametroPedidoId],
      requestBody: cuerpo({
        type: 'object',
        required: ['estado'],
        additionalProperties: false,
        properties: {
          estado: {
            type: 'string',
            enum: [
              'Confirmado',
              'Enviado',
              'Entregado',
              'Cancelado'
            ],
            example: 'Confirmado'
          }
        }
      }),
      responses: {
        200: respuesta('Estado actualizado', pedidoRespuesta),
        400: respuestaError(
          'Estado o ID inválido',
          'Debe enviar únicamente un estado válido'
        ),
        404: respuestaError('Pedido no encontrado', 'Pedido no encontrado'),
        409: respuestaError(
          'Transición no permitida',
          'No se puede cambiar de Cancelado a Confirmado'
        ),
        ...respuestasProtegidas
      }
    }
  }
};