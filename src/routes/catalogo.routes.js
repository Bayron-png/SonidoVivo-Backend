const express = require('express');
const router = express.Router();
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto,
} = require('../controller/catalogo.controller');
const { verificarTokenAdmin } = require('../middleware/auth.middleware');

router.get('/', listarProductos);
router.get('/:id', obtenerProducto);
router.post('/', verificarTokenAdmin, crearProducto);
router.put('/:id', verificarTokenAdmin, actualizarProducto);
router.delete('/:id', verificarTokenAdmin, desactivarProducto);
router.patch('/:id/activar', verificarTokenAdmin, activarProducto);

module.exports = router;
