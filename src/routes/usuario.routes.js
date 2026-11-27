const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  activarUsuario,
} = require('../controller/usuario.controller');

const {
  verificarToken,
  autorizarRoles
} = require('../middleware/auth.middleware');

router.use(
  verificarToken,
  autorizarRoles('Administrador')
);

router.get('/', listarUsuarios);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);
router.patch('/:id/activar', activarUsuario);

module.exports = router;