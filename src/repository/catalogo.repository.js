const pool = require('../config/db');

const listarProductos = async () => {
  const result = await pool.query(
    `SELECT id, nombre, categoria, categoria_slug, marca, modelo,
            stock, precio, descripcion, imagen, activo
     FROM productos
     WHERE activo = TRUE
     ORDER BY id ASC`
  );
  return result.rows;
};

const obtenerProducto = async (id) => {
  const result = await pool.query(
    `SELECT id, nombre, categoria, categoria_slug, marca, modelo,
            stock, precio, descripcion, imagen, activo
     FROM productos
     WHERE id = $1 AND activo = TRUE`,
    [id.toUpperCase()]
  );
  return result.rows[0] || null;
};

module.exports = {
  listarProductos,
  obtenerProducto,
};
