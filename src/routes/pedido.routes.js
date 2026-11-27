const express = require('express');
const router = express.Router();

const {
    verificarToken,
    autorizarRoles
} = require('../middleware/auth.middleware');

const {
    crearPedido,
    listarMisPedidos,
    obtenerPedido,
    listarPedidos,
    cambiarEstadoPedido,
    eliminarPedido
} = require('../controller/pedido.controller');

router.post(
    '/',
    verificarToken,
    autorizarRoles('Cliente'),
    crearPedido
);

router.get(
    '/mios',
    verificarToken,
    autorizarRoles('Cliente'),
    listarMisPedidos
);

router.get(
    '/:id',
    verificarToken,
    autorizarRoles('Cliente', 'Administrador', 'Vendedor'),
    obtenerPedido
);

router.get(
    '/',
    verificarToken,
    autorizarRoles('Administrador', 'Vendedor'),
    listarPedidos
);

router.patch(
    '/:id/estado',
    verificarToken,
    autorizarRoles('Administrador', 'Vendedor'),
    cambiarEstadoPedido
);

router.delete(
  '/:id',
  verificarToken,
  autorizarRoles('Cliente', 'Administrador', 'Vendedor'),
  eliminarPedido
);

module.exports = router;