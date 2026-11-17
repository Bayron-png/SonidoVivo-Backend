const pool = require('../config/db');

const buscarUsuarioPorCorreo = async (correo) => {
  const result = await pool.query(
    'SELECT id FROM usuarios WHERE correo = $1',
    [correo]
  );
  return result.rows[0] || null;
};

const buscarRolCliente = async () => {
  const result = await pool.query(
    "SELECT id, nombre FROM roles WHERE nombre = 'Cliente'"
  );
  return result.rows[0] || null;
};

const crearUsuario = async ({ nombre, correo, passwordHash, rolId }) => {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, correo, rol_id, activo, creado_en`,
    [nombre, correo, passwordHash, rolId]
  );
  return result.rows[0];
};

const buscarUsuarioActivoPorCorreo = async (correo) => {
  const result = await pool.query(
    `SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol_id, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id
     WHERE u.correo = $1 AND u.activo = TRUE`,
    [correo]
  );
  return result.rows[0] || null;
};

module.exports = {
  buscarUsuarioPorCorreo,
  buscarRolCliente,
  crearUsuario,
  buscarUsuarioActivoPorCorreo,
};
