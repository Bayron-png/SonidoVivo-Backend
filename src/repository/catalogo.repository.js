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

const existeProducto = async (id) => {
  const result = await pool.query(
    'SELECT id FROM productos WHERE id = $1',
    [id]
  );
  return Boolean(result.rows[0]);
};

const crearProducto = async (producto) => {
  const result = await pool.query(
    `INSERT INTO productos (
       id, nombre, categoria, categoria_slug, marca, modelo,
       stock, precio, descripcion, imagen
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, nombre, categoria, categoria_slug, marca, modelo,
               stock, precio, descripcion, imagen, activo`,
    [
      producto.id,
      producto.nombre,
      producto.categoria,
      producto.categoriaSlug,
      producto.marca,
      producto.modelo,
      producto.stock,
      producto.precio,
      producto.descripcion,
      producto.imagen,
    ]
  );
  return result.rows[0];
};

const actualizarProducto = async (id, cambios) => {
  const result = await pool.query(
    `UPDATE productos
     SET nombre = COALESCE($1, nombre),
         categoria = COALESCE($2, categoria),
         categoria_slug = COALESCE($3, categoria_slug),
         marca = COALESCE($4, marca),
         modelo = COALESCE($5, modelo),
         stock = COALESCE($6, stock),
         precio = COALESCE($7, precio),
         descripcion = COALESCE($8, descripcion),
         imagen = COALESCE($9, imagen),
         activo = COALESCE($10, activo)
     WHERE id = $11
     RETURNING id, nombre, categoria, categoria_slug, marca, modelo,
               stock, precio, descripcion, imagen, activo`,
    [
      cambios.nombre,
      cambios.categoria,
      cambios.categoriaSlug,
      cambios.marca,
      cambios.modelo,
      cambios.stock,
      cambios.precio,
      cambios.descripcion,
      cambios.imagen,
      cambios.activo,
      id,
    ]
  );
  return result.rows[0] || null;
};

const desactivarProducto = async (id) => {
  const result = await pool.query(
    `UPDATE productos
     SET activo = FALSE
     WHERE id = $1
     RETURNING id, nombre, categoria, categoria_slug, marca, modelo,
               stock, precio, descripcion, imagen, activo`,
    [id]
  );
  return result.rows[0] || null;
};

const activarProducto = async (id) => {
  const result = await pool.query(
    `UPDATE productos
     SET activo = TRUE
     WHERE id = $1
     RETURNING id, nombre, categoria, categoria_slug, marca, modelo,
               stock, precio, descripcion, imagen, activo`,
    [id]
  );
  return result.rows[0] || null;
};

const actualizarStock = async (id, stock) => {
  const result = await pool.query(
    `UPDATE productos
     SET stock = $1
     WHERE id = $2 AND activo = TRUE
     RETURNING id, nombre, categoria, categoria_slug,
               marca, modelo, stock, precio,
               descripcion, imagen, activo`,
    [stock, id]
  );

  return result.rows[0] || null;
};

module.exports = {
  listarProductos,
  obtenerProducto,
  existeProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto,
  actualizarStock,
};
