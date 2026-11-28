const pedidoRepository = require('../repository/pedido.repository');
const AppError = require('./app-error');

const COSTO_ENVIO_DOMICILIO = 3500;

const crearPedido = async (usuarioId, datos) => {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError('Usuario no autenticado', 401);
    }

    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        throw new AppError('Debe enviar un pedido válido', 400);
    }

    const camposPermitidos = ['items', 'tipoEnvio'];

    if (
        Object.keys(datos).some(
            campo => !camposPermitidos.includes(campo)
        )
    ) {
        throw new AppError('Campos de pedido inválidos', 400);
    }

    const { items } = datos;
    const tipoEnvio = datos.tipoEnvio ?? 'retiro';

    if (!['retiro', 'domicilio'].includes(tipoEnvio)) {
        throw new AppError('Tipo de envío inválido', 400);
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
        throw new AppError(
            'El pedido debe contener entre 1 y 50 productos',
            400
        );
    }

    const productosRegistrados = new Set();

    const itemsValidados = items.map(item => {
        if (
            !item ||
            typeof item !== 'object' ||
            Array.isArray(item) ||
            Object.keys(item).length !== 2 ||
            !Object.hasOwn(item, 'productoId') ||
            !Object.hasOwn(item, 'cantidad')
        ) {
            throw new AppError('Datos de producto inválidos', 400);
        }

        if (
            typeof item.productoId !== 'string' ||
            !item.productoId.trim() ||
            item.productoId.trim().length > 20
        ) {
            throw new AppError('ID de producto inválido', 400);
        }

        if (
            !Number.isSafeInteger(item.cantidad) ||
            item.cantidad <= 0 ||
            item.cantidad > 2147483647
        ) {
            throw new AppError('La cantidad debe ser un entero positivo', 400);
        }

        const productoId = item.productoId.trim().toUpperCase();

        if (productosRegistrados.has(productoId)) {
            throw new AppError(
                'No puede repetir un producto en el pedido',
                400
            );
        }

        productosRegistrados.add(productoId);

        return {
            productoId,
            cantidad: item.cantidad
        };
    });

    const costoEnvio =
        tipoEnvio === 'domicilio' ? COSTO_ENVIO_DOMICILIO : 0;

    try {
        return await pedidoRepository.crearPedido({
            usuarioId,
            items: itemsValidados,
            tipoEnvio,
            costoEnvio
        });
    } catch (error) {
        if (error.codigo === 'STOCK_INSUFICIENTE') {
            throw new AppError(error.message, 409);
        }

        if (error.codigo === 'PRODUCTO_NO_DISPONIBLE') {
            throw new AppError(error.message, 404);
        }

        if (error.codigo === 'TOTAL_INVALIDO') {
            throw new AppError(error.message, 400);
        }

        throw error;
    }
};

const listarMisPedidos = async (usuarioId) => {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError('Usuario inválido', 401);
    }

    return pedidoRepository.listarPedidosPorUsuario(usuarioId);
};

const obtenerPedido = async (id, usuario) => {
    if (
        typeof id !== 'string' ||
        !/^[1-9]\d*$/.test(id) ||
        Number(id) > 2147483647
    ) {
        throw new AppError('ID de pedido inválido', 400);
    }

    const puedeVerTodos = [
        'Administrador',
        'Vendedor'
    ].includes(usuario.rol);

    const pedido = await pedidoRepository.buscarPedidoPorId(
        Number(id),
        usuario.id,
        puedeVerTodos
    );

    if (!pedido) {
        throw new AppError('Pedido no encontrado', 404);
    }

    return pedido;
};

const listarPedidos = async () => {
    return pedidoRepository.listarPedidos();
};

const cambiarEstadoPedido = async (id, datos) => {
    if (
        typeof id !== 'string' ||
        !/^[1-9]\d*$/.test(id) ||
        Number(id) > 2147483647
    ) {
        throw new AppError('ID de pedido inválido', 400);
    }

    const estadosPermitidos = [
        'Pendiente',
        'Confirmado',
        'Enviado',
        'Entregado',
        'Cancelado'
    ];

    if (
        !datos ||
        typeof datos !== 'object' ||
        Array.isArray(datos) ||
        Object.keys(datos).length !== 1 ||
        !Object.hasOwn(datos, 'estado') ||
        !estadosPermitidos.includes(datos.estado)
    ) {
        throw new AppError(
            'Debe enviar únicamente un estado válido',
            400
        );
    }

    try {
        return await pedidoRepository.cambiarEstadoPedido(
            Number(id),
            datos.estado
        );
    } catch (error) {
        if (error.codigo === 'PEDIDO_NO_ENCONTRADO') {
            throw new AppError(error.message, 404);
        }

        if (
            error.codigo === 'TRANSICION_INVALIDA' ||
            error.codigo === 'STOCK_RESTAURACION_INVALIDA'
        ) {
            throw new AppError(error.message, 409);
        }

        throw error;
    }
};

const eliminarPedido = async (id, usuario) => {
  // Verificar que el pedido exista y que el usuario pueda acceder.
  await obtenerPedido(id, usuario);

  // Reutilizar la cancelación transaccional.
  return cambiarEstadoPedido(id, {
    estado: 'Cancelado'
  });
};

module.exports = {
    crearPedido,
    listarMisPedidos,
    obtenerPedido,
    listarPedidos,
    cambiarEstadoPedido,
    eliminarPedido
};