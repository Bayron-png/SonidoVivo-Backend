const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controller/usuario.controller');
const { verificarTokenAdmin } = require('../middleware/auth.middleware');

router.use(verificarTokenAdmin);
router.get('/', listarUsuarios);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;