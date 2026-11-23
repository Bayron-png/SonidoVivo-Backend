const express = require('express');
const router = express.Router();
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
} = require('../controller/catalogo.controller');
const { verificarTokenAdmin } = require('../middleware/auth.middleware');

router.get('/', listarProductos);
router.get('/:id', obtenerProducto);
router.post('/', verificarTokenAdmin, crearProducto);
router.put('/:id', verificarTokenAdmin, actualizarProducto);
router.delete('/:id', verificarTokenAdmin, desactivarProducto);

module.exports = router;
