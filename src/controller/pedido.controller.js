const pedidoService = require('../service/pedido.service');

const crearPedido = async (req, res) => {
    try {
        const pedido = await pedidoService.crearPedido(
            req.usuario.id,
            req.body
        );

        return res.status(201).json({
            mensaje: 'Pedido creado correctamente',
            pedido
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }

        console.error('Error al crear pedido:', error);

        return res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

const listarMisPedidos = async (req, res, next) => {
    try {
        const pedidos = await pedidoService.listarMisPedidos(
            req.usuario.id
        );

        return res.status(200).json({
            pedidos
        });
    } catch (error) {
        return next(error);
    }
};

const obtenerPedido = async (req, res, next) => {
    try {
        const pedido = await pedidoService.obtenerPedido(
            req.params.id,
            req.usuario
        );

        return res.status(200).json({
            pedido
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }

        return next(error);
    }
};

const listarPedidos = async (req, res, next) => {
    try {
        const pedidos = await pedidoService.listarPedidos();

        return res.status(200).json({
            pedidos
        });
    } catch (error) {
        return next(error);
    }
};

const cambiarEstadoPedido = async (req, res, next) => {
    try {
        const pedido = await pedidoService.cambiarEstadoPedido(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            mensaje: 'Estado del pedido actualizado correctamente',
            pedido
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }

        return next(error);
    }
};

const eliminarPedido = async (req, res, next) => {
  try {
    const pedido = await pedidoService.eliminarPedido(
      req.params.id,
      req.usuario
    );

    return res.status(200).json({
      mensaje: 'Pedido cancelado correctamente',
      pedido
    });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }

    return next(error);
  }
};

module.exports = {
    crearPedido,
    listarMisPedidos,
    obtenerPedido,
    listarPedidos,
    cambiarEstadoPedido,
    eliminarPedido
};