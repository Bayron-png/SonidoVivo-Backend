const express = require('express');
const router = express.Router();
const {
  listarProductos,
  obtenerProducto,
} = require('../controller/catalogo.controller');

router.get('/', listarProductos);
router.get('/:id', obtenerProducto);

module.exports = router;
