const {
  parametroProductoId,
  respuestaError,
  respuestaProducto,
  respuestasProtegidas,
  seguridad,
} = require('./helpers');

module.exports = {
  '/catalogo': {
    get: {
      tags: ['Catálogo'],
      summary: 'Listar productos activos',
      responses: {
        200: {
          description: 'Lista de productos activos',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Producto' },
              },
            },
          },
        },
        500: respuestasProtegidas[500],
      },
    },
    post: {
      tags: ['Catálogo'],
      summary: 'Crear un producto',
      description: 'Solo el Administrador puede crear productos.',
      security: seguridad,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CrearProductoRequest' },
          },
        },
      },
      responses: {
        201: respuestaProducto('Producto creado exitosamente'),
        400: respuestaError('Datos inválidos o faltantes', 'stock y precio deben ser enteros mayores o iguales a cero'),
        401: respuestasProtegidas[401],
        403: respuestasProtegidas[403],
        409: respuestaError('Ya existe un producto con ese id', 'Ya existe un producto con ese id'),
        500: respuestasProtegidas[500],
      },
    },
  },
  '/catalogo/{id}': {
    get: {
      tags: ['Catálogo'],
      summary: 'Obtener un producto',
      parameters: [parametroProductoId],
      responses: {
        200: {
          description: 'Producto encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Producto' },
            },
          },
        },
        404: respuestaError('El producto no existe o está inactivo', 'Producto no encontrado'),
        500: respuestasProtegidas[500],
      },
    },
    put: {
      tags: ['Catálogo'],
      summary: 'Actualizar un producto',
      description: 'Solo el Administrador puede actualizar productos.',
      security: seguridad,
      parameters: [parametroProductoId],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ActualizarProductoRequest' },
          },
        },
      },
      responses: {
        200: respuestaProducto('Producto actualizado'),
        400: respuestaError('Datos inválidos o faltantes', 'Debe enviar al menos un campo para actualizar'),
        401: respuestasProtegidas[401],
        403: respuestasProtegidas[403],
        404: respuestaError('El producto no existe', 'Producto no encontrado'),
        500: respuestasProtegidas[500],
      },
    },
    delete: {
      tags: ['Catálogo'],
      summary: 'Desactivar un producto',
      description: 'Eliminación lógica: marca el producto como inactivo. Solo el Administrador puede usar esta ruta.',
      security: seguridad,
      parameters: [parametroProductoId],
      responses: {
        200: respuestaProducto('Producto desactivado correctamente'),
        401: respuestasProtegidas[401],
        403: respuestasProtegidas[403],
        404: respuestaError('El producto no existe', 'Producto no encontrado'),
        500: respuestasProtegidas[500],
      },
    },
  },
  '/catalogo/{id}/activar': {
    patch: {
      tags: ['Catálogo'],
      summary: 'Activar un producto',
      description: 'Reactiva un producto previamente desactivado. Solo el Administrador puede usar esta ruta.',
      security: seguridad,
      parameters: [parametroProductoId],
      responses: {
        200: respuestaProducto('Producto activado correctamente'),
        401: respuestasProtegidas[401],
        403: respuestasProtegidas[403],
        404: respuestaError('El producto no existe', 'Producto no encontrado'),
        500: respuestasProtegidas[500],
      },
    },
  },
};
