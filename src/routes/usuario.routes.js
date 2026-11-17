const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controller/usuario.controller');

router.get('/', listarUsuarios);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;