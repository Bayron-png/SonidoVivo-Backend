const pool = require('../config/db');

const listarUsuarios = async () => {
  const result = await pool.query(
    `SELECT u.id, u.nombre, u.correo, r.nombre AS rol, u.activo, u.creado_en
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id
     ORDER BY u.id ASC`
  );
  return result.rows;
};

const obtenerUsuarioPorId = async (id) => {
  const result = await pool.query(
    `SELECT
       u.id,
       u.nombre,
       u.correo,
       u.rol_id,
       r.nombre AS rol,
       u.activo,
       u.creado_en
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id
     WHERE u.id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

const crearUsuario = async ({ nombre, correo, passwordHash, rolId }) => {
  const result = await pool.query(
    `WITH nuevo_usuario AS (
       INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, correo, rol_id, activo, creado_en
     )
     SELECT
       u.id,
       u.nombre,
       u.correo,
       u.rol_id,
       r.nombre AS rol,
       u.activo,
       u.creado_en
     FROM nuevo_usuario u
     INNER JOIN roles r ON u.rol_id = r.id`,
    [nombre, correo, passwordHash, rolId]
  );

  return result.rows[0];
};


const actualizarUsuario = async (id, { nombre, correo, rol_id }) => {
  const result = await pool.query(
    `UPDATE usuarios
     SET nombre = COALESCE($1, nombre),
         correo = COALESCE($2, correo),
         rol_id = COALESCE($3, rol_id)
     WHERE id = $4
     RETURNING id, nombre, correo, rol_id, activo`,
    [nombre, correo, rol_id, id]
  );
  return result.rows[0] || null;
};

const desactivarUsuario = async (id) => {
  const result = await pool.query(
    'UPDATE usuarios SET activo = FALSE WHERE id = $1 RETURNING id, correo, activo',
    [id]
  );
  return result.rows[0] || null;
};

const activarUsuario = async (id) => {
  const result = await pool.query(
    'UPDATE usuarios SET activo = TRUE WHERE id = $1 RETURNING id, correo, activo',
    [id]
  );
  return result.rows[0] || null;
};

const existeRol = async (id) => {
  const result = await pool.query(
    'SELECT 1 FROM roles WHERE id = $1',
    [id]
  );

  return result.rowCount > 0;
};

module.exports = {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
  existeRol,
};
