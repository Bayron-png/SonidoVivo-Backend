const express = require('express');
const router = express.Router();

const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
} = require('../controller/catalogo.controller');

const {
  verificarToken,
  autorizarRoles
} = require('../middleware/auth.middleware');

router.get('/', listarProductos);
router.get('/:id', obtenerProducto);

router.use(
  verificarToken,
  autorizarRoles('Administrador')
);

router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', desactivarProducto);

module.exports = router;