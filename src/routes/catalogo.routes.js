const express = require('express');
const router = express.Router();

const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto,
  actualizarStock,
} = require('../controller/catalogo.controller');

const {
  verificarToken,
  autorizarRoles
} = require('../middleware/auth.middleware');

router.get('/', listarProductos);
router.get('/:id', obtenerProducto);

router.patch(
  '/:id/stock',
  verificarToken,
  autorizarRoles('Administrador', 'Vendedor'),
  actualizarStock
);

router.use(
  verificarToken,
  autorizarRoles('Administrador')
);

router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', desactivarProducto);
router.patch('/:id/activar', activarProducto);

module.exports = router;