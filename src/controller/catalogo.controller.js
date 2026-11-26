const catalogoService = require('../service/catalogo.service');

const manejarError = (error, res, operacion) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`Error al ${operacion}:`, error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

const listarProductos = async (req, res) => {
  try {
    const productos = await catalogoService.listarProductos();
    return res.json(productos);
  } catch (error) {
    console.error('Error al listar productos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerProducto = async (req, res) => {
  try {
    const producto = await catalogoService.obtenerProducto(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearProducto = async (req, res) => {
  try {
    const producto = await catalogoService.crearProducto(req.body);
    return res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      producto,
    });
  } catch (error) {
    return manejarError(error, res, 'crear producto');
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const producto = await catalogoService.actualizarProducto(
      req.params.id,
      req.body
    );
    return res.json({
      mensaje: 'Producto actualizado',
      producto,
    });
  } catch (error) {
    return manejarError(error, res, 'actualizar producto');
  }
};

const desactivarProducto = async (req, res) => {
  try {
    const producto = await catalogoService.desactivarProducto(req.params.id);
    return res.json({
      mensaje: 'Producto desactivado correctamente',
      producto,
    });
  } catch (error) {
    return manejarError(error, res, 'desactivar producto');
  }
};

const activarProducto = async (req, res) => {
  try {
    const producto = await catalogoService.activarProducto(req.params.id);
    return res.json({
      mensaje: 'Producto activado correctamente',
      producto,
    });
  } catch (error) {
    return manejarError(error, res, 'activar producto');
  }
};

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto,
};
